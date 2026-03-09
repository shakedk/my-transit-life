/* eslint-env jest */

jest.mock("../../../src/lib/db", () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ slug: "test" }) })),
      set: jest.fn(() => Promise.resolve()),
      delete: jest.fn(() => Promise.resolve()),
    })),
    add: jest.fn(() => Promise.resolve({ id: "new-id" })),
    get: jest.fn(() =>
      Promise.resolve({
        docs: [],
        empty: true,
      })
    ),
    where: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          empty: false,
          docs: [{ id: "found-id" }],
        })
      ),
    })),
  })),
}));

jest.mock("../../../src/lib/auth/requireAuth", () => ({
  withAuth: (_methods, handler) => handler,
}));

import posterIndexHandler from "../../../pages/api/poster/index";
import posterByIdHandler from "../../../pages/api/poster/[id]";
import getBySlugHandler from "../../../pages/api/poster/getBySlug";
import db from "../../../src/lib/db";

const mockDb = db;

function createMockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.end = jest.fn(() => res);
  return res;
}

describe("/api/poster/index", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.collection().get.mockResolvedValue({
      docs: [],
      empty: true,
    });
  });

  it("returns 400 for invalid body (missing required fields)", async () => {
    const req = {
      method: "POST",
      body: {},
    };
    const res = createMockRes();

    await posterIndexHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid request: slug, posterType, and routeID are required",
    });
  });

  it("returns 400 for body with path traversal in slug", async () => {
    const req = {
      method: "POST",
      body: {
        slug: "../../../etc/passwd",
        posterType: "posterGeoLogo",
        routeID: "TLV1",
      },
    };
    const res = createMockRes();

    await posterIndexHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for body with path traversal in routeID", async () => {
    const req = {
      method: "POST",
      body: {
        slug: "poster-geo-logo-tlv1",
        posterType: "posterGeoLogo",
        routeID: "../../../etc/passwd",
      },
    };
    const res = createMockRes();

    await posterIndexHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 405 for GET method", async () => {
    const req = { method: "GET", body: {} };
    const res = createMockRes();

    await posterIndexHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

describe("/api/poster/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid id (path traversal)", async () => {
    const req = {
      method: "GET",
      query: { id: "../../../etc/passwd" },
    };
    const res = createMockRes();

    await posterByIdHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid poster id" });
  });

  it("returns 400 for id with invalid characters", async () => {
    const req = {
      method: "GET",
      query: { id: "poster;id" },
    };
    const res = createMockRes();

    await posterByIdHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 405 for POST method", async () => {
    const req = {
      method: "POST",
      query: { id: "valid-id" },
    };
    const res = createMockRes();

    await posterByIdHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});

describe("/api/poster/getBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 for invalid slug (path traversal)", async () => {
    const req = {
      method: "GET",
      query: { slug: "../../../etc/passwd" },
    };
    const res = createMockRes();

    await getBySlugHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid slug" });
  });

  it("returns 400 for slug with invalid characters", async () => {
    const req = {
      method: "GET",
      query: { slug: "bad slug" },
    };
    const res = createMockRes();

    await getBySlugHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 405 for POST method", async () => {
    const req = {
      method: "POST",
      query: { slug: "valid-slug" },
    };
    const res = createMockRes();

    await getBySlugHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
  });
});
