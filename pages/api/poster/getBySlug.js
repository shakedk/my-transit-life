import db from "../../../src/lib/db";
import {
  slugSchema,
  withMethod,
  sendError,
} from "../../../src/lib/api/validation";

async function handler(req, res) {
  const slugResult = slugSchema.safeParse(req.query.slug);
  if (!slugResult.success) {
    return sendError(res, 400, "Invalid slug");
  }

  const slug = slugResult.data;

  try {
    const posters = await db
      .collection("posters")
      .where("slug", "==", slug)
      .get();

    if (posters.empty) {
      return res.status(404).json({ error: "Poster not found" });
    }

    const posterIDs = posters.docs.map((p) => p.id);
    return res.status(200).json({ posterID: posterIDs[0] });
  } catch (e) {
    console.error("getBySlug error:", e);
    return sendError(res, 500, "Failed to get poster");
  }
}

export default withMethod("GET", handler);
