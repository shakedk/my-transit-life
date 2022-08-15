import { useRouter } from "next/router";
import React, { useState } from "react";
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

  const getPosterByType = (
    posterType: string,
    routeData: object,
    routeDesignConfig: object,
    isInEditMode: boolean
  ) => {
    switch (posterType.toLocaleLowerCase()) {
      case "PosterGeoLogoHorizontal".toLocaleLowerCase():
        return (
          <PosterGeoLogoHorizontal
            routeData={routeData}
            routeDesignConfig={routeDesignConfig}
            isInEditMode={isInEditMode}
          />
        );
      case "PosterBigFrameNoLogo".toLocaleLowerCase():
        return (
          <PosterBigFrameNoLogo
            routeData={routeData}
            routeDesignConfig={routeDesignConfig}
            isInEditMode={isInEditMode}
          />
        );
      case "PosterFullMapLogo".toLocaleLowerCase():
        return (
          <PosterFullMapLogo
            routeData={routeData}
            routeDesignConfig={routeDesignConfig}
            isInEditMode={isInEditMode}
          />
        );
      case "PosterGeoLogo".toLocaleLowerCase():
        return (
          <PosterGeoLogo
            routeData={routeData}
            routeDesignConfig={routeDesignConfig}
            isInEditMode={isInEditMode}
          />
        );
      case "PosterGeoNoLogo".toLocaleLowerCase():
        return (
          <PosterGeoNoLogo
            routeData={routeData}
            routeDesignConfig={routeDesignConfig}
            isInEditMode={isInEditMode}
          />
        );
      default:
        return null;
    }
  };
  const PosterTemaple = () => {
    React.useEffect(() => {
      createPosterInDB(posterType, routeID);
    }, [routeID]);
    const [isInEditMode, setIsInEditMode] = useState(false);

    const isPrintMode = router.query.printMode;
    return React.useMemo(() => {
      if (routeID) {
        return (
          <div>
            {" "}
            <Head>
              <title>{routeID}</title>
            </Head>
            {!isPrintMode && (
              <>
                <EditToggle
                  isInEditMode={isInEditMode}
                  setIsInEditMode={setIsInEditMode}
                />
                <OpenForPrintButton />
              </>
            )}
            {getPosterByType(
              posterType as string,
              routeData,
              routeDesignConfig,
              isInEditMode
            )}
          </div>
        );
      }
    }, [routeID, isInEditMode]);
  };
  return <PosterTemaple />;
}
