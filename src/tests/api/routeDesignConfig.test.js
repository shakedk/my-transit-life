/* eslint-env jest */

import handler from "../../../pages/api/routeDesignConfigGeoNoLogo";
import fs from "fs";

jest.mock("fs");

const mockedFs = fs;

function createMockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("/api/routeDesignConfigGeoNoLogo", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 400 for path traversal routeID and does not touch filesystem", async () => {
    const req = {
      method: "GET",
      query: { routeID: "../../../etc/passwd" },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid routeID" });
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });

  it("returns 400 for routeID with invalid characters", async () => {
    const req = {
      method: "GET",
      query: { routeID: "route;id" },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });

  it("returns 200 and config for valid routeID", async () => {
    const req = {
      method: "GET",
      query: { routeID: "TLV1" },
    };
    const res = createMockRes();

    mockedFs.readFileSync.mockReturnValueOnce('{"colors":{}}');

    await handler(req, res);

    expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ routeData: '{"colors":{}}' });
  });

  it("returns 405 for non-GET methods", async () => {
    const req = {
      method: "POST",
      query: { routeID: "TLV1" },
    };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });
});
