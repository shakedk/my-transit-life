import { Badge } from "theme-ui";
import styles from "./posterBigFrameNoLogo.module.css";
import React from 'react';
import TransitLifeCredit from "../../components/tranitLifeCredit";
import { useMap } from "./utils";

export default function Page({
  routeData,
  routeDesignConfig,
  isInEditMode,
  isPrintMode,
}) {
  const GeoMap = useMap();

  const getDescriptionDetailElement = (detail: string, isLast: boolean) => (
    <div>
      <Badge
        sx={{
          zIndex: 100,
          fontSize: routeDesignConfig.lineDetailsFontSize || 30,
          fontWeight: "normal",
          padding: 0,
          paddingBottom: 2,
          fontFamily: routeDesignConfig.font,
          color: "black",
        }}
        bg="transparent"
      >
        {detail}
      </Badge>
    </div>
  );
  const PosterBigFrameNoLogo = () => (
    <div className={styles.posterContainer}>
      <div
        className={styles.mapContainer}
        style={{
          position: "relative",
        }}
      >
        <GeoMap
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
          isInEditMode={isInEditMode}
          isPrintMode={isPrintMode}
          patterns={undefined}
          mapOpacity={undefined}
          pathWeight={undefined}
          stopFontSize={undefined}
          stopFontColor={undefined}
          stopIDsToDisplayFromConfig={undefined}
          stopColor={undefined}
          stopCircleSize={undefined}
          stopBackgroundColor={undefined}
          isSingleDot={undefined}
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
                {routeDesignConfig.routeName.toUpperCase()}
              </div>
              <div
                className={styles.lineTypeDesc}
                style={{
                  fontFamily: routeDesignConfig.font,
                  fontSize: routeDesignConfig.routeTitleSize || 80,
                }}
              >
                {`${routeDesignConfig.routeType.toUpperCase()} ${routeDesignConfig.routeDesc.toUpperCase()}`}
              </div>
            </div>
          </div>
          <div className={styles.descriptionDetails}>
            {routeDesignConfig.descriptionDetails &&
              getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.numberOfStopsText,
                false
              )}
            <div className={styles.descriptionDetailDeivider}>{"|"}</div>
            {routeDesignConfig.descriptionDetails &&
              getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.launchDateText,
                false
              )}
            <div className={styles.descriptionDetailDeivider}>{"|"}</div>
            {routeDesignConfig.descriptionDetails &&
              getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.launchDateText,
                true
              )}
          </div>
        </div>
      </div>

      <div className={styles.transitLifeCred}>
        <TransitLifeCredit creditFontSize={routeDesignConfig.creditFontSize} />
      </div>
    </div>
  );
  return <PosterBigFrameNoLogo />;
}
