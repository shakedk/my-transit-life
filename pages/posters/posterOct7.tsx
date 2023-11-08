import { Badge } from "theme-ui";
import styles from "./PosterOct7.module.css";
import React from "react";
import TransitLifeCredit from "../../components/tranitLifeCredit";
import { Image } from "theme-ui";
import { useMap } from "./utils";

export default function Page({
  routeData,
  routeDesignConfig,
  isInEditMode,
  isPrintMode,
}) {
  const GeoMap = useMap();

  const getDescriptionDetailElement = (detail: string) => (
    <div>
      <Badge
        sx={{
          zIndex: 100,
          fontSize: routeDesignConfig.lineDetailsFontSize || 50,
          fontWeight: "normal",
          padding: 0,
          paddingBottom: 2,
          fontFamily:
            routeDesignConfig.descriptionDetailsFont || routeDesignConfig.font,
          color: "black",
        }}
        bg="transparent"
      >
        {detail}
      </Badge>
    </div>
  );
  const getBottomDateElement = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        // width: "50%",
      }}
    >
      <div style={{ flex: 1, height: "10px", backgroundColor: "black", width: '1140px', marginRight: '100px'}} />
      <Badge
        sx={{
          zIndex: 100,
          fontSize: routeDesignConfig.bottomDateSize || 50,
          fontWeight: "normal",
          padding: 0,
          paddingBottom: 2,
          fontFamily:
            routeDesignConfig.descriptionDetailsFont || routeDesignConfig.font,
          color: "black",
        }}
        bg="transparent"
      >
        {"OCTOBER 7TH 2023"}
      </Badge>

      <div style={{ flex: 1, height: "10px", backgroundColor: "black", marginLeft: '100px' }} />
    </div>
  );
  const PosterOct7 = () => (
    <div className={styles.posterContainer}>
      <div
        className={styles.mapContainer}
        style={{
          position: "relative",
        }}
      >
        <GeoMap
          multiPolyLine={routeData.multiPolyLine}
          showGeoLayer={true}
          stops={routeData.stops}
          backgroundColor={routeDesignConfig.backgroundColor}
          mapOpacity={routeDesignConfig.mapOpacity}
          tileLayerName={routeDesignConfig.tileLayerName}
          pathColor={routeDesignConfig.pathColor}
          mapZoom={routeDesignConfig.mapZoom + 0.5} //As we have more space to show the route
          font={routeDesignConfig.font}
          smoothFactor={8}
          showMarkers
          isInEditMode={isInEditMode}
          isPrintMode={isPrintMode}
          patterns={undefined}
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
      {routeDesignConfig.routeName === "NOVA" && (
        <div
          className="nova-logo"
          style={{
            zIndex: 1000,
            position: "absolute",
            top: `1500px`,
            right: `2000px`,
          }}
        >
          <Image
            src={routeDesignConfig.agencyLogoPath}
            sx={{
              width: 1500,
              height: 1500,
            }}
          ></Image>
        </div>
      )}
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
          </div>
          <div className={styles.bottomDate}>{getBottomDateElement()}</div>
        </div>
      </div>
    </div>
  );
  return <PosterOct7 />;
}
