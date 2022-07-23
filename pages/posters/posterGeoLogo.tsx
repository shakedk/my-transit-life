import React from "react";
import { Badge, Image } from "theme-ui";
import styles from "./posterGeoLogo.module.css";
import { useMap } from "./utils";

import Head from "next/head";
import TransitLifeCredit from "../../components/tranitLifeCredit";


export default function Page({
  routeData,
  routeDesignConfig,
  isInEditMode,
}) {
  const GeoMap = useMap();

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
  const PosterGeoLogo = () => (
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
                <GeoMap
                  multiPolyLine={routeData.multiPolyLine}
                  stops={routeData.stops}
                  backgroundColor={routeDesignConfig.backgroundColor}
                  tileLayerName={routeDesignConfig.tileLayerName}
                  pathColor={routeDesignConfig.pathColor}
                  mapZoom={routeDesignConfig.mapZoom}
                  font={routeDesignConfig.font}
                  showMarkers={true}
                  isInEditMode={isInEditMode}
                />
              </div>
              <div className={styles.transitLifeCred}>
                <TransitLifeCredit />
              </div>
            </div>
       )
  return <PosterGeoLogo />;
}
