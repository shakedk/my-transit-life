import { TransitDataAccess } from "../../../../src/lib/dataAPI/transitDataAccess";
import {
  networkIdSchema,
  withMethod,
  sendError,
} from "../../../../src/lib/api/validation";
import { z } from "zod";

const transitDataAccess = new TransitDataAccess();

const coordSchema = z.coerce.number().finite();

async function handler(req, res) {
  const networkIdResult = networkIdSchema.safeParse(req.query.networkId);
  if (!networkIdResult.success) {
    return sendError(res, 400, "Invalid networkId");
  }

  const latResult = coordSchema.safeParse(req.query.lat);
  const lonResult = coordSchema.safeParse(req.query.lon);
  const lat = latResult.success ? latResult.data : undefined;
  const lon = lonResult.success ? lonResult.data : undefined;

  try {
    const data = await transitDataAccess.getRoutesbyNetworkId(
      networkIdResult.data,
      lat,
      lon,
    );
    return res.status(200).json(data);
  } catch (e) {
    console.error("ptRoutes error:", e);
    return sendError(res, 500, "Failed to load routes");
  }
}

export default withMethod("GET", handler);
