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

  it("renders links to route selector and sample poster", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("link", { name: /browse predefined routes/i })
    ).toHaveAttribute("href", "/routeSelector");
    expect(
      screen.getByRole("link", { name: /open sample poster/i })
    ).toHaveAttribute("href", "/posters/poster?posterType=PosterGeoLogo&routeID=nyc2");
  });
});