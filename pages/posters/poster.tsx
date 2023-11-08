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
import PosterOct7 from "./posterOct7";
import PosterFullMapLogo from "./posterFullMapLogo";
import PosterGeoLogo from "./posterGeoLogo";
import PosterGeoLogoHorizontal from "./posterGeoLogoHorizontal";
import PosterGeoNoLogo from "./posterGeoNoLogo";
import { createPosterInDB } from "./utils";
import PosterGeoLogoA0 from "./posterGeoLogoA0";
import DataSelector from "../../components/dataSelectors/DataSelector";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
          case "PosterOct7".toLocaleLowerCase():
            return (
              <PosterOct7
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
              <div>
                <PosterGeoLogoA0
                  routeData={routeData}
                  routeDesignConfig={routeDesignConfig}
                  isInEditMode={isInEditMode}
                  isPrintMode={isPrintMode}
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
              />
            );
          default:
            return null;
        }
      },
      [routeID, isInEditMode]
    );
    
    const intialZoomScale = 0.2;
    
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
        <div
          style={{
            height: `${intialZoomScale  * 7016 + 50}px`,
            width: `${intialZoomScale  * 4960 + 50}px`,
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
            maxScale={0.5 }
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
        </div>
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
