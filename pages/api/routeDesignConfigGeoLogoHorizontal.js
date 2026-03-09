import path from "path";
import fs from "fs";
import {
  routeIdSchema,
  withMethod,
  sendError,
  isPathWithinBase,
} from "../../src/lib/api/validation";

const CONFIG_DIR = path.join(
  process.cwd(),
  "public/designConfig/posterGeoLogoHorizontal"
);

async function handler(req, res) {
  const routeIdResult = routeIdSchema.safeParse(req.query.routeID);
  if (!routeIdResult.success) {
    return sendError(res, 400, "Invalid routeID");
  }

  const routeID = routeIdResult.data;

  try {
    const filePath = path.join(CONFIG_DIR, `${routeID}.json`);
    if (!isPathWithinBase(filePath, CONFIG_DIR)) {
      return sendError(res, 400, "Invalid routeID");
    }

    const routeData = fs.readFileSync(filePath, "utf8");
    return res.status(200).json({ routeData });
  } catch (e) {
    console.error("routeDesignConfigGeoLogoHorizontal error:", e);
    return sendError(res, 500, "Failed to load design config");
  }
}

export default withMethod("GET", handler);
