
const fs = require("fs");

export default async function handler(req, res) {
  const path = require("path");
  const { routeID } = req.query;
  try {
    const routeData = fs.readFileSync(
      path.join(process.cwd(), `/public/designConfig/posterGeoLogo/${routeID}.json`),
      "utf8"
    );
    return res.status(200).json({ routeData });
  } catch (e) {
    console.log(e);
  }
}
