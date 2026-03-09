import { TransitDataAccess } from "../../../../src/lib/dataAPI/transitDataAccess";
import {
  networkIdSchema,
  withMethod,
  sendError,
} from "../../../../src/lib/api/validation";

const transitDataAccess = new TransitDataAccess();

async function handler(req, res) {
  const networkIdResult = networkIdSchema.safeParse(req.query.networkId);
  if (!networkIdResult.success) {
    return sendError(res, 400, "Invalid networkId");
  }

  try {
    const data = await transitDataAccess.getRoutesbyNetworkId(
      networkIdResult.data
    );
    return res.status(200).json(data);
  } catch (e) {
    console.error("ptRoutes error:", e);
    return sendError(res, 500, "Failed to load routes");
  }
}

export default withMethod("GET", handler);
