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
  const rawPosterType = context?.query?.posterType;
  const rawRouteID = context?.query?.routeID;
  const source = context?.query?.source;
  const isTransitApi = source === "transit";

  if (!rawPosterType || Array.isArray(rawPosterType) || !rawRouteID || Array.isArray(rawRouteID)) {
    return { redirect: { destination: "/", permanent: false } };
  }

  if (isTransitApi) {
    const routeDataRes = await fetch(
      `${server}/api/dataProvider/routeData?routeId=${encodeURIComponent(rawRouteID)}`
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
    fetch(`${server}/api/routeData?routeID=${rawRouteID}`),
    fetch(
      `${server}/api/routeDesignConfig${rawPosterType.replace(
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

  let routeData: unknown = null;
  let routeDesignConfig: unknown = null;

  try {
    routeData = routeDataString ? JSON.parse(routeDataString) : null;
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
        const allPatterns = routeData.patterns;
        if (!selectedPatternsFromDB) {
          return;
        }
        setPatternsForSelection(
          allPatterns.map((p) => ({
            patternId: p.properties.route_id,
            patternName: p.properties.route_long_name,
            toDisplay:
              selectedPatternsFromDB[p.properties.route_id]?.toDisplay,
          }))
        );

        setDisplayedPatternsFromDB(selectedPatternsFromDB || {});
      },
      [routeData]
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
          const rd = routeData as { patterns?: Array<{ properties: { route_id: string } }> } | null | undefined;
          const patterns = rd?.patterns ?? [];
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
          setDesignHistory({
            history: [routeDesignConfig as DesignConfig],
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
        routeData,
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
            routeData={routeData}
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
                    routeData,
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
              routeData,
              routeDesignConfig,
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
              routeData,
              routeDesignConfig,
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
