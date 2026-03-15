import path from "path";
import fs from "fs";
import { TransitDataAccess } from "../../../src/lib/dataAPI/transitDataAccess";
import { withMethod, sendError } from "../../../src/lib/api/validation";
import { z } from "zod";

const transitDataAccess = new TransitDataAccess();

const DEMO_ROUTE_IDS = ["nyc2", "tlvRed", "tflVictoria", "berlin100", "ratp11"];
const DATA_DIR = path.join(process.cwd(), "public/data");

const routeIdQuerySchema = z
  .string()
  .min(1, "routeId is required")
  .max(200, "routeId too long");

/**
 * Converts TransitDataAccess IRoute to the poster routeData shape:
 * { multiPolyLine, stops } with stop_id, stop_name, stop_lat, stop_lon.
 */
function toPosterRouteData(route) {
  const multiPolyLine = Array.isArray(route.shape) && route.shape.length > 0
    ? [route.shape]
    : [[[0, 0], [0.01, 0.01]]];

  const stops = (route.stops || []).map((s) => ({
    stop_id: s.stopId || "",
    stop_name: s.stopName || "",
    stop_lat: Array.isArray(s.location) ? s.location[1] : 0,
    stop_lon: Array.isArray(s.location) ? s.location[0] : 0,
  }));

  return { multiPolyLine, stops };
}

async function handler(req, res) {
  const parsed = routeIdQuerySchema.safeParse(req.query.routeId);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid or missing routeId");
  }

  const routeId = parsed.data;
  const routeIdBase = routeId.split("-")[0];

  try {
    if (DEMO_ROUTE_IDS.includes(routeIdBase)) {
      const filePath = path.join(DATA_DIR, `${routeIdBase}.json`);
      if (fs.existsSync(filePath)) {
        const routeData = fs.readFileSync(filePath, "utf8");
        return res.status(200).json({ routeData });
      }
    }
    const route = await transitDataAccess.getRouteDataByRouteId(routeId);
    const posterRouteData = toPosterRouteData(route);
    const payload = {
      routeData: JSON.stringify(posterRouteData),
      routeName: route.routeName || routeId,
    };
    if (route.centerHint) {
      payload.routeCenterHint = route.centerHint;
    }
    return res.status(200).json(payload);
  } catch (e) {
    console.error("dataProvider/routeData error:", e);
    return sendError(res, 500, "Failed to load route data from API");
  }
}

export default withMethod("GET", handler);
