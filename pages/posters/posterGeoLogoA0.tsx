/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/prop-types */
import { Badge, Image, Textarea } from "theme-ui";
import styles from "./posterGeoLogoA0.module.css";
import { useMap } from "./utils";

import TransitLifeCredit from "../../components/tranitLifeCredit";
import CustomDrag from "../../src/utils/CustomDrag";

export default function Page({
  routeData,
  routeDesignConfig,
  isInEditMode,
  isPrintMode,
  stopDataFromDB,
  posterID,
  displsyedPatternsFromDB,
}) {
  const GeoMap = useMap();

  function contains_heb(str) {
    return /[\u0590-\u05FF]/.test(str);
  }

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
  const PosterGeoLogoA0 = () => (
    <div className={styles.posterContainer}>
      <div
        className={
          routeDesignConfig.descriptionDetails
            ? styles.header
            : styles.headerNoDescriptionDetails
        }
      >
        <CustomDrag id={"logo"} isDrggable={isInEditMode}>
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
        </CustomDrag>
        <div className={styles.title}>
          <div
            className={
              routeDesignConfig.descriptionDetails
                ? styles.lineDetails
                : styles.lineDetailsNoDescriptionDetails
            }
          >
            <div
              className={
                contains_heb(routeDesignConfig.routeName)
                  ? styles.lineNameAndLogo
                  : styles.lineNameAndLogoHeb
              }
            >
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
                routeDesignConfig.routeName && (
                  <CustomDrag id={"lineName"} isDrggable={isInEditMode}>
                    <div
                      className={styles.lineName}
                      style={{
                        color:
                          routeDesignConfig.routeNameColor ||
                          routeDesignConfig.backgroundColor,
                        background:
                          routeDesignConfig.routeNameBackground ||
                          "transparent",
                        fontFamily: routeDesignConfig.font,
                        fontSize: routeDesignConfig.logoFontSize || 80,
                        paddingLeft:
                          (routeDesignConfig.routeNameBackground &&
                            routeDesignConfig.routeNamePaddingLeft) ||
                          15,
                        paddingRight:
                          (routeDesignConfig.routeNameBackground &&
                            routeDesignConfig.routeNamePaddingRight) ||
                          15,
                        paddingTop:
                          (routeDesignConfig.routeNameBackground &&
                            routeDesignConfig.routeNamePaddingTop) ||
                          5,
                        paddingBottom:
                          (routeDesignConfig.routeNameBackground &&
                            routeDesignConfig.routeNamePaddingBottom) ||
                          5,
                        marginRight:
                          (routeDesignConfig.routeNameBackground && 40) || 0,
                        fontWeight:
                          routeDesignConfig.routeNameFontWeight || "bolder",
                        height:
                          (routeDesignConfig.routeNameBackground &&
                            `${routeDesignConfig.routeNameHeight}px`) ||
                          "auto",
                      }}
                    >
                      {" "}
                      {routeDesignConfig.routeName}
                    </div>
                  </CustomDrag>
                )
              )}
              <CustomDrag
                id={"roudeDesc"}
                isDrggable={isInEditMode}
                cancel={".textarea"}

                // NOTE
                // NOTE
                // NOTE
                // NOTE
                // NOTE
                // NOTE
                // Commented out so I can edit stop names, should find a way to fix this.

                // onMouseDown={(e) => {
                //   const { clientX, clientY, target } = e;
                //   const { left, top, width, height } = target.getBoundingClientRect();

                //   const bottomRightCornerX = left + width;
                //   const bottomRightCornerY = top + height;

                //   if (Math.abs(clientX - bottomRightCornerX) < 100 && Math.abs(clientY - bottomRightCornerY) < 100) {
                //     e.stopPropagation();
                //   }
                // }}
              >
                <div style={isInEditMode ? { border: "1px solid black", padding: "50px" } : {}}>
                  <Textarea
                    readOnly
                    className="textarea"
                    value={`${routeDesignConfig.routeType} ${routeDesignConfig.routeDesc}`}
                    sx={{
                      zIndex: 100,
                      resize: "both",
                      fontSize: routeDesignConfig.routeTitleSize || 60,
                      fontWeight:
                        routeDesignConfig.routeTitleFontWeight || "auto",
                      padding: 0,
                      fontFamily: routeDesignConfig.font,
                      color: "black",
                      overflowWrap: 'break-word',
                      textAlign: 'center',
                      direction: 'rtl',
                      border: isInEditMode ? "1px solid black" : "none",
                    }}
                    p={4}
                    color="black"
                    bg="transparent"
                  />
                </div>
              </CustomDrag>
            </div>
          </div>
          <CustomDrag id={"details"} isDrggable={isInEditMode}>
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
          </CustomDrag>
          {routeDesignConfig.descriptionDetails && (
            <div className={styles.divider}></div>
          )}
        </div>
      </div>
      <div
        className={
          routeDesignConfig.descriptionDetails
            ? styles.mapContainer
            : styles.mapContainerNoDescriptionDetails
        }
      >
        <GeoMap
          patterns={routeData.patterns}
          multiPolyLine={routeData.multiPolyLine}
          stopBackgroundColor={routeDesignConfig.stopBackgroundColor}
          isSingleDot={routeDesignConfig.isSingleDot}
          stops={routeData.stops}
          pathWeight={routeDesignConfig.pathWeight}
          backgroundColor={routeDesignConfig.backgroundColor}
          tileLayerName={routeDesignConfig.tileLayerName}
          pathColor={routeDesignConfig.pathColor}
          mapZoom={routeDesignConfig.mapZoom}
          font={routeDesignConfig.font}
          showMarkers={true}
          isInEditMode={isInEditMode}
          isPrintMode={isPrintMode}
          stopFontSize={routeDesignConfig.stopFontSize}
          stopFontColor={routeDesignConfig.stopFontColor}
          stopIDsToDisplayFromConfig={
            routeDesignConfig.stopIDsToDisplayFromConfig
          }
          stopColor={routeDesignConfig.stopColor}
          stopCircleSize={routeDesignConfig.stopCircleSize}
          mapOpacity={undefined}
          showGeoLayer={undefined}
          smoothFactor={undefined}
          stopDataFromDB={stopDataFromDB}
          posterID={posterID}
          displsyedPatternsFromDB={displsyedPatternsFromDB}
        />
      </div>
      <div
        className={
          routeDesignConfig.descriptionDetails
            ? styles.transitLifeCred
            : styles.transitLifeCredNoDescriptionDetails
        }
      >
        <TransitLifeCredit creditFontSize={routeDesignConfig.creditFontSize} />
      </div>
    </div>
  );
  return <PosterGeoLogoA0 />;
}
