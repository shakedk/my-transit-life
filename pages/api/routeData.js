import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  // Support different variations
  const { routeID } = req.query;
  const routeIDWithoutVariation = routeID.split('-')[0];
  try {
    const routeData = fs.readFileSync(
      path.join(process.cwd(), `/public/data/${routeIDWithoutVariation}.json`),
      "utf8"
    );
    return res.status(200).json({ routeData });
  } catch (e) {
    console.log(e);
  }
}
