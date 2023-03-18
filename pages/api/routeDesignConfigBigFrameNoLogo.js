import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  const { routeID } = req.query;
  try {
    const routeData = fs.readFileSync(
      path.join(process.cwd(), `/public/designConfig/posterBigFrameNoLogo/${routeID}.json`),
      "utf8"
    );
    
    return res.status(200).json({ routeData });
  } catch (e) {
    console.log(e);
  }
}
