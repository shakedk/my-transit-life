import dynamic from "next/dynamic";
import React from "react";
import { Badge, Image, Text } from "theme-ui";
import { useRouter } from "next/router";
import styles from "./posterGeoLogoHorizontal.module.css";
import { server } from "../../config";

import TransitLifeCredit from "../../components/tranitLifeCredit";
import Head from "next/head";

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
          fontSize: routeDesignConfig.lineDetailsFontSize || 18,
          fontWeight: "normal",
          padding: 0,
          paddingBottom: isFirst ? 2 : 1,
          fontFamily: routeDesignConfig.font,
        }}
        color="black"
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
              <div className={styles.header}>
                <div
                  style={{
                    position: "absolute",
                    top: `${routeDesignConfig.agencyLogoTop}px`,
                    right: `${routeDesignConfig.agencyLogoRight}px`,
                  }}
                >
                  <Image
                    src={routeDesignConfig.agencyLogoPath}
                    sx={{
                      width: routeDesignConfig.agencyLogoWidth,
                      height: routeDesignConfig.agencyLogoHeight,
                    }}
                  ></Image>
                </div>
                <div className={styles.title}>
                  <div className={styles.lineDetails}>
                    <div className={styles.lineNameAndLogo}>
                      {routeDesignConfig.logoPath ? (
                        <Image
                          src={routeDesignConfig.logoPath}
                          sx={{
                            padding: routeDesignConfig.logoPadding || 0,
                            width: routeDesignConfig.logoWidth || 140,
                            height: routeDesignConfig.logoHeight || 140,
                          }}
                        ></Image>
                      ) : (
                        <div
                          className={styles.lineName}
                          style={{
                            color: routeDesignConfig.backgroundColor,
                            fontFamily: routeDesignConfig.font,
                            fontSize: routeDesignConfig.routeTitleSize || 80,
                          }}
                        >
                          {" "}
                          {routeDesignConfig.routeName}
                        </div>
                      )}
                      <Badge
                        sx={{
                          zIndex: 100,
                          fontSize: routeDesignConfig.routeTitleSize || 60,
                          padding: 0,
                          paddingLeft: 10,
                          fontFamily: routeDesignConfig.font,
                          color: "black",
                        }}
                        p={4}
                        color="black"
                        bg="transparent"
                      >
                        {`${routeDesignConfig.routeType} ${routeDesignConfig.routeDesc}`}
                      </Badge>
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
                    <br />
                    {getDescriptionDetailElement(
                      routeDesignConfig.launchDateText,
                      false
                    )}
                  </div>
                  <div className={styles.divider}></div>
                </div>
              </div>
              <div className={styles.mapContainer}>
                <Map
                  multiPolyLine={routeData.multiPolyLine}
                  stops={routeData.stops}
                  backgroundColor={routeDesignConfig.backgroundColor}
                  tileLayerName={routeDesignConfig.tileLayerName}
                  pathColor={routeDesignConfig.pathColor}
                  mapZoom={routeDesignConfig.mapZoom}
                  font={routeDesignConfig.font}
                  showMarkers={true}
                />
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
