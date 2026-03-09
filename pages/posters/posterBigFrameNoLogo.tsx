import { Badge } from "theme-ui";
import styles from "./posterBigFrameNoLogo.module.css";
import React from "react";
import TransitLifeCredit from "../../components/tranitLifeCredit";
import {
  useMap,
  getPosterServerSideProps,
} from "../../src/lib/posters/utils";

export const getServerSideProps = (context) =>
  getPosterServerSideProps(context, "PosterBigFrameNoLogo");

export default function Page(props) {
  const routeData =
    props.routeData?.routeData != null
      ? JSON.parse(props.routeData.routeData)
      : props.routeData;
  const routeDesignConfig =
    props.routeDesignConfig?.routeData != null
      ? JSON.parse(props.routeDesignConfig.routeData)
      : props.routeDesignConfig;
  if (!routeData || !routeDesignConfig) return null;
  const isInEditMode = props.isInEditMode ?? false;
  const isPrintMode = props.isPrintMode ?? false;
  const stopDataFromDB = props.stopDataFromDB ?? {};
  const posterID = props.posterID ?? null;
  const displsyedPatternsFromDB = props.displsyedPatternsFromDB ?? {};
  const GeoMap = useMap();

  const getDescriptionDetailElement = (detail: string) => (
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
          stopDataFromDB={stopDataFromDB}
          posterID={posterID}
          displsyedPatternsFromDB={displsyedPatternsFromDB}
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
                routeDesignConfig.descriptionDetails?.numberOfStopsText
                // false
              )}
            <div className={styles.descriptionDetailDeivider}>{"|"}</div>
            {routeDesignConfig.descriptionDetails &&
              getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.launchDateText
                // false
              )}
            <div className={styles.descriptionDetailDeivider}>{"|"}</div>
            {routeDesignConfig.descriptionDetails &&
              getDescriptionDetailElement(
                routeDesignConfig.descriptionDetails?.launchDateText
                // true
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
