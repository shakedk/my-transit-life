import { useRouter } from "next/router";
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

export async function getServerSideProps(context) {
  const routeData = await fetch(
    `${server}/api/routeData?routeID=${context.query.routeID}`
  );

  const routeDesignConfig = await fetch(
    `${server}/api/routeDesignConfig${context.query.posterType.replace(
      /poster/i,
      ""
    )}?routeID=${context.query.routeID}`
  );

  const routeDataJson = await routeData.json();
  const routeDesignConfigJson = await routeDesignConfig.json();
  return {
    props: {
      routeData: routeDataJson,
      routeDesignConfig: routeDesignConfigJson,
    }, // will be passed to the page component as props
  };
}

export default function Page(props) {
  const router = useRouter();
  const { routeID } = router.query;
  const { posterType } = router.query;
  const routeData = JSON.parse(props.routeData.routeData);
  const routeDesignConfig = JSON.parse(props.routeDesignConfig.routeData);
  const [isLoading,setIsLoading] = useState(true);

  const PosterTemplate = () => {
    React.useEffect(() => {
      createPosterInDB(posterType, routeID);
    }, [routeID]);
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
          return
        }
        setPatternsForSelection(
          allPatterns.map((p) => ({
            patternId: p.properties.route_id,
            patternName: p.properties.route_long_name,
            toDisplay: selectedPatternsFromDB[p.properties.route_id]?.toDisplay,
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
      Object.entries(displayedPatterns).forEach(([routeId, toDisplay]) => {params.patterns[routeId] = {
        toDisplay,
      };})
      getAuthAxios().put(`/api/poster/${posterID}`, params);
    };
    useEffect(() => {
      async function getData() {
        const posterType = router.query.posterType;
        const _routeID = router.query.routeID;
        const id = await getPosterIDInDB(posterType, _routeID);

        console.log("POSTER ID (from DB):", id);

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
        isPrintMode: boolean
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
      ]
    );

    const editPosterTemplate = (
      <>
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
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <EditToggle
            isInEditMode={isInEditMode}
            setIsInEditMode={setIsInEditMode}
          />
          <PosterSizeSelector
            value={previewScale}
            onChange={setPreviewScale}
            disabled={isPrintMode}
          />
          <OpenForPrintButton />
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
                    isPrintMode
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
              isPrintMode
            )}
          </div>
        </div>
      </>
    );
    return (
      <React.Fragment>
        {!isLoading && isPrintMode
          ? getPosterByType(
              posterType as string,
              routeData,
              routeDesignConfig,
              isInEditMode,
              isPrintMode
            )
          : !isLoading && editPosterTemplate}
      </React.Fragment>
    );
  };
  return <PosterTemplate />;
}
