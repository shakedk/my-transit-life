import { useRouter } from "next/router";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { server } from "../../config";

import Head from "next/head";
import EditToggle from "../../components/editToggle";
import OpenForPrintButton from "../../components/printButton";
import PosterSizeSelector, {
  type PosterSizeOption,
} from "../../components/PosterSizeSelector";
import PosterLayout from "../../components/posters/PosterLayout";
import { createPosterInDB, getPosterIDInDB } from "../../src/lib/posters/utils";
import DesignControls, {
  type DesignConfig,
} from "../../components/DesignControls";
import PrintExportButtons from "../../components/posters/PrintExportButtons";
import OrderPrintButton from "../../components/OrderPrintButton";
import stylesGeoNoLogo from "./posterGeoNoLogo.module.css";
import stylesGeoLogo from "./posterGeoLogo.module.css";
import stylesGeoLogoHorizontal from "./posterGeoLogoHorizontal.module.css";
import stylesGeoLogoA0 from "./posterGeoLogoA0.module.css";
import stylesFullMapLogo from "./posterFullMapLogo.module.css";
import stylesBigFrameNoLogo from "./posterBigFrameNoLogo.module.css";
import DataSelector from "../../components/dataSelectors/DataSelector";
import axios from "axios";
import { getAuthAxios } from "../../src/lib/api/apiClient";
import { IPattern } from "../../src/types";
import { applyNewPosterDefaults } from "../../src/lib/posters/newPosterDefaults";

/** Parsed `routeData` JSON passed into the poster editor and layouts. */
type PosterRouteData = Record<string, unknown> & {
  patterns?: Array<{
    properties: {
      route_id: string;
      route_long_name?: string;
    };
  }>;
  stops?: Array<{
    stop_id: string;
    stop_lat: number;
    stop_lon: number;
  }>;
};

/** First string from Next.js query (handles `routeID` vs `routeId` and array duplicates). */
function firstQueryString(
  value: string | string[] | undefined
): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

/** First matching value using case-insensitive keys (e.g. PosterType vs posterType). */
function firstQueryStringCI(
  query: Record<string, string | string[] | undefined>,
  ...keyNames: string[]
): string | undefined {
  const lowerToOriginal = new Map<string, string>();
  for (const k of Object.keys(query)) {
    lowerToOriginal.set(k.toLowerCase(), k);
  }
  for (const want of keyNames) {
    const orig = lowerToOriginal.get(want.toLowerCase());
    if (orig !== undefined) {
      const v = firstQueryString(query[orig]);
      if (v) return v;
    }
  }
  return undefined;
}

/**
 * Merge `context.query` with search params from:
 * - `req.url` (sometimes has no `?` on internal /_next/data requests)
 * - `resolvedUrl` (Next.js: normalized pathname + query for this page)
 */
function mergeQueryFromRequestUrl(context: {
  query?: Record<string, string | string[] | undefined>;
  req?: { url?: string };
  resolvedUrl?: string;
}): Record<string, string | string[] | undefined> {
  const merged: Record<string, string | string[] | undefined> = {
    ...(context.query ?? {}),
  };
  const appendSearch = (search: string) => {
    try {
      const params = new URLSearchParams(search);
      params.forEach((value, key) => {
        if (merged[key] === undefined && value.length > 0) {
          merged[key] = value;
        }
      });
    } catch {
      // ignore malformed query
    }
  };
  const tryParseUrlLike = (urlLike: string) => {
    const qMark = urlLike.indexOf("?");
    if (qMark === -1) return;
    appendSearch(urlLike.slice(qMark + 1).split("#")[0]);
  };
  if (typeof context.req?.url === "string") tryParseUrlLike(context.req.url);
  if (typeof context.resolvedUrl === "string") tryParseUrlLike(context.resolvedUrl);
  return merged;
}

/** Same host/port as this request so SSR fetch hits the running dev server (not a hardcoded port). */
function apiBaseFromRequest(context: {
  req?: { headers?: Record<string, string | string[] | undefined> };
}): string | null {
  const headers = context.req?.headers;
  if (!headers) return null;
  const xfProto = headers["x-forwarded-proto"];
  const proto =
    (typeof xfProto === "string" ? xfProto.split(",")[0]?.trim() : null) ||
    "http";
  const xfHost = headers["x-forwarded-host"];
  const host =
    (typeof xfHost === "string" ? xfHost.split(",")[0]?.trim() : null) ||
    (typeof headers.host === "string" ? headers.host : null);
  if (!host) return null;
  return `${proto}://${host}`;
}

const DEFAULT_DESIGN_CONFIG = {
  backgroundColor: "#ffffff",
  pathColor: "#000000",
  tileLayerName: "",
  font: "Oswald",
  routeTitleSize: 80,
  mapZoom: 12,
  mapOpacity: 1,
  stopFontSize: 12,
  stopFontColor: "#000000",
  stopColor: "#000000",
  stopCircleSize: 8,
  stopBackgroundColor: "#ffffff",
  creditFontSize: 14,
  showStopLabels: true,
};

const MAP_CONTROL_KEYS = [
  "tileLayerName",
  "mapOpacity",
  "mapZoom",
  "mapCenterLongitude",
  "mapCenterLatitude",
  "pathColor",
  "pathWeight",
  "stopFontSize",
  "stopFontColor",
  "stopColor",
  "stopCircleSize",
  "stopBackgroundColor",
  "showStopLabels",
  "stopIDsToDisplayFromConfig",
  "isSingleDot",
  "isSimpleDot",
  "routeOverlayPatternNumber",
  "routeOverlayPatternColor",
] as const;

function mapControlDefaultsFromBase(
  baseDesign: DesignConfig | null | undefined
): Partial<DesignConfig> {
  const out: Partial<DesignConfig> = {};
  MAP_CONTROL_KEYS.forEach((key) => {
    if (baseDesign && key in baseDesign) {
      (out as Record<string, unknown>)[key] = baseDesign[key];
      return;
    }
    if (key in DEFAULT_DESIGN_CONFIG) {
      (out as Record<string, unknown>)[key] =
        DEFAULT_DESIGN_CONFIG[key as keyof typeof DEFAULT_DESIGN_CONFIG];
      return;
    }
    // Remove user override when neither route config nor app defaults define this key.
    (out as Record<string, unknown>)[key] = undefined;
  });
  return out;
}

function normalizePreviewScale(
  value: unknown
): PosterSizeOption {
  if (value === "fit") return "fit";
  if (typeof value === "string" && /^(25|33|50|66|75|100|125|150|200)$/.test(value)) {
    return value as PosterSizeOption;
  }
  return "fit";
}

export async function getServerSideProps(context) {
  const query = mergeQueryFromRequestUrl(context);
  const rawPosterType =
    firstQueryString(query.posterType) ??
    firstQueryStringCI(query, "posterType", "poster_type");
  const rawRouteID =
    firstQueryString(query.routeID ?? query.routeId) ??
    firstQueryStringCI(query, "routeID", "routeId", "route_id");
  const source =
    firstQueryString(query.source) ?? firstQueryStringCI(query, "source");
  const isTransitApi =
    source === "transit" ||
    (Array.isArray(query.source) && query.source.includes("transit"));
  const apiBase = apiBaseFromRequest(context) ?? server;

  if (!rawPosterType || !rawRouteID) {
    return {
      props: {
        missingQueryParams: true,
        routeData: null,
        routeDesignConfig: null,
        hasValidRouteData: false,
        hasValidDesignConfig: false,
      },
    };
  }

  if (isTransitApi) {
    const routeDataRes = await fetch(
      `${apiBase}/api/dataProvider/routeData?routeId=${encodeURIComponent(rawRouteID)}`
    );
    let routeDataJson: unknown = null;
    let hasValidRouteData = false;
    let routeNameFromApi: string | null = null;
    if (routeDataRes.ok) {
      try {
        const json = await routeDataRes.json() as { routeData?: unknown; routeName?: string; routeCenterHint?: { longitude: number; latitude: number } };
        routeDataJson = json;
        const dataString = json.routeData;
        if (typeof dataString === "string") {
          JSON.parse(dataString);
          hasValidRouteData = true;
        }
        if (typeof json.routeName === "string") {
          routeNameFromApi = json.routeName;
        }
      } catch {
        routeDataJson = null;
      }
    }
    const designConfigWithName = {
      ...DEFAULT_DESIGN_CONFIG,
      routeName: routeNameFromApi || String(rawRouteID),
      routeType: "",
      routeDesc: "",
    };
    const routeDesignConfigJson = {
      routeData: JSON.stringify(designConfigWithName),
    };
    return {
      props: {
        routeData: routeDataJson,
        routeDesignConfig: routeDesignConfigJson,
        hasValidRouteData,
        hasValidDesignConfig: true,
      },
    };
  }

  const [routeData, routeDesignConfig] = await Promise.all([
    fetch(`${apiBase}/api/routeData?routeID=${rawRouteID}`),
    fetch(
      `${apiBase}/api/routeDesignConfig${rawPosterType.replace(
        /poster/i,
        ""
      )}?routeID=${rawRouteID}`
    ),
  ]);

  let routeDataJson: unknown = null;
  let routeDesignConfigJson: unknown = null;
  let hasValidRouteData = false;
  let hasValidDesignConfig = false;

  if (routeData.ok) {
    routeDataJson = await routeData.json();
    const dataString = (routeDataJson as { routeData?: unknown }).routeData;
    if (typeof dataString === "string") {
      try {
        JSON.parse(dataString);
        hasValidRouteData = true;
      } catch {
        hasValidRouteData = false;
      }
    }
  } else {
    try {
      routeDataJson = await routeData.json();
    } catch {
      routeDataJson = null;
    }
  }

  if (routeDesignConfig.ok) {
    routeDesignConfigJson = await routeDesignConfig.json();
    const cfgString = (routeDesignConfigJson as { routeData?: unknown })
      .routeData;
    if (typeof cfgString === "string") {
      try {
        JSON.parse(cfgString);
        hasValidDesignConfig = true;
      } catch {
        hasValidDesignConfig = false;
      }
    }
  } else {
    try {
      routeDesignConfigJson = await routeDesignConfig.json();
    } catch {
      routeDesignConfigJson = null;
    }
  }

  return {
    props: {
      routeData: routeDataJson,
      routeDesignConfig: routeDesignConfigJson,
      hasValidRouteData,
      hasValidDesignConfig,
    }, // will be passed to the page component as props
  };
}

export default function Page(props) {
  const router = useRouter();
  const { routeID } = router.query;
  const { posterType } = router.query;
  const [missingRecoveryPending, setMissingRecoveryPending] = useState(false);
  const missingRecoveryDoneRef = useRef(false);

  useEffect(() => {
    if (
      !props.missingQueryParams ||
      missingRecoveryDoneRef.current ||
      !router.isReady
    ) {
      return;
    }
    const pathOnly = router.asPath.split("#")[0];
    const qIdx = pathOnly.indexOf("?");
    if (qIdx === -1) return;
    const sp = new URLSearchParams(pathOnly.slice(qIdx + 1));
    const pt = sp.get("posterType");
    const rid = sp.get("routeID") || sp.get("routeId");
    if (pt && rid) {
      missingRecoveryDoneRef.current = true;
      setMissingRecoveryPending(true);
      void router.replace(pathOnly, pathOnly, { scroll: false });
    }
  }, [props.missingQueryParams, router.isReady, router.asPath, router]);

  if (props.missingQueryParams) {
    return (
      <main
        style={{
          minHeight: "100vh",
          margin: "0 auto",
          padding: "56px 24px 64px",
          maxWidth: 720,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Heebo', sans-serif",
        }}
      >
        <Head>
          <title>Poster link incomplete</title>
        </Head>
        {missingRecoveryPending ? (
          <p style={{ color: "#64748b", marginBottom: 16 }}>
            Loading poster from your link…
          </p>
        ) : null}
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 600,
            marginBottom: 16,
            color: "#020617",
          }}
        >
          This poster link is missing details
        </h1>
        <p style={{ lineHeight: 1.7, color: "#4b5563", marginBottom: 20 }}>
          The poster editor needs both{" "}
          <code style={{ background: "#f1f5f9", padding: "2px 6px" }}>
            posterType
          </code>{" "}
          and{" "}
          <code style={{ background: "#f1f5f9", padding: "2px 6px" }}>
            routeID
          </code>{" "}
          in the URL. Some apps strip query parameters when you open a link; try
          copying the full URL from the address bar instead.
        </p>
        <p style={{ lineHeight: 1.7, color: "#4b5563", marginBottom: 24 }}>
          For live transit routes, include{" "}
          <code style={{ background: "#f1f5f9", padding: "2px 6px" }}>
            source=transit
          </code>
          .
        </p>
        <Link
          href="/routeSelector"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 22px",
            borderRadius: 999,
            background:
              "linear-gradient(135deg, #020617 0%, #0f172a 40%, #4338ca 100%)",
            color: "white",
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Open route selector
        </Link>
      </main>
    );
  }

  const routeDataString =
    props?.routeData && typeof props.routeData.routeData === "string"
      ? props.routeData.routeData
      : null;
  const routeCenterHint = (props?.routeData as { routeCenterHint?: { longitude: number; latitude: number } } | undefined)?.routeCenterHint;
  const routeDesignConfigString =
    props?.routeDesignConfig &&
    typeof props.routeDesignConfig.routeData === "string"
      ? props.routeDesignConfig.routeData
      : null;

  let routeData: PosterRouteData | null = null;
  let routeDesignConfig: unknown = null;

  try {
    routeData = routeDataString
      ? (JSON.parse(routeDataString) as PosterRouteData)
      : null;
  } catch {
    routeData = null;
  }

  try {
    routeDesignConfig = routeDesignConfigString
      ? JSON.parse(routeDesignConfigString)
      : null;
  } catch {
    routeDesignConfig = null;
  }

  const hasValidRouteData =
    props.hasValidRouteData && routeData !== null && routeData !== undefined;
  const hasValidDesignConfig =
    props.hasValidDesignConfig &&
    routeDesignConfig !== null &&
    routeDesignConfig !== undefined;

  const routeNameHintFromProps =
    props.routeData &&
    typeof (props.routeData as { routeName?: string }).routeName === "string"
      ? (props.routeData as { routeName: string }).routeName.trim() || undefined
      : undefined;

  if (!hasValidRouteData || !hasValidDesignConfig) {
    return (
      <main
        style={{
          minHeight: "100vh",
          margin: "0 auto",
          padding: "56px 24px 64px",
          maxWidth: 800,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Heebo', sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Head>
          <title>Poster unavailable</title>
        </Head>
        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 2.6rem)",
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: 16,
            color: "#020617",
          }}
        >
          This poster is missing data or design config.
        </h1>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "#4b5563",
            marginBottom: 24,
          }}
        >
          We couldn&apos;t load the underlying route data or design configuration
          for this combination. It may be a work‑in‑progress route or an
          internal testing layout.
        </p>
        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            marginBottom: 24,
          }}
        >
          Try picking a different layout or route from the route selector.
        </p>
        <Link
          href="/routeSelector"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 22px",
            borderRadius: 999,
            background:
              "linear-gradient(135deg, #020617 0%, #0f172a 40%, #4338ca 100%)",
            color: "white",
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.35)",
          }}
        >
          Back to route selector
        </Link>
      </main>
    );
  }

  const routeDataParsed: PosterRouteData = routeData!;

  const [isLoading, setIsLoading] = useState(true);

  const PosterTemplate = () => {
    React.useEffect(() => {
      if (
        !routeID ||
        !posterType ||
        Array.isArray(routeID) ||
        Array.isArray(posterType)
      ) {
        return;
      }

      createPosterInDB(posterType, routeID);
    }, [routeID, posterType]);
    const isPrintMode = router.query.printMode === "true";

    const [isInEditMode, setIsInEditMode] = useState(!isPrintMode);
    const previewViewportRef = useRef<HTMLDivElement>(null);
    const previewPosterRef = useRef<HTMLDivElement>(null);
    /** CSS transform scale when "Fit to screen" is selected (computed from viewport vs poster size). */
    const [fitScaleMultiplier, setFitScaleMultiplier] = useState(0.25);
    /** Unscaled poster layout size (for sizing the wrapper so scale() does not leave huge scroll gaps). */
    const [posterIntrinsicSize, setPosterIntrinsicSize] = useState({
      w: 1240,
      h: 1754,
    });
    const [posterID, setPosterID] = useState(null);
    const [isResettingStops, setIsResettingStops] = useState(false);
    const [isSavingDesign, setIsSavingDesign] = useState(false);
    const [stopDataFromDB, setStopDataFromDB] = useState({});
    // DB returneד only true/false for which pattern (route id) to display
    // Might be able to remove this down the road.
    const [displayedPatternsFromDB, setDisplayedPatternsFromDB] = useState({});
    const [patternsForSelection, setPatternsForSelection] =
      useState<IPattern[]>([]);
    const [designHistory, setDesignHistory] = useState<{
      history: DesignConfig[];
      index: number;
    }>({
      history: [routeDesignConfig as DesignConfig],
      index: 0,
    });
    const routeMapDefaultsRef = useRef<Partial<DesignConfig>>(
      mapControlDefaultsFromBase(routeDesignConfig as DesignConfig)
    );
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const pendingDesignSaveRef = useRef<DesignConfig | null>(null);
    const latestDesignConfigRef = useRef<DesignConfig>(
      routeDesignConfig as DesignConfig
    );
    const designSaveSeqRef = useRef(0);
    const currentDesignConfig: DesignConfig =
      designHistory.history[designHistory.index] ||
      (routeDesignConfig as DesignConfig);
    const previewScale = normalizePreviewScale(currentDesignConfig.previewScale);

    const syncPosterIntrinsicSize = useCallback(() => {
      const posterEl = previewPosterRef.current;
      if (!posterEl) return;
      const pw = posterEl.offsetWidth;
      const ph = posterEl.offsetHeight;
      if (pw >= 1 && ph >= 1) {
        setPosterIntrinsicSize({ w: pw, h: ph });
      }
    }, []);

    const recomputePosterFitScale = useCallback(() => {
      const vp = previewViewportRef.current;
      const posterEl = previewPosterRef.current;
      if (!vp || !posterEl) return;
      let vw = vp.clientWidth;
      let vh = vp.clientHeight;
      if (typeof window !== "undefined") {
        if (vw < 48) vw = Math.max(200, window.innerWidth - 48);
        if (vh < 48)
          vh = Math.max(200, Math.round(window.innerHeight * 0.45));
      }
      const pw = posterEl.offsetWidth;
      const ph = posterEl.offsetHeight;
      if (pw >= 1 && ph >= 1) {
        setPosterIntrinsicSize({ w: pw, h: ph });
      }
      if (pw < 1 || ph < 1) return;
      const pad = 40;
      // Fit to viewport width; tall posters scroll vertically in the preview pane.
      const scaleByWidth = (vw - pad) / pw;
      setFitScaleMultiplier(Math.max(0.02, Math.min(scaleByWidth, 4)));
    }, []);

    useLayoutEffect(() => {
      if (previewScale !== "fit" || isLoading) return;
      recomputePosterFitScale();
      const vp = previewViewportRef.current;
      const posterEl = previewPosterRef.current;
      if (!vp || !posterEl) return;
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(recomputePosterFitScale);
      });
      ro.observe(vp);
      ro.observe(posterEl);
      return () => ro.disconnect();
    }, [previewScale, isLoading, posterType, recomputePosterFitScale]);

    useLayoutEffect(() => {
      if (previewScale === "fit" || isLoading) return;
      syncPosterIntrinsicSize();
      const posterEl = previewPosterRef.current;
      if (!posterEl) return;
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(syncPosterIntrinsicSize);
      });
      ro.observe(posterEl);
      return () => ro.disconnect();
    }, [previewScale, isLoading, posterType, syncPosterIntrinsicSize]);

    /**
     * Get pattern options from routeData and selected patterns from
     * DB and turn on respective patterns
     */
    const handlePatternsOnLoad = useCallback(
      (selectedPatternsFromDB: {
        [key: string]: {
          toDisplay: boolean;
        };
      }) => {
        const allPatterns = routeDataParsed.patterns ?? [];
        if (!selectedPatternsFromDB) {
          return;
        }
        setPatternsForSelection(
          allPatterns.map((p) => ({
            patternId: p.properties.route_id,
            patternName: p.properties.route_long_name ?? "",
            toDisplay:
              selectedPatternsFromDB[p.properties.route_id]?.toDisplay ?? true,
          }))
        );

        setDisplayedPatternsFromDB(selectedPatternsFromDB || {});
      },
      [routeDataParsed]
    );
    //

    const handlePatternSelection = (
      updatedPatternsWithSelection: IPattern[]
    ) => {
      setPatternsForSelection(updatedPatternsWithSelection);

      const displayedPatterns = updatedPatternsWithSelection.reduce(
        (result, p) => {
          result[p.patternId] = { toDisplay: p.toDisplay };
          return result;
        },
        {}
      );
      setDisplayedPatternsFromDB(displayedPatterns);
      const params = {
        posterID: posterID,
        patterns: {},
      };
      Object.entries(displayedPatterns).forEach(([routeId, toDisplay]) => {
        params.patterns[routeId] = {
          toDisplay,
        };
      });
      getAuthAxios().put(`/api/poster/${posterID}`, params);
    };
    useEffect(() => {
      async function getData() {
        const qPosterType = router.query.posterType;
        const qRouteID = router.query.routeID;

        if (
          !qPosterType ||
          !qRouteID ||
          Array.isArray(qPosterType) ||
          Array.isArray(qRouteID)
        ) {
          return;
        }

        let id = await getPosterIDInDB(qPosterType, qRouteID);
        if (!id) {
          await createPosterInDB(qPosterType, qRouteID);
          id = await getPosterIDInDB(qPosterType, qRouteID);
        }

        if (!id) {
          const patterns = routeDataParsed.patterns ?? [];
          setPosterID(null);
          setStopDataFromDB({});
          if (patterns.length > 0) {
            const defaultPatterns = patterns.reduce(
              (acc, p) => {
                acc[p.properties.route_id] = { toDisplay: true };
                return acc;
              },
              {} as Record<string, { toDisplay: boolean }>
            );
            handlePatternsOnLoad(defaultPatterns);
          } else {
            setPatternsForSelection([]);
            setDisplayedPatternsFromDB({});
          }
          const newPosterDesign = applyNewPosterDefaults(
            {
              ...DEFAULT_DESIGN_CONFIG,
              ...(routeDesignConfig as DesignConfig),
            },
            routeDataParsed,
            String(qRouteID),
            { routeNameHint: routeNameHintFromProps }
          );
          setDesignHistory({
            history: [newPosterDesign],
            index: 0,
          });
          setIsLoading(false);
          return;
        }

        const res = await axios.get(`/api/poster/${id}`);
        setPosterID(id);
        setStopDataFromDB(res.data.stops || {});
        handlePatternsOnLoad(res.data.patterns);
        const designOverrides: DesignConfig =
          (res.data.designConfig as DesignConfig) || {};
        const mergedDesign: DesignConfig = {
          ...DEFAULT_DESIGN_CONFIG,
          ...(routeDesignConfig as DesignConfig),
          ...designOverrides,
        };
        routeMapDefaultsRef.current = mapControlDefaultsFromBase(
          routeDesignConfig as DesignConfig
        );
        setDesignHistory({
          history: [mergedDesign],
          index: 0,
        });
        setIsLoading(false);
      }
      getData();
    }, [router.query, handlePatternsOnLoad, routeDesignConfig]);

    useEffect(() => {
      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        setIsSavingDesign(false);
      };
    }, []);

    const scheduleAutoSave = useCallback(
      (nextConfig: DesignConfig) => {
        latestDesignConfigRef.current = nextConfig;
        setIsSavingDesign(true);
        if (!posterID) {
          pendingDesignSaveRef.current = nextConfig;
          return;
        }
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        const saveSeq = ++designSaveSeqRef.current;
        autoSaveTimeoutRef.current = setTimeout(() => {
          void getAuthAxios()
            .put(`/api/poster/${posterID}`, {
              posterID,
              designConfig: nextConfig,
            })
            .catch((error) => {
              console.error("Failed to save poster design config", error);
            })
            .finally(() => {
              if (designSaveSeqRef.current === saveSeq) {
                setIsSavingDesign(false);
              }
            });
        }, 500);
      },
      [posterID]
    );

    useEffect(() => {
      if (!posterID || !pendingDesignSaveRef.current) return;
      const pending = pendingDesignSaveRef.current;
      pendingDesignSaveRef.current = null;
      scheduleAutoSave(pending);
    }, [posterID, scheduleAutoSave]);

    useEffect(() => {
      if (!posterID) return;
      const flushPendingDesignSave = () => {
        const latest = latestDesignConfigRef.current;
        if (!latest) return;
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
          autoSaveTimeoutRef.current = null;
        }
        getAuthAxios().put(`/api/poster/${posterID}`, {
          posterID,
          designConfig: latest,
        });
      };

      const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          flushPendingDesignSave();
        }
      };

      window.addEventListener("beforeunload", flushPendingDesignSave);
      document.addEventListener("visibilitychange", onVisibilityChange);
      return () => {
        window.removeEventListener("beforeunload", flushPendingDesignSave);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    }, [posterID]);

    const handleDesignChange = useCallback(
      (nextConfig: DesignConfig) => {
        setDesignHistory((prev) => {
          const baseHistory = prev.history.slice(0, prev.index + 1);
          const nextHistory = [...baseHistory, nextConfig];
          return {
            history: nextHistory,
            index: nextHistory.length - 1,
          };
        });
        scheduleAutoSave(nextConfig);
      },
      [scheduleAutoSave]
    );

    const handleMapViewChange = useCallback(
      (longitude: number, latitude: number, zoom: number) => {
        handleDesignChange({
          ...currentDesignConfig,
          mapCenterLongitude: longitude,
          mapCenterLatitude: latitude,
          mapZoom: zoom,
        });
      },
      [currentDesignConfig, handleDesignChange]
    );

    const handleUndo = useCallback(() => {
      setDesignHistory((prev) => {
        if (prev.index <= 0) return prev;
        const nextIndex = prev.index - 1;
        const nextState = {
          history: prev.history,
          index: nextIndex,
        };
        const config = prev.history[nextIndex];
        scheduleAutoSave(config);
        return nextState;
      });
    }, [scheduleAutoSave]);

    const handleRedo = useCallback(() => {
      setDesignHistory((prev) => {
        if (prev.index >= prev.history.length - 1) return prev;
        const nextIndex = prev.index + 1;
        const nextState = {
          history: prev.history,
          index: nextIndex,
        };
        const config = prev.history[nextIndex];
        scheduleAutoSave(config);
        return nextState;
      });
    }, [scheduleAutoSave]);

    const resetMapControlsToDefaults = useCallback(() => {
      const mapDefaults = routeMapDefaultsRef.current;
      handleDesignChange({
        ...currentDesignConfig,
        ...mapDefaults,
      });
    }, [currentDesignConfig, handleDesignChange]);

    const handlePreviewScaleChange = useCallback(
      (nextScale: PosterSizeOption) => {
        handleDesignChange({
          ...currentDesignConfig,
          previewScale: nextScale,
        });
      },
      [currentDesignConfig, handleDesignChange]
    );

    const resetStopLabelsAndMarkers = useCallback(async () => {
      if (!posterID || isPrintMode || isResettingStops) return;
      const routeStops = routeDataParsed.stops ?? [];
      if (routeStops.length === 0) return;
      const resetStopsPayload = routeStops.reduce(
        (acc, stop) => {
          acc[stop.stop_id] = {
            marker_lat: stop.stop_lat,
            marker_lon: stop.stop_lon,
            label_lat: stop.stop_lat,
            label_lon: stop.stop_lon,
          };
          return acc;
        },
        {} as Record<
          string,
          {
            marker_lat: number;
            marker_lon: number;
            label_lat: number;
            label_lon: number;
          }
        >
      );

      setIsResettingStops(true);
      try {
        await getAuthAxios().put(`/api/poster/${posterID}`, {
          posterID,
          stops: resetStopsPayload,
        });
        setStopDataFromDB((prev) => {
          const prevStops = prev as Record<string, Record<string, unknown>>;
          const nextStops: Record<string, Record<string, unknown>> = {
            ...prevStops,
          };
          Object.entries(resetStopsPayload).forEach(([stopID, coords]) => {
            nextStops[stopID] = {
              ...(nextStops[stopID] || {}),
              ...coords,
            };
          });
          return nextStops;
        });
      } finally {
        setIsResettingStops(false);
      }
    }, [posterID, isPrintMode, isResettingStops, routeDataParsed.stops]);

    const posterLayouts: Record<
      string,
      { layout: "posterGeoNoLogo" | "posterGeoLogo" | "posterGeoLogoHorizontal" | "posterGeoLogoA0" | "posterFullMapLogo" | "posterBigFrameNoLogo"; styles: typeof stylesGeoNoLogo }
    > = {
      postergeologohorizontal: {
        layout: "posterGeoLogoHorizontal",
        styles: stylesGeoLogoHorizontal,
      },
      posterbigframenologo: {
        layout: "posterBigFrameNoLogo",
        styles: stylesBigFrameNoLogo,
      },
      posterfullmaplogo: {
        layout: "posterFullMapLogo",
        styles: stylesFullMapLogo,
      },
      postergeologo: {
        layout: "posterGeoLogo",
        styles: stylesGeoLogo,
      },
      postergeologoa0: {
        layout: "posterGeoLogoA0",
        styles: stylesGeoLogoA0,
      },
      postergeonologo: {
        layout: "posterGeoNoLogo",
        styles: stylesGeoNoLogo,
      },
    };

    const getPosterByType = useCallback(
      (
        posterType: string,
        routeData: Record<string, unknown>,
        routeDesignConfig: Record<string, unknown>,
        isInEditMode: boolean,
        isPrintMode: boolean,
        onMapViewChange?: (longitude: number, latitude: number, zoom: number) => void,
        mapFallbackCenter?: { longitude: number; latitude: number }
      ) => {
        const config = posterLayouts[posterType.toLocaleLowerCase()];
        if (!config) return null;

        return (
          <PosterLayout
            routeData={routeData}
            routeDesignConfig={
              currentDesignConfig as React.ComponentProps<
                typeof PosterLayout
              >["routeDesignConfig"]
            }
            isInEditMode={isInEditMode}
            isPrintMode={isPrintMode}
            stopDataFromDB={stopDataFromDB}
            posterID={posterID}
            displayedPatternsFromDB={displayedPatternsFromDB}
            layout={config.layout}
            styles={config.styles}
            onMapViewChange={onMapViewChange}
            mapFallbackCenter={mapFallbackCenter}
          />
        );
      },
      [
        routeDataParsed,
        currentDesignConfig,
        isInEditMode,
        isPrintMode,
        displayedPatternsFromDB,
        stopDataFromDB,
        posterID,
        posterType,
        routeCenterHint,
      ]
    );

    const previewTransformScale =
      previewScale === "fit"
        ? fitScaleMultiplier
        : Number(previewScale) / 100;

    const editPosterTemplate = (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {isSavingDesign && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              background: "rgba(15, 23, 42, 0.28)",
              backdropFilter: "blur(2px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.98)",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.2)",
                borderRadius: 14,
                padding: "18px 24px",
                minWidth: 220,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#020617",
                  marginBottom: 6,
                }}
              >
                Saving changes...
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#475569",
                }}
              >
                Please wait before refreshing or continuing.
              </div>
            </div>
          </div>
        )}
        {patternsForSelection && (
          <DataSelector
            routeData={routeDataParsed}
            patternsForSelection={patternsForSelection}
            setPatternsForSelection={handlePatternSelection}
          />
        )}
        <Head>
          <title>{routeID}</title>
        </Head>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <EditToggle
              isInEditMode={isInEditMode}
              setIsInEditMode={setIsInEditMode}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  void resetStopLabelsAndMarkers();
                }}
                disabled={isPrintMode || !posterID || isResettingStops}
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.2)",
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor:
                    isPrintMode || !posterID || isResettingStops
                      ? "not-allowed"
                      : "pointer",
                  opacity: isPrintMode || !posterID ? 0.55 : 1,
                }}
                title="Reset stop labels and markers to route-data coordinates"
              >
                {isResettingStops
                  ? "Resetting stop positions..."
                  : "Reset stop positions"}
              </button>
              <OpenForPrintButton />
              <OrderPrintButton />
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <DesignControls
            value={currentDesignConfig}
            canUndo={designHistory.index > 0}
            canRedo={designHistory.index < designHistory.history.length - 1}
            canResetMapControls={!isPrintMode}
            disabled={isPrintMode}
            onChange={handleDesignChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onResetMapControls={resetMapControlsToDefaults}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginBottom: 12,
          }}
        >
          <PosterSizeSelector
            value={previewScale}
            onChange={handlePreviewScaleChange}
            disabled={isPrintMode}
          />
        </div>
        {/* <div
          style={{
            height: `${intialZoomScale * 7016 + 50}px`,
            width: `${intialZoomScale * 4960 + 50}px`,
            overflow: "hidden",
            border: "20px solid red",
          }}
        >
          <TransformWrapper
            initialScale={intialZoomScale}
            panning={{
              disabled: true,
            }}
            limitToBounds={true}
            minScale={0.2}
            maxScale={0.5}
            wheel={{ disabled: true }}
            pinch={{ disabled: true }}
            alignmentAnimation={{ disabled: true }}
            velocityAnimation={{ disabled: true }}
            zoomAnimation={{ disabled: true }}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <>
                <div className="tools">
                  <button onClick={() => zoomIn(0.1)}>+</button>
                  <button onClick={() => zoomOut(0.1)}>-</button>
                  <button onClick={() => resetTransform()}>x</button>
                </div>
                <TransformComponent>
                  {getPosterByType(
                    posterType as string,
                    routeDataParsed,
                    routeDesignConfig,
                    isInEditMode,
                    isPrintMode,
                    handleMapViewChange,
                    routeCenterHint
                  )}
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div> */}
        <div
          ref={previewViewportRef}
          style={{
            flex: 1,
            minHeight: "min(55dvh, 720px)",
            width: "100%",
            boxSizing: "border-box",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "24px 28px 48px",
          }}
        >
          <div
            style={{
              width: posterIntrinsicSize.w * previewTransformScale,
              height: posterIntrinsicSize.h * previewTransformScale,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              ref={previewPosterRef}
              style={{
                display: "inline-block",
                verticalAlign: "top",
                transform: `scale(${previewTransformScale})`,
                transformOrigin: "top left",
              }}
            >
              {getPosterByType(
                posterType as string,
                routeDataParsed,
                routeDesignConfig as Record<string, unknown>,
                isInEditMode,
                isPrintMode,
                handleMapViewChange,
                routeCenterHint
              )}
            </div>
          </div>
        </div>
      </div>
    );
    return (
      <React.Fragment>
        {!isLoading && isPrintMode ? (
          <>
            {getPosterByType(
              posterType as string,
              routeDataParsed,
              routeDesignConfig as Record<string, unknown>,
              isInEditMode,
              isPrintMode,
              handleMapViewChange,
              routeCenterHint
            )}
            <PrintExportButtons />
          </>
        ) : (
          !isLoading && editPosterTemplate
        )}
      </React.Fragment>
    );
  };
  return <PosterTemplate />;
}
