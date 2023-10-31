import { useRouter } from "next/router";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { server } from "../../config";

import Head from "next/head";
import EditToggle from "../../components/editToggle";
import OpenForPrintButton from "../../components/printButton";
import PosterBigFrameNoLogo from "./posterBigFrameNoLogo";
import PosterFullMapLogo from "./posterFullMapLogo";
import PosterGeoLogo from "./posterGeoLogo";
import PosterGeoLogoHorizontal from "./posterGeoLogoHorizontal";
import PosterGeoNoLogo from "./posterGeoNoLogo";
import { createPosterInDB, getPosterIDInDB } from "./utils";
import PosterGeoLogoA0 from "./posterGeoLogoA0";
import DataSelector from "../../components/dataSelectors/DataSelector";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import axios from "axios";
import { IPattern } from "../../src/types";

export async function getServerSideProps(context) {
  const routeData = await fetch(
    `${server}/api/routeData?routeID=${context.query.routeID}`
  );

  const routeDesignConfig = await fetch(
    `${server}/api/routeDesignConfig${context.query.posterType.replace(
      "Poster",
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

  const PosterTemaple = () => {
    React.useEffect(() => {
      createPosterInDB(posterType, routeID);
    }, [routeID]);
    const isPrintMode = router.query.printMode === "true";

    const [isInEditMode, setIsInEditMode] = useState(!isPrintMode);
    const [posterID, setPosterID] = useState(null);
    const [stopDataFromDB, setStopDataFromDB] = useState({});
    // DB returneד only true/false for which pattern (route id) to display
    // Might be able to remove this down the road.
    const [displsyedPatternsFromDB, setDisplsyedPatternsFromDB] = useState({});
    const [patternsForSelection, setPatternsForSelection] =
      useState<IPattern[]>(null);

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

        setDisplsyedPatternsFromDB(selectedPatternsFromDB || {});
      },
      []
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
      setDisplsyedPatternsFromDB(displayedPatterns);
      const params = {
        posterID: posterID,
        patterns: {},
      };
      Object.entries(displayedPatterns).forEach(([routeId, toDisplay]) => {params.patterns[routeId] = {
        toDisplay,
      };})
      axios.put(`/api/poster/${posterID}`, params);
    };
    useEffect(() => {
      async function getData() {
        const posterType = router.query.posterType;
        const _routeID = router.query.routeID;
        const id = await getPosterIDInDB(posterType, _routeID);

        const res = await axios.get(`/api/poster/${id}`);
        setPosterID(id);
        setStopDataFromDB(res.data.stops || {});
        handlePatternsOnLoad(res.data.patterns);
        setIsLoading(false);
      }
      getData();
    }, [router.query]);

    const getPosterByType = useCallback(
      (
        posterType: string,
        routeData: any,
        routeDesignConfig: object,
        isInEditMode: boolean,
        isPrintMode: boolean
      ) => {
        switch (posterType.toLocaleLowerCase()) {
          case "PosterGeoLogoHorizontal".toLocaleLowerCase():
            return (
              <PosterGeoLogoHorizontal
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
                stopDataFromDB={stopDataFromDB}
                posterID={posterID}
                displsyedPatternsFromDB={displsyedPatternsFromDB}
              />
            );
          case "PosterBigFrameNoLogo".toLocaleLowerCase():
            return (
              <PosterBigFrameNoLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
                stopDataFromDB={stopDataFromDB}
                posterID={posterID}
                displsyedPatternsFromDB={displsyedPatternsFromDB}
              />
            );
          case "PosterFullMapLogo".toLocaleLowerCase():
            return (
              <PosterFullMapLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
                stopDataFromDB={stopDataFromDB}
                posterID={posterID}
                displsyedPatternsFromDB={displsyedPatternsFromDB}
              />
            );
          case "PosterGeoLogo".toLocaleLowerCase():
            return (
              <PosterGeoLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
                stopDataFromDB={stopDataFromDB}
                posterID={posterID}
                displsyedPatternsFromDB={displsyedPatternsFromDB}
              />
            );
          case "PosterGeoLogoA0".toLocaleLowerCase():
            return (
              <div>
                <PosterGeoLogoA0
                  routeData={routeData}
                  routeDesignConfig={routeDesignConfig}
                  isInEditMode={isInEditMode}
                  isPrintMode={isPrintMode}
                  stopDataFromDB={stopDataFromDB}
                  posterID={posterID}
                  displsyedPatternsFromDB={displsyedPatternsFromDB}
                />
              </div>
            );
          case "PosterGeoNoLogo".toLocaleLowerCase():
            return (
              <PosterGeoNoLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
                stopDataFromDB={stopDataFromDB}
                posterID={posterID}
                displsyedPatternsFromDB={displsyedPatternsFromDB}
              />
            );
          default:
            return null;
        }
      },
      [routeID, isInEditMode, displsyedPatternsFromDB, stopDataFromDB]
    );

    const intialZoomScale = 0.2;

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
        <EditToggle
          isInEditMode={isInEditMode}
          setIsInEditMode={setIsInEditMode}
        />
        <OpenForPrintButton />
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
        <div>
          {getPosterByType(
            posterType as string,
            routeData,
            routeDesignConfig,
            isInEditMode,
            isPrintMode
          )}
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
          : !isLoading && zxeditPosterTemplate}
      </React.Fragment>
    );
  };
  return <PosterTemaple />;
}
