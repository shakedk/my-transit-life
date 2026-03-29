import path from "path";
import fs from "fs";
import { TransitDataAccess } from "../../../../src/lib/dataAPI/transitDataAccess";
import { withMethod, sendError } from "../../../../src/lib/api/validation";

const transitDataAccess = new TransitDataAccess();

function readTransitApiKeyFromEnvFile() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const fileExists = fs.existsSync(envPath);
    console.log("[Transit API] env file path:", envPath, "| exists:", fileExists);
    if (fileExists) {
      const content = fs.readFileSync(envPath, "utf8");
      // handle both \r\n and \n, strip \r from each line
      const lines = content.split("\n").map((l) => l.replace(/\r$/, ""));
      const line = lines.find((l) => /^\s*TRANSIT_API_KEY\s*=/.test(l));
      console.log("[Transit API] found TRANSIT_API_KEY line:", !!line);
      if (line) {
        const match = line.match(/TRANSIT_API_KEY\s*=\s*(.+)/);
        const key = match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
        console.log("[Transit API] parsed key length from file:", key.length);
        return key;
      }
    }
  } catch (e) {
    console.error("[Transit API] readTransitApiKeyFromEnvFile error:", e);
  }
  return "";
}

async function handler(req, res) {
  try {
    const apiKey = process.env.TRANSIT_API_KEY || readTransitApiKeyFromEnvFile() || undefined;
    const data = await transitDataAccess.getAvailableNetworks(apiKey);
    return res.status(200).json(data);
  } catch (e) {
    console.error("ptNetworks error:", e);
    return sendError(res, 500, "Failed to load networks");
  }
}

export default withMethod("GET", handler);
