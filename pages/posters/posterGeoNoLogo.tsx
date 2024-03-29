import { Badge } from "theme-ui";
// import styles from "./posterGeoNoLogo.module.css";
import styles from "./posterGeoNoLogoA0.module.css";
import React from 'react';
// import styles from "./posterGeoNoLogoA0.module.module.css";
// import styles from "./posterGeoNoLogoA0.module.module.css";
// import styles from "./posterGeoNoLogoA0.module.module.css";
// import styles from "./posterGeoNoLogoA0.module.module.css";

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
  const PosterGeoNoLogo = () => (
    <div className={styles.posterContainer}>
      <div className={styles.header}>
        <div className={styles.title}>
          <div className={styles.lineDetails}>
            <div className={styles.lineNameNoLogo}>
              <div className={styles.lineName}
                style={{
                  color: routeDesignConfig.backgroundColor,
                  fontFamily: routeDesignConfig.font,
                  fontWeight: 'bolder',
                  fontSize: routeDesignConfig.routeNameAndTypeSize || routeDesignConfig.routeTitleSize || 80,
                }}
              >
                {routeDesignConfig.routeName}
                <div
                  className={styles.lineType}
                  style={{
                    color: routeDesignConfig.backgroundColor,
                    paddingLeft: 20,
                    fontWeight: 'bolder',
                    fontFamily: routeDesignConfig.font,
                    fontSize: routeDesignConfig.routeNameAndTypeSize || routeDesignConfig.routeTitleSize || 80,
                  }}
                >
                  {`${routeDesignConfig.routeType}`}
                </div>
              </div>
              <div className={styles.lineTypeDesc}>
                <div
                  className={styles.lineDesc}
                  style={{
                    fontFamily: routeDesignConfig.routeTitleFont || routeDesignConfig.font,
                    fontWeight: 200,
                    fontSize: routeDesignConfig.routeTitleSize || 80,
                  }}
                >
                  {`${routeDesignConfig.routeDesc}`}
                </div>
              </div>
            </div>
          </div>
          {routeDesignConfig.descriptionDetails && (
            <div className={styles.descriptionDetails}>
              {getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.numberOfStopsText,
                true
              )}
              {getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.locationText,
                false
              )}
              <br />
              {getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.launchDateText,
                false
              )}
            </div>
          )}
          {routeDesignConfig.descriptionDetails && (
            <div className={styles.divider}></div>
          )}
        </div>
      </div>
      <div className={styles.mapContainer}>
        <GeoMap
          multiPolyLine={routeData.multiPolyLine}
          stops={routeData.stops}
          backgroundColor={routeDesignConfig.backgroundColor}
          mapOpacity={routeDesignConfig.mapOpacity}
          tileLayerName={routeDesignConfig.tileLayerName}
          pathColor={routeDesignConfig.pathColor}
          pathWeight={routeDesignConfig.pathWeight}
          mapZoom={routeDesignConfig.mapZoom}
          isInEditMode={isInEditMode}
          isPrintMode={isPrintMode}
          font={routeDesignConfig.font}
          stopFontSize={routeDesignConfig.stopFontSize}
          stopFontColor={routeDesignConfig.stopFontColor}
          stopIDsToDisplayFromConfig={routeDesignConfig.stopIDsToDisplayFromConfig}
          stopColor={routeDesignConfig.stopColor}
          stopCircleSize={routeDesignConfig.stopCircleSize}
          stopBackgroundColor={routeDesignConfig.stopBackgroundColor}
          isSingleDot={routeDesignConfig.isSingleDot}
          showGeoLayer={true}
          smoothFactor={undefined}
          showMarkers={true} 
          patterns={routeData.patterns}  
          stopFont={routeDesignConfig.stopFont}      />
      </div>
      <div className={styles.transitLifeCred}>
        <TransitLifeCredit creditFontSize={routeDesignConfig.creditFontSize} font={routeDesignConfig.creditFont} />
      </div>
    </div>
  );
  return <PosterGeoNoLogo />;
}
