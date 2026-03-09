/* eslint-env jest */

import { POSTER_LAYOUT_CONFIGS } from "../../lib/posters/PosterLayoutConfig";

const VALID_VARIANTS = [
  "posterGeoNoLogo",
  "posterGeoLogo",
  "posterGeoLogoHorizontal",
  "posterGeoLogoA0",
  "posterFullMapLogo",
  "posterBigFrameNoLogo",
];

describe("PosterLayoutConfig", () => {
  it("exports config for all 6 poster variants", () => {
    expect(Object.keys(POSTER_LAYOUT_CONFIGS)).toEqual(
      expect.arrayContaining(VALID_VARIANTS)
    );
    expect(Object.keys(POSTER_LAYOUT_CONFIGS)).toHaveLength(6);
  });

  it("each config has required layout properties", () => {
    const requiredProps = [
      "headerPosition",
      "mapFirst",
      "showAgencyLogo",
      "agencyLogoOverMap",
      "showLineLogo",
      "useCustomDrag",
      "lineNameVariant",
      "noLogoLineNameStyle",
      "lineNameUppercase",
      "showDescriptionDetails",
      "descriptionDetailsLayout",
      "showGeoLayer",
      "mapZoomOffset",
      "smoothFactor",
      "usePatterns",
      "showStopLabels",
      "showCredit",
      "hebrewSupport",
      "isA0Variant",
    ];

    VALID_VARIANTS.forEach((variant) => {
      const config = POSTER_LAYOUT_CONFIGS[variant];
      requiredProps.forEach((prop) => {
        expect(config).toHaveProperty(prop);
      });
    });
  });

  it("posterBigFrameNoLogo has map first and uppercase", () => {
    const config = POSTER_LAYOUT_CONFIGS.posterBigFrameNoLogo;
    expect(config.mapFirst).toBe(true);
    expect(config.lineNameUppercase).toBe(true);
  });

  it("posterFullMapLogo has no geo layer and logo over map", () => {
    const config = POSTER_LAYOUT_CONFIGS.posterFullMapLogo;
    expect(config.showGeoLayer).toBe(false);
    expect(config.agencyLogoOverMap).toBe(true);
  });

  it("posterGeoNoLogo uses patterns and stop labels", () => {
    const config = POSTER_LAYOUT_CONFIGS.posterGeoNoLogo;
    expect(config.usePatterns).toBe(true);
    expect(config.showStopLabels).toBe(true);
  });
});
