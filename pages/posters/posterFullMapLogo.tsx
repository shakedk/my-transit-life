import { Badge, Image } from "theme-ui";
import styles from "./posterFullMapLogo.module.css";

import TransitLifeCredit from "../../components/tranitLifeCredit";
import { useMap } from "./utils";

export default function Page({ routeData, routeDesignConfig, isInEditMode }) {
  const GeoMap = useMap();

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
  const PosterFullMapLogo = () => (
    <div className={styles.posterContainer}>
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
              routeDesignConfig.descriptionDetails.numberOfStopsText,
              true
            )}
            {getDescriptionDetailElement(
              routeDesignConfig.descriptionDetails.launchDateText,
              false
            )}
            {getDescriptionDetailElement(
              routeDesignConfig.descriptionDetails.launchDateText,
              false
            )}
          </div>
        </div>
      </div>
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
        />
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
      </div>
      <div className={styles.transitLifeCred}>
        <TransitLifeCredit />
      </div>
    </div>
  );
  return <PosterFullMapLogo />;
}
