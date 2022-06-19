import db from "../../../src/utils/db";

export default async (req, res) => {
  try {
    const { slug } = req.query;

    const posters = await db
      .collection("posters")
      .where("slug", "==", slug)
      .get();
      if (posters.empty) {
        res.status(400).end();
      }
      const posterIDs = [];
      posters.forEach(p => {
        posterIDs.push(p.id);
      });
    res.status(200).json({ posterID: posterIDs[0] });
    res.status(200).end();
  } catch (e) {
      console.log(e)
    res.status(400).end();
  }
};
