/* eslint-env jest */

import axios from "axios";
import { getAuthAxios } from "../../lib/api/apiClient";
import { createPosterInDB, getPosterIDInDB } from "../../lib/posters/utils";

jest.mock("../../lib/api/apiClient", () => ({
  getAuthAxios: jest.fn(() => ({
    post: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock("axios");

describe("createPosterInDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls POST with correct slug format", async () => {
    const mockPost = jest.fn(() => Promise.resolve());
    getAuthAxios.mockReturnValue({ post: mockPost });

    await createPosterInDB("posterGeoLogo", "TLV1-variant");

    expect(mockPost).toHaveBeenCalledWith("/api/poster/", {
      posterType: "posterGeoLogo",
      routeID: "TLV1-variant",
      slug: "poster-geo-logo-tlv1-variant",
    });
  });

  it("handles errors without throwing", async () => {
    const mockPost = jest.fn(() => Promise.reject(new Error("network error")));
    getAuthAxios.mockReturnValue({ post: mockPost });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await expect(createPosterInDB("posterGeoLogo", "TLV1")).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("getPosterIDInDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns posterID from API response", async () => {
    axios.get.mockResolvedValueOnce({ data: { posterID: "abc123" } });

    const result = await getPosterIDInDB("posterGeoLogo", "TLV1");

    expect(axios.get).toHaveBeenCalledWith("/api/poster/getBySlug", {
      params: { slug: "poster-geo-logo-tlv1" },
    });
    expect(result).toBe("abc123");
  });

  it("returns undefined on error", async () => {
    axios.get.mockRejectedValueOnce(new Error("not found"));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const result = await getPosterIDInDB("posterGeoLogo", "TLV1");

    expect(result).toBeUndefined();
    consoleSpy.mockRestore();
  });
});
