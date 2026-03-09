import { TransitDataAccess } from "../../../../src/lib/dataAPI/transitDataAccess";
import { withMethod, sendError } from "../../../../src/lib/api/validation";

const transitDataAccess = new TransitDataAccess();

async function handler(req, res) {
  try {
    const data = await transitDataAccess.getAvailableNetworks();
    return res.status(200).json(data);
  } catch (e) {
    console.error("ptNetworks error:", e);
    return sendError(res, 500, "Failed to load networks");
  }
}

export default withMethod("GET", handler);
