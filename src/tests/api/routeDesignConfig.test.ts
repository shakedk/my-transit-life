/* eslint-env jest */

import handler from "../../../pages/api/routeDesignConfigGeoNoLogo";
import fs from "fs";

jest.mock("fs");

const mockedFs = fs as unknown as {
  readFileSync: jest.Mock;
};

function createMockRes() {
  const res: {
    status: jest.Mock;
    json: jest.Mock;
  } = {
    status: jest.fn(() => res as unknown as any),
    json: jest.fn(() => res as unknown as any),
  };
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
    } as any;
    const res = createMockRes();

    await handler(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid routeID" });
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });

  it("returns 400 for routeID with invalid characters", async () => {
    const req = {
      method: "GET",
      query: { routeID: "route;id" },
    } as any;
    const res = createMockRes();

    await handler(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });

  it("returns 200 and config for valid routeID", async () => {
    const req = {
      method: "GET",
      query: { routeID: "TLV1" },
    } as any;
    const res = createMockRes();

    mockedFs.readFileSync.mockReturnValueOnce('{"colors":{}}');

    await handler(req, res as any);

    expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ routeData: '{"colors":{}}' });
  });

  it("returns 405 for non-GET methods", async () => {
    const req = {
      method: "POST",
      query: { routeID: "TLV1" },
    } as any;
    const res = createMockRes();

    await handler(req, res as any);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });
});

