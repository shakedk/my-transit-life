import { useRouter } from "next/router";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
    // #region agent log
    try {
      const fs = require("node:fs");
      const path = require("node:path");
      const logPath = path.join(process.cwd(), ".cursor", "debug.log");
      const line = JSON.stringify({
        location: "poster.tsx:getServerSideProps:missingQuery",
        message: "posterType or routeID still missing after merge",
        data: {
          reqUrl: context.req?.url ?? null,
          resolvedUrl: context.resolvedUrl ?? null,
          queryKeys: Object.keys(context.query ?? {}),
          mergedKeys: Object.keys(query),
          rawPosterType: rawPosterType ?? null,
          rawRouteID: rawRouteID ?? null,
        },
        timestamp: Date.now(),
        hypothesisId: "missing-q",
      });
      fs.appendFileSync(logPath, `${line}\n`);
    } catch {
      // ignore logging failures
    }
    // #endregion
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
    const [previewScale, setPreviewScale] = useState<PosterSizeOption>("fit");
    const [posterID, setPosterID] = useState(null);
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
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

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
            routeDesignConfig as DesignConfig,
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
          ...(routeDesignConfig as DesignConfig),
          ...designOverrides,
        };
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
      };
    }, []);

    const currentDesignConfig: DesignConfig =
      designHistory.history[designHistory.index] ||
      (routeDesignConfig as DesignConfig);

    const scheduleAutoSave = useCallback(
      (nextConfig: DesignConfig) => {
        if (!posterID) return;
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          getAuthAxios().put(`/api/poster/${posterID}`, {
            posterID,
            designConfig: nextConfig,
          });
        }, 500);
      },
      [posterID]
    );

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

        const editPosterTemplate = (
      <div style={{ position: "relative" }}>
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
            <PosterSizeSelector
              value={previewScale}
              onChange={setPreviewScale}
              disabled={isPrintMode}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
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
            disabled={isPrintMode}
            onChange={handleDesignChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
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
          style={{
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: 400,
          }}
        >
          <div
            style={{
              transform: `scale(${
                previewScale === "fit" ? 0.25 : Number(previewScale) / 100
              })`,
              transformOrigin: "top center",
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
