import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";
import { Badge, Image, Text } from "theme-ui";
import { useRouter } from "next/router";
import styles from "./posterGeoLogoHorizontal.module.css";
import { server } from "../../config";

import TransitLifeCredit from "../../components/tranitLifeCredit";
import Head from "next/head";
import { createPosterInDB, useMap } from "./utils";
import EditToggle from "../../components/editToggle";
import PosterGeoLogoHorizontal from "./posterGeoLogoHorizontal";

export async function getServerSideProps(context) {
  const routeData = await fetch(
    `${server}/api/routeData?routeID=${context.query.routeID}`
  );
  const routeDesignConfig = await fetch(
    `${server}/api/routeDesignConfigGeoLogoHorizontal?routeID=${context.query.routeID}`
  );
  return {
    props: {
      routeData: await routeData.json(),
      routeDesignConfig: await routeDesignConfig.json(),
    }, // will be passed to the page component as props
  };
}

export default function Page(props) {

  // const Map = React.useMemo(
  //   () =>
  //     dynamic(
  //       () => import("../../components/map"), // replace '@components/map' with your component's location
  //       {
  //         loading: () => <p>A map is loading</p>,
  //         ssr: false, // This line is important. It's what prevents server-side render
  //       }
  //     ),
  //   [
  //     /* list variables which should trigger a re-render here */
  //   ]
  // );
  
  const router = useRouter();  
  const { routeID } = router.query;
  const { posterType } = router.query;
  const routeData = JSON.parse(props.routeData.routeData);
  const routeDesignConfig = JSON.parse(props.routeDesignConfig.routeData);

  const posterTypes = {
    PosterGeoLogoHorizontal: <PosterGeoLogoHorizontal/>
  }
  const PosterTemaple = () => {
    React.useEffect(() => {
      const posterType = router.pathname.replace("/posters/", "");
      createPosterInDB(posterType, routeID);
    }, [routeID]);
    const [isInEditMode, setIsInEditMode] = useState(false);
    return React.useMemo(() => {
      if (routeID) {
        return (
          <div>
            {" "}
            <Head>
              <title>{routeID}</title>
            </Head>
            <EditToggle
              isInEditMode={isInEditMode}
              setIsInEditMode={setIsInEditMode}
            />
            <PosterGeoLogoHorizontal routeData={routeData}  routeDesignConfig={routeDesignConfig} isInEditMode={isInEditMode}/>
          </div>
        );
      }
    }, [routeID, isInEditMode]);
  };
  return <PosterTemaple />;
}
