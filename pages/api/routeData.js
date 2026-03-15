import path from "path";
import fs from "fs";
import {
  routeIdSchema,
  withMethod,
  sendError,
  isPathWithinBase,
} from "../../src/lib/api/validation";

const DATA_DIR = path.join(process.cwd(), "public/data");

async function handler(req, res) {
  const routeIdResult = routeIdSchema.safeParse(req.query.routeID);
  if (!routeIdResult.success) {
    return sendError(res, 400, "Invalid routeID");
  }

  const routeID = routeIdResult.data;
  const routeIDWithoutVariation = routeID.split("-")[0];

  // Validate the segment used for file lookup
  const segmentResult = routeIdSchema.safeParse(routeIDWithoutVariation);
  if (!segmentResult.success) {
    return sendError(res, 400, "Invalid routeID");
  }

  try {
    const filePath = path.join(DATA_DIR, `${routeIDWithoutVariation}.json`);
    if (!isPathWithinBase(filePath, DATA_DIR)) {
      return sendError(res, 400, "Invalid routeID");
    }
    if (!fs.existsSync(filePath)) {
      return sendError(res, 404, "Route data not found");
    }
    const routeData = fs.readFileSync(filePath, "utf8");
    return res.status(200).json({ routeData });
  } catch (e) {
    console.error("routeData error:", e);
    return sendError(res, 500, "Failed to load route data");
  }
}

export default withMethod("GET", handler);
