/* eslint-env jest */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import RouteSelector from "../../../components/dataSelectors/RouteSelector";
import axios from "axios";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("RouteSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and combobox when networkId is empty", () => {
    render(<RouteSelector networkId="" />);

    expect(screen.getByText("Select a Route:")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("fetches routes when networkId is provided", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ routeId: "R1", routeName: "Route 1", stops: [], shape: [] }],
    });

    render(<RouteSelector networkId="net-1" />);

    expect(screen.getByText("Select a Route:")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/dataProvider/ptRoutes?networkId=net-1"
      );
    });
  });
});

