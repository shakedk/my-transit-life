/* eslint-env jest */

import path from "path";
import {
  routeIdSchema,
  slugSchema,
  posterIdSchema,
  networkIdSchema,
  sanitizePosterUpdateBody,
  isPathWithinBase,
  withMethod,
  sendError,
} from "../../lib/api/validation";

describe("validation schemas", () => {
  it("accepts valid routeID and rejects path traversal patterns", () => {
    expect(routeIdSchema.safeParse("ABC_123-route").success).toBe(true);

    const invalidValues = [
      "",
      "../etc/passwd",
      "foo/../../bar",
      "route id",
      "שלום",
    ];
    invalidValues.forEach((value) => {
      const result = routeIdSchema.safeParse(value);
      expect(result.success).toBe(false);
    });
  });

  it("accepts valid slug/poster/network IDs and rejects invalid ones", () => {
    expect(slugSchema.safeParse("my-poster_123").success).toBe(true);
    expect(posterIdSchema.safeParse("poster_1").success).toBe(true);
    expect(networkIdSchema.safeParse("net.1-foo_bar").success).toBe(true);

    expect(slugSchema.safeParse("bad slug").success).toBe(false);
    expect(posterIdSchema.safeParse("bad id").success).toBe(false);
    expect(networkIdSchema.safeParse("net/../etc").success).toBe(false);
  });
});

describe("sanitizePosterUpdateBody", () => {
  it("keeps only allowed poster fields and sanitizes nested structures", () => {
    const body = {
      posterID: "poster123",
      patterns: {
        p1: { toDisplay: true, extra: "ignored" },
        p2: { toDisplay: "not-boolean" },
      },
      stops: {
        s1: {
          marker_lat: 1,
          marker_lon: 2,
          label_lat: 3,
          label_lon: 4,
          labelWidth: 5,
          labelHeight: 6,
          stopOriginalName: "orig",
          stopModifiedName: "mod",
          toDisplay: false,
          extra: "ignored",
        },
        s2: {
          marker_lat: "not-number",
        },
      },
      element_title: { x: 10, y: 20, extra: "ignored" },
      element_bad: { x: "not-number", y: 20 },
      arbitrary: "should-be-removed",
      designConfig: {
        backgroundColor: "#ffffff",
        mapOpacity: 0.8,
        showStopLabels: true,
        nested: { notAllowed: true },
      },
    };

    const sanitized = sanitizePosterUpdateBody(body);

    expect(sanitized).toEqual({
      posterID: "poster123",
      patterns: {
        p1: { toDisplay: true },
      },
      stops: {
        s1: {
          marker_lat: 1,
          marker_lon: 2,
          label_lat: 3,
          label_lon: 4,
          labelWidth: 5,
          labelHeight: 6,
          stopOriginalName: "orig",
          stopModifiedName: "mod",
          toDisplay: false,
        },
      },
      element_title: { x: 10, y: 20 },
      designConfig: {
        backgroundColor: "#ffffff",
        mapOpacity: 0.8,
        showStopLabels: true,
      },
    });
  });

  it("returns empty object for invalid body", () => {
    expect(sanitizePosterUpdateBody(null as unknown as object)).toEqual({});
    expect(sanitizePosterUpdateBody("not-an-object" as unknown as object)).toEqual({});
  });
});

describe("isPathWithinBase", () => {
  it("returns true for paths within base directory", () => {
    const baseDir = path.join("/tmp", "base");
    const filePath = path.join(baseDir, "file.json");

    expect(isPathWithinBase(filePath, baseDir)).toBe(true);
  });

  it("returns false for paths outside base directory", () => {
    const baseDir = path.join("/tmp", "base");
    const filePath = path.join(baseDir, "..", "etc", "passwd");

    expect(isPathWithinBase(filePath, baseDir)).toBe(false);
  });
});

describe("withMethod and sendError", () => {
  const createMockRes = () => {
    const res: {
      status: jest.Mock;
      json: jest.Mock;
    } = {
      status: jest.fn(() => res as unknown as any),
      json: jest.fn(() => res as unknown as any),
    };
    return res;
  };

  it("allows only specified HTTP methods", async () => {
    const handler = jest.fn(async (_req, res) => {
      res.status(200).json({ ok: true });
    });
    const wrapped = withMethod("GET", handler);
    const res = createMockRes();

    await wrapped({ method: "GET" } as any, res as any);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("rejects unsupported HTTP methods with 405", async () => {
    const handler = jest.fn();
    const wrapped = withMethod(["GET", "POST"], handler);
    const res = createMockRes();

    await wrapped({ method: "DELETE" } as any, res as any);

    expect(handler).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
  });

  it("sendError sends consistent error response", () => {
    const res = createMockRes();

    sendError(res as any, 400, "Bad input");

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Bad input" });
  });
});

