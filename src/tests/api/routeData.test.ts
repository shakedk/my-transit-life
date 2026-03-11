/* eslint-env jest */

import handler from "../../../pages/api/routeData";
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

describe("/api/routeData", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 400 for invalid routeID and does not touch filesystem", async () => {
    const req = {
      method: "GET",
      query: { routeID: "../etc/passwd" },
    } as any;
    const res = createMockRes();

    await handler(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid routeID" });
    expect(mockedFs.readFileSync).not.toHaveBeenCalled();
  });

  it("returns 200 and route data for a valid routeID", async () => {
    const req = {
      method: "GET",
      query: { routeID: "TLV1-variant" },
    } as any;
    const res = createMockRes();

    mockedFs.readFileSync.mockReturnValueOnce('{"foo":"bar"}');

    await handler(req, res as any);

    expect(mockedFs.readFileSync).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ routeData: '{"foo":"bar"}' });
  });

  it("returns 500 when filesystem read fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const req = {
      method: "GET",
      query: { routeID: "TLV1" },
    } as any;
    const res = createMockRes();

    mockedFs.readFileSync.mockImplementationOnce(() => {
      throw new Error("fs error");
    });

    await handler(req, res as any);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to load route data",
    });
    consoleSpy.mockRestore();
  });
});

