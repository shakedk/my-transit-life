import dynamic from "next/dynamic";
import React from "react";
import { Badge, Image, Text } from "theme-ui";
import { useRouter } from "next/router";
import styles from "./posterBigFrameNoLogo.module.css";
import { server } from "../../config";

import TransitLifeCredit from "../../components/tranitLifeCredit";
import Head from "next/head";

export async function getServerSideProps(context) {
  const routeData = await fetch(
    `${server}/api/routeData?routeID=${context.query.routeID}`
  );
  const routeDesignConfig = await fetch(
    `${server}/api/routeDesignConfigFullMapLogo?routeID=${context.query.routeID}`
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

  const routeData = JSON.parse(props.routeData.routeData);
  const routeDesignConfig = JSON.parse(props.routeDesignConfig.routeData);

  const Map = React.useMemo(
    () =>
      dynamic(
        () => import("../../components/map"), // replace '@components/map' with your component's location
        {
          loading: () => <p>A map is loading</p>,
          ssr: false, // This line is important. It's what prevents server-side render
        }
      ),
    [
      /* list variables which should trigger a re-render here */
    ]
  );

  const getDescriptionDetailElement = (detail: string, isFirst: boolean) => (
    <div>
      <Badge
        sx={{
          zIndex: 100,
          fontSize: routeDesignConfig.lineDetailsFontSize || 30,
          fontWeight: "normal",
          padding: 0,
          paddingBottom: 2,
          fontFamily: routeDesignConfig.font,
        }}
        bg="transparent"
      >
        {detail}
      </Badge>
    </div>
  );
  const PosterTemaple = () =>
    React.useMemo(() => {
      if (routeID) {
        return (
          <div>
            {" "}
            <Head>
              <title>{routeID}</title>
            </Head>
            <div className={styles.posterContainer}>
              <div
                className={styles.mapContainer}
                style={{
                  position: "relative",
                }}
              >
                <Map
                  multiPolyLine={routeData.multiPolyLine}
                  showGeoLayer={false}
                  stops={routeData.stops}
                  backgroundColor={routeDesignConfig.backgroundColor}
                  tileLayerName={routeDesignConfig.tileLayerName}
                  pathColor={routeDesignConfig.pathColor}
                  mapZoom={routeDesignConfig.mapZoom + 0.5} //As we have more space to show the route
                  font={routeDesignConfig.font}
                  smoothFactor={8}
                  showMarkers
                />
              </div>
              <div
                className={styles.header}
                style={{ backgroundColor: routeDesignConfig.backgroundColor }}
              >
                <div className={styles.title}>
                  <div className={styles.lineDetails}>
                    <div className={styles.lineNameNoLogo}>
                      <div
                        className={styles.lineName}
                        style={{
                          fontFamily: routeDesignConfig.font,
                          fontSize: routeDesignConfig.routeTitleSize || 80,
                        }}
                      >
                        {routeDesignConfig.routeName}
                      </div>
                      <div
                        className={styles.lineTypeDesc}
                        style={{
                          fontFamily: routeDesignConfig.font,
                          fontSize: routeDesignConfig.routeTitleSize || 80,
                        }}
                      >
                        {`${routeDesignConfig.routeType} ${routeDesignConfig.routeDesc}`}
                      </div>
                    </div>
                  </div>
                  <div className={styles.descriptionDetails}>
                    {getDescriptionDetailElement(
                      routeDesignConfig.numberOfStopsText,
                      true
                    )}
                    {getDescriptionDetailElement(
                      routeDesignConfig.locationText,
                      false
                    )}
                    {getDescriptionDetailElement(
                      routeDesignConfig.launchDateText,
                      false
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.transitLifeCred}>
                <TransitLifeCredit />
              </div>
            </div>
          </div>
        );
      }
    }, [routeID]);
  return <PosterTemaple />;
}
