import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const fileNames = [];
    const dir = path.join(process.cwd(), "/public/data");
    const files = fs.readdirSync(dir);
    for (var i in files) {
      var name = dir + "/" + files[i];
      if (fs.statSync(name).isDirectory()) {
        fs.getFiles(name, fileNames);
      } else {
        const fileName = name.split("/").slice(-1)[0];

        fileNames.push(fileName.replace(".json", ""));
      }
    }
    return res.status(200).json({ routeList: fileNames });
  } catch (e) {
    console.log(e);
  }
}
