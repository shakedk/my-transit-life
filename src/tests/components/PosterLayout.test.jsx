/* eslint-env jest */

import React from "react";
import { render, screen } from "@testing-library/react";
import PosterLayout from "../../../components/posters/PosterLayout";

jest.mock("next/router", () => ({
  useRouter: () => ({
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
  }),
}));

jest.mock("../../../src/lib/posters/utils", () => ({
  useMap: () => {
    const MockMap = () => <div data-testid="mock-map">Map</div>;
    return MockMap;
  },
  getPosterIDInDB: jest.fn(() => Promise.resolve("mock-poster-id")),
}));

jest.mock("../../../src/utils/CustomDrag", () => {
  return function MockCustomDrag({ children }) {
    return <div data-testid="mock-custom-drag">{children}</div>;
  };
});

const minimalRouteData = {
  multiPolyLine: [[[0, 0], [1, 1]]],
  stops: [
    { stop_id: "s1", stop_name: "Stop 1", stop_lat: 32, stop_lon: 34 },
  ],
  patterns: [],
};

const minimalRouteDesignConfig = {
  font: "Arial",
  backgroundColor: "#fff",
  routeName: "Route 5",
  routeType: "Bus",
  routeDesc: "Downtown",
  routeTitleSize: 80,
  creditFontSize: 14,
};

const minimalStyles = {
  posterContainer: "posterContainer",
  header: "header",
  mapContainer: "mapContainer",
  title: "title",
  lineDetails: "lineDetails",
  lineNameNoLogo: "lineNameNoLogo",
  lineNameAndLogo: "lineNameAndLogo",
  lineName: "lineName",
  lineType: "lineType",
  lineTypeDesc: "lineTypeDesc",
  lineDesc: "lineDesc",
  descriptionDetails: "descriptionDetails",
  descriptionDetailDeivider: "descriptionDetailDeivider",
  divider: "divider",
  transitLifeCred: "transitLifeCred",
};

describe("PosterLayout", () => {
  const defaultProps = {
    routeData: minimalRouteData,
    routeDesignConfig: minimalRouteDesignConfig,
    isInEditMode: false,
    isPrintMode: false,
    stopDataFromDB: {},
    posterID: null,
    displsyedPatternsFromDB: {},
    styles: minimalStyles,
  };

  it("renders posterGeoNoLogo layout", () => {
    render(
      <PosterLayout
        {...defaultProps}
        layout="posterGeoNoLogo"
      />
    );

    expect(screen.getByText("Route 5")).toBeInTheDocument();
    expect(screen.getByText("Downtown")).toBeInTheDocument();
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
    expect(screen.getByText(/Produced by www.transitlife.co/i)).toBeInTheDocument();
  });

  it("renders posterGeoLogo layout with route name", () => {
    render(
      <PosterLayout
        {...defaultProps}
        layout="posterGeoLogo"
      />
    );

    expect(screen.getByText(/Route 5/)).toBeInTheDocument();
    expect(screen.getByText(/Bus Downtown/)).toBeInTheDocument();
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("renders posterBigFrameNoLogo with map first and uppercase", () => {
    render(
      <PosterLayout
        {...defaultProps}
        layout="posterBigFrameNoLogo"
      />
    );

    expect(screen.getByText("ROUTE 5")).toBeInTheDocument();
    expect(screen.getByText("BUS DOWNTOWN")).toBeInTheDocument();
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("renders posterFullMapLogo layout", () => {
    render(
      <PosterLayout
        {...defaultProps}
        layout="posterFullMapLogo"
      />
    );

    expect(screen.getByText("Route 5")).toBeInTheDocument();
    expect(screen.getByText("Bus Downtown")).toBeInTheDocument();
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("renders description details when provided", () => {
    const configWithDetails = {
      ...minimalRouteDesignConfig,
      descriptionDetails: {
        numberOfStopsText: "12 stops",
        locationText: "Tel Aviv",
        launchDateText: "2020",
      },
    };

    render(
      <PosterLayout
        {...defaultProps}
        routeDesignConfig={configWithDetails}
        layout="posterGeoNoLogo"
      />
    );

    expect(screen.getByText("12 stops")).toBeInTheDocument();
    expect(screen.getByText("Tel Aviv")).toBeInTheDocument();
    expect(screen.getByText("2020")).toBeInTheDocument();
  });

  it("applies posterContainer class from styles", () => {
    const { container } = render(
      <PosterLayout
        {...defaultProps}
        layout="posterGeoNoLogo"
      />
    );

    const posterEl = container.querySelector(".posterContainer");
    expect(posterEl).toBeInTheDocument();
  });
});
