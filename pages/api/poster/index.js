import db from "../../../src/utils/db";

export default async (req, res) => {
  try {
    const { slug } = req.body;
    const posters = await db.collection("posters").get();
    const postersData = posters.docs.map((poster) => poster.data());
    if (postersData.some((poster) => poster.slug === slug)) {
      res.status(200).end();
    } else {
      const { id } = await db.collection("posters").add({
        ...req.body,
        created: new Date().toISOString(),
      });
      res.status(200).json({ id });
    }
  } catch (e) {
    res.status(400).end();
  }
};
