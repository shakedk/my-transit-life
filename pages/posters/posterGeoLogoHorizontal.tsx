import React from 'react';
import { Badge, Image } from "theme-ui";
import styles from "./posterGeoLogoHorizontal.module.css";

import TransitLifeCredit from "../../components/tranitLifeCredit";
import { useMap } from "./utils";

export default function Page({ routeData, routeDesignConfig, isInEditMode, isPrintMode }) {
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

  const PosterGeoLogoHorizontal = () => (
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
              routeDesignConfig.descriptionDetails?.numberOfStopsText,
              true
            )}
            {getDescriptionDetailElement(
              routeDesignConfig.descriptionDetails?.launchDateText,
              false
            )}
            <br />
            {getDescriptionDetailElement(
              routeDesignConfig.descriptionDetails?.launchDateText,
              false
            )}
          </div>
          <div className={styles.divider}></div>
        </div>
      </div>
      <div className={styles.mapContainer}>
        <GeoMap
          // offsetTop={mapRef && mapRef.current && mapRef.current.offsetTop}
          multiPolyLine={routeData.multiPolyLine}
          stops={routeData.stops}
          backgroundColor={routeDesignConfig.backgroundColor}
          tileLayerName={routeDesignConfig.tileLayerName}
          pathColor={routeDesignConfig.pathColor}
          mapZoom={routeDesignConfig.mapZoom}
          font={routeDesignConfig.font}
          showMarkers={true}
          isInEditMode={isInEditMode}
          isPrintMode={isPrintMode}
          showGeoLayer={undefined}
          smoothFactor={undefined} patterns={undefined} mapOpacity={undefined} pathWeight={undefined} stopFontSize={undefined} stopFontColor={undefined} stopIDsToDisplayFromConfig={undefined} stopColor={undefined} stopCircleSize={undefined} stopBackgroundColor={undefined} isSingleDot={undefined}        />
      </div>
      <div className={styles.transitLifeCred}>
        <TransitLifeCredit creditFontSize={routeDesignConfig.creditFontSize} />
      </div>
    </div>
  );

  return <PosterGeoLogoHorizontal />;
}
