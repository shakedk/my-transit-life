import React from "react";
import { Badge, Image } from "theme-ui";
import TransitLifeCredit from "../transitLifeCredit";
import CustomDrag from "../../src/utils/CustomDrag";
import { useMap } from "../../src/lib/posters/utils";
import {
  type PosterVariant,
  type PosterLayoutConfig,
  POSTER_LAYOUT_CONFIGS,
} from "../../src/lib/posters/PosterLayoutConfig";

export interface PosterLayoutProps {
  routeData: Record<string, unknown> & {
    multiPolyLine?: [number, number][][];
    stops?: Array<{
      stop_id: string;
      stop_name: string;
      stop_lat: number;
      stop_lon: number;
    }>;
    patterns?: Array<{
      properties: { route_id: string };
      geometry: { coordinates: [number, number][] };
    }>;
  };
  routeDesignConfig: Record<string, unknown> & {
    font?: string;
    backgroundColor?: string;
    routeName?: string;
    routeType?: string;
    routeDesc?: string;
    routeTitleSize?: number;
    routeTitleFont?: string;
    routeTitleFontWeight?: string;
    lineDetailsFontSize?: number;
    descriptionDetails?: {
      numberOfStopsText?: string;
      locationText?: string;
      launchDateText?: string;
    };
    agencyLogoPath?: string;
    agencyLogoTop?: number;
    agencyLogoRight?: number;
    agencyLogoWidth?: number;
    agencyLogoHeight?: number;
    logoPath?: string;
    logoPadding?: number;
    logoWidth?: number;
    logoHeight?: number;
    logoFontSize?: number;
    routeNameColor?: string;
    routeNameBackground?: string;
    routeNamePaddingTop?: number;
    routeNamePaddingBottom?: number;
    routeNamePaddingLeft?: number;
    routeNamePaddingRight?: number;
    routeNameFontWeight?: string;
    routeNameHeight?: number;
    routeNameAndTypeSize?: number;
    routeDescColor?: string;
    creditFontSize?: number;
    creditFont?: string;
    tileLayerName?: string;
    pathColor?: string;
    pathWeight?: number;
    mapZoom?: number;
    mapOpacity?: number;
    stopFontSize?: number;
    stopFontColor?: string;
    stopFont?: string;
    stopIDsToDisplayFromConfig?: string[];
    stopColor?: string;
    stopCircleSize?: number;
    stopBackgroundColor?: string;
    isSingleDot?: boolean;
    isSimpleDot?: boolean;
    routeOverlayPatternNumber?: number;
    routeOverlayPatternColor?: string;
    showStopLabels?: boolean;
  };
  isInEditMode: boolean;
  isPrintMode: boolean;
  stopDataFromDB: Record<string, unknown>;
  posterID: string | null;
  displayedPatternsFromDB: Record<string, { toDisplay?: boolean }>;
  layout: PosterVariant;
  styles: Record<string, string>;
  onMapViewChange?: (longitude: number, latitude: number, zoom: number) => void;
  /** When route shape is stub (null island), use this so the map shows the correct region. */
  mapFallbackCenter?: { longitude: number; latitude: number };
}

function containsHeb(str: string): boolean {
  return /[\u0590-\u05FF]/.test(str);
}

export default function PosterLayout({
  routeData,
  routeDesignConfig,
  isInEditMode,
  isPrintMode,
  stopDataFromDB,
  mapFallbackCenter,
  posterID,
  displayedPatternsFromDB,
  layout,
  styles: css,
  onMapViewChange,
}: PosterLayoutProps) {
  const config: PosterLayoutConfig = POSTER_LAYOUT_CONFIGS[layout];
  const GeoMap = useMap();

  const getDescriptionDetailElement = (
    detail: string | undefined,
    isFirst?: boolean
  ) => {
    if (!detail) return null;
    const paddingBottom = isFirst ? 2 : 1;
    return (
      <div>
        <Badge
          sx={{
            zIndex: 100,
            fontSize: routeDesignConfig.lineDetailsFontSize || 18,
            fontWeight: "normal",
            padding: 0,
            paddingBottom: config.descriptionDetailsLayout === "withPipes" ? 2 : paddingBottom,
            fontFamily: routeDesignConfig.font,
            color: "black",
            bg: "transparent",
          }}
        >
          {detail}
        </Badge>
      </div>
    );
  };

  const wrapWithDrag = (id: string, children: React.ReactNode, cancel?: string) =>
    config.useCustomDrag ? (
      <CustomDrag
        key={id}
        id={id}
        isDraggable={isInEditMode}
        cancel={cancel}
      >
        {children}
      </CustomDrag>
    ) : (
      <React.Fragment key={id}>{children}</React.Fragment>
    );

  const renderAgencyLogo = () => {
    if (!config.showAgencyLogo || !routeDesignConfig.agencyLogoPath) return null;
    const logo = (
      <div
        style={{
          position: "absolute",
          top: `${routeDesignConfig.agencyLogoTop ?? 0}px`,
          right: `${routeDesignConfig.agencyLogoRight ?? 0}px`,
          zIndex: config.agencyLogoOverMap ? undefined : 1000,
        }}
      >
        <Image
          src={routeDesignConfig.agencyLogoPath}
          alt=""
          sx={{
            width: routeDesignConfig.agencyLogoWidth,
            height: routeDesignConfig.agencyLogoHeight,
          }}
        />
      </div>
    );
    return config.useCustomDrag && !config.agencyLogoOverMap
      ? wrapWithDrag("logo", logo)
      : logo;
  };

  const renderLineNameSection = () => {
    const lineNameClass =
      config.lineNameVariant === "withLogo" && config.hebrewSupport
        ? containsHeb(routeDesignConfig.routeName || "")
          ? css.lineNameAndLogoHeb
          : css.lineNameAndLogo
        : config.lineNameVariant === "withLogo"
          ? css.lineNameAndLogo
          : css.lineNameNoLogo;

    const routeName = config.lineNameUppercase
      ? String(routeDesignConfig.routeName || "").toUpperCase()
      : routeDesignConfig.routeName;
    const routeType = config.lineNameUppercase
      ? String(routeDesignConfig.routeType || "").toUpperCase()
      : routeDesignConfig.routeType;
    const routeDesc = config.lineNameUppercase
      ? String(routeDesignConfig.routeDesc || "").toUpperCase()
      : routeDesignConfig.routeDesc;

    if (config.lineNameVariant === "noLogo") {
      const withTypeInline = config.noLogoLineNameStyle === "withTypeInline";
      return (
        <div className={lineNameClass}>
          <div
            className={css.lineName}
            style={{
              color: routeDesignConfig.backgroundColor,
              fontFamily: routeDesignConfig.font,
              fontWeight: "bolder",
              fontSize:
                routeDesignConfig.routeNameAndTypeSize ||
                routeDesignConfig.routeTitleSize ||
                80,
            }}
          >
            {routeName}
            {withTypeInline && (
              <div
                className={css.lineType}
                style={{
                  color: routeDesignConfig.backgroundColor,
                  paddingLeft: 20,
                  fontWeight: "bolder",
                  fontFamily: routeDesignConfig.font,
                  fontSize:
                    routeDesignConfig.routeNameAndTypeSize ||
                    routeDesignConfig.routeTitleSize ||
                    80,
                }}
              >
                {`${routeType}`}
              </div>
            )}
          </div>
          <div
            className={css.lineTypeDesc}
            style={
              !withTypeInline
                ? {
                    fontFamily: routeDesignConfig.font,
                    fontSize: routeDesignConfig.routeTitleSize || 80,
                  }
                : undefined
            }
          >
            {withTypeInline ? (
              <div
                className={css.lineDesc}
                style={{
                  fontFamily:
                    routeDesignConfig.routeTitleFont || routeDesignConfig.font,
                  fontWeight: 200,
                  fontSize: routeDesignConfig.routeTitleSize || 80,
                }}
              >
                {`${routeDesc}`}
              </div>
            ) : (
              `${routeType} ${routeDesc}`
            )}
          </div>
        </div>
      );
    }

    // withLogo variant
    if (config.isA0Variant) {
      return (
        <div className={lineNameClass}>
          {routeDesignConfig.logoPath ? (
            <Image
              src={routeDesignConfig.logoPath}
              alt=""
              sx={{
                padding: routeDesignConfig.logoPadding || 0,
                width: routeDesignConfig.logoWidth || 140,
                height: routeDesignConfig.logoHeight || 140,
              }}
            />
          ) : (
            routeDesignConfig.routeName &&
            wrapWithDrag(
              "lineName",
              <div
                style={
                  isInEditMode
                    ? { border: "1px solid black", padding: "50px" }
                    : {}
                }
              >
                <div
                  className="textareaLineName"
                  style={{
                    color:
                      routeDesignConfig.routeNameColor ||
                      routeDesignConfig.backgroundColor,
                    background:
                      routeDesignConfig.routeNameBackground || "transparent",
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
                    width: "5000px",
                    overflowWrap: "break-word",
                    textAlign: "left",
                  }}
                >
                  {routeDesignConfig.routeName}
                </div>
              </div>,
              ".textareaLineName"
            )
          )}
          {routeDesignConfig.routeDesc &&
            wrapWithDrag(
              "routeDesc",
              <div
                style={
                  isInEditMode
                    ? { border: "1px solid black", padding: "50px" }
                    : {}
                }
              >
                <div
                  className="textareaRouteDesc"
                  style={{
                    zIndex: 100,
                    resize: "both",
                    fontSize: routeDesignConfig.routeTitleSize || 60,
                    fontWeight:
                      routeDesignConfig.routeTitleFontWeight || "auto",
                    padding: 0,
                    fontFamily: routeDesignConfig.font,
                    overflowWrap: "break-word",
                    textAlign: "center",
                    color: routeDesignConfig.routeDescColor,
                    border: isInEditMode ? "1px solid black" : "none",
                    width: "4000px",
                  }}
                >
                  {`${routeType} ${routeDesc}`}
                </div>
              </div>,
              ".textareaRouteDesc"
            )}
        </div>
      );
    }

    // Standard withLogo (posterGeoLogo, posterGeoLogoHorizontal)
    const lineNameContent = (
      <div
        className={css.lineName}
        style={{
          color:
            routeDesignConfig.routeNameColor ||
            routeDesignConfig.backgroundColor,
          background: routeDesignConfig.routeNameBackground || "transparent",
          fontFamily: routeDesignConfig.font,
          fontSize:
            routeDesignConfig.logoFontSize ||
            routeDesignConfig.routeTitleSize ||
            80,
          paddingLeft:
            (routeDesignConfig.routeNameBackground && 15) || 0,
          paddingRight:
            (routeDesignConfig.routeNameBackground && 15) || 0,
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
          fontWeight: routeDesignConfig.routeNameFontWeight || "bolder",
          height:
            (routeDesignConfig.routeNameBackground &&
              `${routeDesignConfig.routeNameHeight}px`) ||
            "auto",
        }}
      >
        {" "}
        {routeDesignConfig.routeName}
      </div>
    );

    const routeDescContent = (
      <Badge
        sx={{
          zIndex: 100,
          fontSize: routeDesignConfig.routeTitleSize || 60,
          fontWeight: routeDesignConfig.routeTitleFontWeight || "auto",
          padding: 0,
          paddingLeft: config.useCustomDrag ? 0 : 10,
          fontFamily: routeDesignConfig.font,
          color: "black",
        }}
        p={4}
        color="black"
        bg="transparent"
      >
        {`${routeType} ${routeDesc}`}
      </Badge>
    );

    return (
      <div className={lineNameClass}>
        {routeDesignConfig.logoPath ? (
          <Image
            src={routeDesignConfig.logoPath}
            alt=""
            sx={{
              padding: routeDesignConfig.logoPadding || 0,
              width: routeDesignConfig.logoWidth || 140,
              height: routeDesignConfig.logoHeight || 140,
            }}
          />
        ) : config.useCustomDrag ? (
          wrapWithDrag("lineName", lineNameContent)
        ) : (
          lineNameContent
        )}
        {config.useCustomDrag
          ? wrapWithDrag("routeDesc", routeDescContent)
          : routeDescContent}
      </div>
    );
  };

  const renderDescriptionDetails = () => {
    if (!config.showDescriptionDetails || !routeDesignConfig.descriptionDetails)
      return null;

    const details = routeDesignConfig.descriptionDetails;

    if (config.descriptionDetailsLayout === "withPipes") {
      return (
        <div className={css.descriptionDetails}>
          {details.numberOfStopsText &&
            getDescriptionDetailElement(details.numberOfStopsText)}
          <div className={css.descriptionDetailDivider}>{"|"}</div>
          {details.launchDateText &&
            getDescriptionDetailElement(details.launchDateText)}
          <div className={css.descriptionDetailDivider}>{"|"}</div>
          {details.launchDateText &&
            getDescriptionDetailElement(details.launchDateText)}
        </div>
      );
    }

    const content = config.descriptionDetailsLayout === "divider" ? (
      <>
        {getDescriptionDetailElement(
          details.numberOfStopsText,
          true
        )}
        {details.locationText &&
          getDescriptionDetailElement(details.locationText, false)}
        <br />
        {getDescriptionDetailElement(details.launchDateText, false)}
      </>
    ) : (
      <>
        {getDescriptionDetailElement(details.numberOfStopsText)}
        {getDescriptionDetailElement(details.launchDateText)}
        {getDescriptionDetailElement(details.launchDateText)}
      </>
    );

    const wrapped = config.useCustomDrag ? (
      wrapWithDrag("details", <div className={css.descriptionDetails}>{content}</div>)
    ) : (
      <div className={css.descriptionDetails}>{content}</div>
    );

    return (
      <>
        {wrapped}
        {config.descriptionDetailsLayout === "divider" && (
          <div className={css.divider} />
        )}
      </>
    );
  };

  const renderHeader = () => {
    const hasDescriptionDetails =
      config.showDescriptionDetails && routeDesignConfig.descriptionDetails;
    const headerClass = hasDescriptionDetails
      ? css.header
      : css.headerNoDescriptionDetails ?? css.header;

    const headerContent = (
      <>
        {config.showAgencyLogo && !config.agencyLogoOverMap && renderAgencyLogo()}
        <div className={css.title}>
          <div
            className={
              hasDescriptionDetails
                ? css.lineDetails
                : css.lineDetailsNoDescriptionDetails ?? css.lineDetails
            }
          >
            {renderLineNameSection()}
          </div>
          {config.descriptionDetailsLayout === "divider" &&
            config.showDescriptionDetails &&
            renderDescriptionDetails()}
          {config.descriptionDetailsLayout === "standard" &&
            renderDescriptionDetails()}
          {config.descriptionDetailsLayout === "withPipes" &&
            renderDescriptionDetails()}
        </div>
      </>
    );

    return (
      <div
        className={headerClass}
        style={
          config.showGeoLayer === false && routeDesignConfig.backgroundColor
            ? { backgroundColor: routeDesignConfig.backgroundColor }
            : undefined
        }
      >
        {headerContent}
      </div>
    );
  };

  const stopDataFromDBTyped = stopDataFromDB as Record<
    string,
    {
      marker_lat?: number;
      marker_lon?: number;
      label_lat?: number;
      label_lon?: number;
      labelWidth?: number;
      labelHeight?: number;
      stopModifiedName?: string;
      toDisplay?: boolean;
    }
  >;

  const renderMap = () => (
    <div
      className={
        config.showDescriptionDetails && routeDesignConfig.descriptionDetails
          ? css.mapContainer
          : css.mapContainerNoDescriptionDetails ?? css.mapContainer
      }
      style={{ position: "relative" }}
    >
      <GeoMap
        multiPolyLine={routeData.multiPolyLine}
        stops={routeData.stops ?? []}
        patterns={config.usePatterns ? routeData.patterns : undefined}
        backgroundColor={routeDesignConfig.backgroundColor}
        mapOpacity={routeDesignConfig.mapOpacity}
        tileLayerName={routeDesignConfig.tileLayerName}
        pathColor={routeDesignConfig.pathColor}
        pathWeight={routeDesignConfig.pathWeight}
        mapZoom={
          routeDesignConfig.mapCenterLongitude != null &&
          routeDesignConfig.mapCenterLatitude != null &&
          typeof routeDesignConfig.mapZoom === "number"
            ? (routeDesignConfig.mapZoom as number)
            : (routeDesignConfig.mapZoom ?? 10) + config.mapZoomOffset
        }
        font={routeDesignConfig.font}
        showGeoLayer={config.showGeoLayer}
        smoothFactor={config.smoothFactor}
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
        stopBackgroundColor={routeDesignConfig.stopBackgroundColor}
        isSingleDot={routeDesignConfig.isSingleDot}
        isSimpleDot={routeDesignConfig.isSimpleDot}
        stopDataFromDB={stopDataFromDBTyped}
        posterID={posterID ?? undefined}
        displayedPatternsFromDB={displayedPatternsFromDB}
        routeOverlayPatternNumber={
          config.isA0Variant
            ? routeDesignConfig.routeOverlayPatternNumber
            : undefined
        }
        routeOverlayPatternColor={
          config.isA0Variant
            ? routeDesignConfig.routeOverlayPatternColor
            : undefined
        }
        showStopLabels={config.showStopLabels || routeDesignConfig.showStopLabels}
        mapCenterLongitude={routeDesignConfig.mapCenterLongitude as number | undefined}
        mapCenterLatitude={routeDesignConfig.mapCenterLatitude as number | undefined}
        onMapViewChange={onMapViewChange}
        mapFallbackCenter={mapFallbackCenter}
      />
      {config.agencyLogoOverMap && renderAgencyLogo()}
    </div>
  );

  const mapSection = renderMap();
  const headerSection = renderHeader();

  const creditSection = config.showCredit && (
    <div
      className={
        config.showDescriptionDetails && routeDesignConfig.descriptionDetails
          ? css.transitLifeCred
          : css.transitLifeCredNoDescriptionDetails ?? css.transitLifeCred
      }
    >
      <TransitLifeCredit
        creditFontSize={routeDesignConfig.creditFontSize}
        font={routeDesignConfig.creditFont}
      />
    </div>
  );

  const content = config.mapFirst ? (
    <>
      {mapSection}
      {headerSection}
      {creditSection}
    </>
  ) : (
    <>
      {headerSection}
      {mapSection}
      {creditSection}
    </>
  );

  return <div className={css.posterContainer}>{content}</div>;
}
