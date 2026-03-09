/* eslint-env jest */

import fs from "fs";
import handler from "../../../pages/api/listOfRoutes";

jest.mock("fs");

const mockedFs = fs;

function createMockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("/api/listOfRoutes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 200 with route list from JSON files in data dir", async () => {
    mockedFs.readdirSync.mockReturnValue(["TLV1.json", "TLV2.json"]);
    mockedFs.statSync.mockReturnValue({ isDirectory: () => false });

    const req = { method: "GET" };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    const callArg = res.json.mock.calls[0][0];
    expect(callArg).toHaveProperty("routeList");
    expect(callArg.routeList).toEqual(["TLV1", "TLV2"]);
  });

  it("returns 500 when filesystem fails", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockedFs.readdirSync.mockImplementationOnce(() => {
      throw new Error("fs error");
    });

    const req = { method: "GET" };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to list routes" });
    consoleSpy.mockRestore();
  });

  it("returns 405 for POST method", async () => {
    const req = { method: "POST" };
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
