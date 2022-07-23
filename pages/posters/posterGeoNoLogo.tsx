import dynamic from "next/dynamic";
import React from "react";
import { Badge, Image, Text } from "theme-ui";
import { useRouter } from "next/router";
import styles from "./posterGeoNoLogo.module.css";
import { server } from "../../config";

import TransitLifeCredit from "../../components/tranitLifeCredit";
import Head from "next/head";
import { useMap } from "./utils";

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
  const PosterGeoNoLogo = () => (
    <div className={styles.posterContainer}>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.lineDetails}>
            <div className={styles.lineNameNoLogo}>
              <div
                className={styles.lineName}
                style={{
                  color: routeDesignConfig.backgroundColor,
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
          isInEditMode={isInEditMode} 
          font={routeDesignConfig.font}
           showGeoLayer={false}
          smoothFactor={undefined} 
          showMarkers={undefined} />
      </div>
      <div className={styles.transitLifeCred}>
        <TransitLifeCredit />
      </div>
    </div>
  )
  return <PosterGeoNoLogo />;
}
