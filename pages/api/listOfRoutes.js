import fs from "fs";
import path from "path";
import { withMethod, sendError } from "../../src/lib/api/validation";

function getJsonFilesRecursive(dir, fileNames) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getJsonFilesRecursive(filePath, fileNames);
    } else if (file.endsWith(".json")) {
      fileNames.push(file.replace(".json", ""));
    }
  }
}

async function handler(req, res) {
  try {
    const fileNames = [];
    const dir = path.join(process.cwd(), "public/data");
    getJsonFilesRecursive(dir, fileNames);
    return res.status(200).json({ routeList: fileNames });
  } catch (e) {
    console.error("listOfRoutes error:", e);
    return sendError(res, 500, "Failed to list routes");
  }
}

export default withMethod("GET", handler);
