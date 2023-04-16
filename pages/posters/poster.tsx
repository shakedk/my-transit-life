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
import { createPosterInDB } from "./utils";
import PosterGeoLogoA0 from "./posterGeoLogoA0";
import DataSelector from "../../components/dataSelector";

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
  return {
    props: {
      routeData: await routeData.json(),
      routeDesignConfig: await routeDesignConfig.json(),
    }, // will be passed to the page component as props
  };
}

export default function Page(props) {
  const router = useRouter();
  const { routeID } = router.query;
  const { posterType } = router.query;
  const routeData = JSON.parse(props.routeData.routeData);
  const routeDesignConfig = JSON.parse(props.routeDesignConfig.routeData);

  const PosterTemaple = () => {
    React.useEffect(() => {
      createPosterInDB(posterType, routeID);
    }, [routeID]);
    const isPrintMode = router.query.printMode === "true";

    const [isInEditMode, setIsInEditMode] = useState(!isPrintMode);
    const getPosterByType = useCallback(
      (
        posterType: string,
        routeData: object,
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
              />
            );
          case "PosterBigFrameNoLogo".toLocaleLowerCase():
            return (
              <PosterBigFrameNoLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
              />
            );
          case "PosterFullMapLogo".toLocaleLowerCase():
            return (
              <PosterFullMapLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
              />
            );
          case "PosterGeoLogo".toLocaleLowerCase():
            return (
              <PosterGeoLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
              />
            );
          case "PosterGeoLogoA0".toLocaleLowerCase():
            return (
              <PosterGeoLogoA0
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
              />
            );
          case "PosterGeoNoLogo".toLocaleLowerCase():
            return (
              <PosterGeoNoLogo
                routeData={routeData}
                routeDesignConfig={routeDesignConfig}
                isInEditMode={isInEditMode}
                isPrintMode={isPrintMode}
              />
            );
          default:
            return null;
        }
      },
      [routeID, isInEditMode]
    );

    const [Space, setSpace] = useState(null);

    useEffect(() => {
      async function loadZoomableUI() {
        const spaceLib = await import("react-zoomable-ui");
        spaceLib.suppressBrowserZooming();
        setSpace(spaceLib);
      }
      loadZoomableUI();
    }, []);

    const posterRef = useRef(null);
    const [posterWidth, setPosterWidth] = useState(1000);
    const [posterHeight, setPosterHeight] = useState(1000);

    useEffect(() => {
      const updatePosterDimensions = () => {
        if (posterRef.current) {
          setPosterWidth(posterRef.current.clientWidth);
          setPosterHeight(posterRef.current.clientHeight);
        }
      };
      updatePosterDimensions();
      window.addEventListener("resize", updatePosterDimensions);
      return () => {
        window.removeEventListener("resize", updatePosterDimensions);
      };
    }, [posterRef]);

    const editPosterTemplate = (
      <>
        <DataSelector />
        <Head>
          <title>{routeID}</title>
        </Head>
        <EditToggle
          isInEditMode={isInEditMode}
          setIsInEditMode={setIsInEditMode}
        />
        <OpenForPrintButton />
        {Space && (
          <Suspense fallback={<div>Loading...</div>}>
            {routeID && (
              <div
                ref={posterRef}
                style={{
                  position: "relative",
                  border: "1px solid black",
                  width: posterWidth,
                  height: posterHeight,
                }}
              >
                <Space.Space
                  onCreate={(viewPort) => {
                    // viewPort.setBoundsToContainer()
                    debugger;
                    debugger;
                    debugger;
                    debugger;
                    debugger;
                    debugger;
                    debugger;
                    debugger;
                    debugger;
                    viewPort.setBounds({
                      x: [0, posterWidth],
                      y: [0, posterHeight],
                      zoom: 0.5
                    });
                  //   viewPort.camera.centerFitAreaIntoView({
                  //     left: 0,
                  //     top: 0,
                  //     width: posterWidth,
                  //     height: posterHeight,
                  //     // zoom: 0.1
                  //   });
                  }}
                >
                  {getPosterByType(
                    posterType as string,
                    routeData,
                    routeDesignConfig,
                    isInEditMode,
                    isPrintMode
                  )}
                </Space.Space>
              </div>
            )}
          </Suspense>
        )}
      </>
    );
    return (
      <React.Fragment>
        {isPrintMode
          ? getPosterByType(
              posterType as string,
              routeData,
              routeDesignConfig,
              isInEditMode,
              isPrintMode
            )
          : editPosterTemplate}
      </React.Fragment>
    );
  };
  return <PosterTemaple />;
}
