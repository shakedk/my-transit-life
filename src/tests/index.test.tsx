/* eslint-env jest */
import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "../../app/page";

describe("HomePage", () => {
  it("renders without crashing", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { name: "My Transit Life" })
    ).toBeInTheDocument();
  });

  it("renders links to route selector and example posters", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("link", { name: /browse all routes/i })
    ).toHaveAttribute("href", "/routeSelector");
    expect(
      screen.getByRole("link", { name: /nyc subway/i })
    ).toHaveAttribute(
      "href",
      "/posters/poster?posterType=PosterGeoLogo&routeID=nyc2"
    );
  });
});

