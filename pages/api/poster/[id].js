import db from "../../../src/lib/db";

export default async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      await db
        .collection("posters")
        .doc(id)
        .set(
          {
            ...req.body,
            updated: new Date().toISOString(),
          },
          { merge: true }
        );
    } else if (req.method === "GET") {
      const doc = await db.collection("posters").doc(id).get();
      if (!doc.exists) {
        res.status(404).end();
      } else {
        res.status(200).json(doc.data());
      }
    } else if (req.method === "DELETE") {
      await db.collection("posters").doc(id).delete();
    }
    res.status(200).end();
  } catch (e) {
    res.status(400).end();
  }
};
