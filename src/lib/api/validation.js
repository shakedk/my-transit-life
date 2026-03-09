import path from "path";
import { z } from "zod";

/**
 * Route ID validation: alphanumeric, hyphens, underscores only.
 * Prevents path traversal (e.g. ../../../etc/passwd).
 */
const ROUTE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export const routeIdSchema = z
  .string()
  .min(1, "routeID is required")
  .regex(ROUTE_ID_REGEX, "routeID contains invalid characters");

export const slugSchema = z
  .string()
  .min(1, "slug is required")
  .max(500, "slug too long")
  .regex(/^[a-zA-Z0-9_-]+$/, "slug contains invalid characters");

export const posterIdSchema = z
  .string()
  .min(1, "id is required")
  .max(128, "id too long")
  .regex(/^[a-zA-Z0-9_-]+$/, "id contains invalid characters");

export const networkIdSchema = z
  .string()
  .min(1, "networkId is required")
  .max(200, "networkId too long")
  .regex(/^[a-zA-Z0-9._-]+$/, "networkId contains invalid characters");

export const posterCreateSchema = z.object({
  slug: slugSchema,
  posterType: z.string().min(1).max(100),
  routeID: routeIdSchema,
});

/**
 * Sanitizes poster update body to only allow known fields. Prevents arbitrary field injection.
 */
export function sanitizePosterUpdateBody(body) {
  if (!body || typeof body !== "object") return {};
  const allowed = {};
  const elementPrefix = "element_";

  for (const [key, value] of Object.entries(body)) {
    if (key === "posterID" && typeof value === "string") {
      allowed[key] = value;
    } else if (key === "patterns" && value && typeof value === "object") {
      const patterns = {};
      for (const [k, v] of Object.entries(value)) {
        if (v && typeof v === "object" && typeof v.toDisplay === "boolean") {
          patterns[k] = { toDisplay: v.toDisplay };
        }
      }
      allowed.patterns = patterns;
    } else if (key === "stops" && value && typeof value === "object") {
      const stops = {};
      for (const [k, v] of Object.entries(value)) {
        if (v && typeof v === "object") {
          const stopData = {};
          const numFields = ["marker_lat", "marker_lon", "label_lat", "label_lon", "labelWidth", "labelHeight"];
          const strFields = ["stopOriginalName", "stopModifiedName"];
          numFields.forEach((f) => {
            if (typeof v[f] === "number") stopData[f] = v[f];
          });
          strFields.forEach((f) => {
            if (typeof v[f] === "string") stopData[f] = v[f];
          });
          if (typeof v.toDisplay === "boolean") stopData.toDisplay = v.toDisplay;
          if (Object.keys(stopData).length > 0) stops[k] = stopData;
        }
      }
      allowed.stops = stops;
    } else if (key.startsWith(elementPrefix) && value && typeof value === "object") {
      if (typeof value.x === "number" && typeof value.y === "number") {
        allowed[key] = { x: value.x, y: value.y };
      }
    }
  }
  return allowed;
}

/**
 * Validates that a file path stays within the given base directory.
 * Prevents path traversal attacks.
 */
export function isPathWithinBase(filePath, baseDir) {
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(baseDir);
  return resolvedPath.startsWith(resolvedBase);
}

/**
 * Wraps an API handler with HTTP method restriction.
 */
export function withMethod(allowedMethods, handler) {
  return async (req, res) => {
    const methods = Array.isArray(allowedMethods)
      ? allowedMethods
      : [allowedMethods];
    if (!methods.includes(req.method)) {
      return res.status(405).json({ error: "Method not allowed" });
    }
    return handler(req, res);
  };
}

/**
 * Sends a consistent error response.
 */
export function sendError(res, status, message = "Internal error") {
  return res.status(status).json({ error: message });
}
