/* eslint-env jest */

import handler from "../../../pages/api/routeData";
import fs from "fs";

jest.mock("fs");

const mockedFs = fs;

function createMockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("/api/routeData", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 400 for invalid routeID and does not touch filesystem", async () => {
    const req = {
      method: "GET",
      query: { routeID: "../etc/passwd" },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid routeID" });
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });

  it("returns 200 and route data for a valid routeID", async () => {
    const req = {
      method: "GET",
      query: { routeID: "TLV1-variant" },
    };
    const res = createMockRes();

    mockedFs.readFileSync.mockReturnValueOnce('{"foo":"bar"}');

    await handler(req, res);

    expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ routeData: '{"foo":"bar"}' });
  });

  it("returns 500 when filesystem read fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const req = {
      method: "GET",
      query: { routeID: "TLV1" },
    };
    const res = createMockRes();

    mockedFs.readFileSync.mockImplementationOnce(() => {
      throw new Error("fs error");
    });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to load route data",
    });
    consoleSpy.mockRestore();
  });
});
