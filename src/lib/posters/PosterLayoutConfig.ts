/**
 * Configuration for poster layout variants.
 * Each variant has different layout, styling, and map behavior.
 */
export type PosterVariant =
  | "posterGeoNoLogo"
  | "posterGeoLogo"
  | "posterGeoLogoHorizontal"
  | "posterGeoLogoA0"
  | "posterFullMapLogo"
  | "posterBigFrameNoLogo";

export interface PosterLayoutConfig {
  /** Layout structure */
  headerPosition: "top" | "bottom";
  /** Map renders first (e.g. posterBigFrameNoLogo) */
  mapFirst: boolean;
  /** Show agency logo in header */
  showAgencyLogo: boolean;
  /** Agency logo overlays the map (e.g. posterFullMapLogo) */
  agencyLogoOverMap: boolean;
  /** Show line/route logo next to line name */
  showLineLogo: boolean;
  /** Use CustomDrag for draggable elements */
  useCustomDrag: boolean;
  /** Line name section variant */
  lineNameVariant: "noLogo" | "withLogo";
  /** noLogo: routeName+routeType inline, or routeName/routeType+desc separate */
  noLogoLineNameStyle: "withTypeInline" | "separate";
  /** Uppercase line name and description */
  lineNameUppercase: boolean;
  /** Show description details (stops, launch date, etc.) */
  showDescriptionDetails: boolean;
  /** Description details layout style */
  descriptionDetailsLayout: "divider" | "standard" | "withPipes";
  /** Show geo layer (map tiles) vs solid background */
  showGeoLayer: boolean;
  /** Offset to add to mapZoom */
  mapZoomOffset: number;
  /** Map smooth factor */
  smoothFactor: number;
  /** Pass patterns to map for multi-route display */
  usePatterns: boolean;
  /** Show stop labels on map */
  showStopLabels: boolean;
  /** Show TransitLife credit */
  showCredit: boolean;
  /** RTL/Hebrew support for line name layout */
  hebrewSupport: boolean;
  /** A0 size variant with extra map options */
  isA0Variant: boolean;
}

export const POSTER_LAYOUT_CONFIGS: Record<PosterVariant, PosterLayoutConfig> = {
  posterGeoNoLogo: {
    headerPosition: "top",
    mapFirst: false,
    showAgencyLogo: false,
    agencyLogoOverMap: false,
    showLineLogo: false,
    useCustomDrag: false,
    lineNameVariant: "noLogo",
    noLogoLineNameStyle: "withTypeInline",
    lineNameUppercase: false,
    showDescriptionDetails: true,
    descriptionDetailsLayout: "divider",
    showGeoLayer: true,
    mapZoomOffset: 0,
    smoothFactor: 5,
    usePatterns: true,
    showStopLabels: true,
    showCredit: true,
    hebrewSupport: false,
    isA0Variant: false,
  },
  posterGeoLogo: {
    headerPosition: "top",
    mapFirst: false,
    showAgencyLogo: true,
    agencyLogoOverMap: false,
    showLineLogo: true,
    useCustomDrag: true,
    lineNameVariant: "withLogo",
    noLogoLineNameStyle: "withTypeInline",
    lineNameUppercase: false,
    showDescriptionDetails: true,
    descriptionDetailsLayout: "divider",
    showGeoLayer: true,
    mapZoomOffset: 0,
    smoothFactor: 5,
    usePatterns: false,
    showStopLabels: false,
    showCredit: true,
    hebrewSupport: true,
    isA0Variant: false,
  },
  posterGeoLogoHorizontal: {
    headerPosition: "top",
    mapFirst: false,
    showAgencyLogo: true,
    agencyLogoOverMap: false,
    showLineLogo: true,
    useCustomDrag: false,
    lineNameVariant: "withLogo",
    noLogoLineNameStyle: "withTypeInline",
    lineNameUppercase: false,
    showDescriptionDetails: true,
    descriptionDetailsLayout: "divider",
    showGeoLayer: true,
    mapZoomOffset: 0,
    smoothFactor: 5,
    usePatterns: false,
    showStopLabels: false,
    showCredit: true,
    hebrewSupport: false,
    isA0Variant: false,
  },
  posterGeoLogoA0: {
    headerPosition: "top",
    mapFirst: false,
    showAgencyLogo: true,
    agencyLogoOverMap: false,
    showLineLogo: true,
    useCustomDrag: true,
    lineNameVariant: "withLogo",
    noLogoLineNameStyle: "withTypeInline",
    lineNameUppercase: false,
    showDescriptionDetails: true,
    descriptionDetailsLayout: "divider",
    showGeoLayer: true,
    mapZoomOffset: 0,
    smoothFactor: 5,
    usePatterns: true,
    showStopLabels: true,
    showCredit: true,
    hebrewSupport: true,
    isA0Variant: true,
  },
  posterFullMapLogo: {
    headerPosition: "top",
    mapFirst: false,
    showAgencyLogo: true,
    agencyLogoOverMap: true,
    showLineLogo: false,
    useCustomDrag: false,
    lineNameVariant: "noLogo",
    noLogoLineNameStyle: "separate",
    lineNameUppercase: false,
    showDescriptionDetails: true,
    descriptionDetailsLayout: "standard",
    showGeoLayer: false,
    mapZoomOffset: 0.5,
    smoothFactor: 8,
    usePatterns: false,
    showStopLabels: false,
    showCredit: true,
    hebrewSupport: false,
    isA0Variant: false,
  },
  posterBigFrameNoLogo: {
    headerPosition: "bottom",
    mapFirst: true,
    showAgencyLogo: false,
    agencyLogoOverMap: false,
    showLineLogo: false,
    useCustomDrag: false,
    lineNameVariant: "noLogo",
    noLogoLineNameStyle: "separate",
    lineNameUppercase: true,
    showDescriptionDetails: true,
    descriptionDetailsLayout: "withPipes",
    showGeoLayer: false,
    mapZoomOffset: 0.5,
    smoothFactor: 8,
    usePatterns: false,
    showStopLabels: false,
    showCredit: true,
    hebrewSupport: false,
    isA0Variant: false,
  },
};
