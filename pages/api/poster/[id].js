import db from "../../../src/lib/db";
import {
  posterIdSchema,
  sanitizePosterUpdateBody,
  withMethod,
  sendError,
} from "../../../src/lib/api/validation";
import { withAuth } from "../../../src/lib/auth/requireAuth";

async function handler(req, res) {
  // CORS preflight: browser sends OPTIONS before PUT when Authorization header is present
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, PUT, DELETE, OPTIONS");
    return res.status(200).end();
  }

  const idResult = posterIdSchema.safeParse(req.query.id);
  if (!idResult.success) {
    return sendError(res, 400, "Invalid poster id");
  }

  const id = idResult.data;

  try {
    if (req.method === "PUT") {
      const sanitized = sanitizePosterUpdateBody(req.body);
      await db
        .collection("posters")
        .doc(id)
        .set(
          {
            ...sanitized,
            updated: new Date().toISOString(),
          },
          { merge: true }
        );
      return res.status(200).end();
    }

    if (req.method === "GET") {
      const doc = await db.collection("posters").doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Poster not found" });
      }
      return res.status(200).json(doc.data());
    }

    if (req.method === "DELETE") {
      await db.collection("posters").doc(id).delete();
      return res.status(200).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("poster [id] error:", e);
    return sendError(res, 500, "Internal error");
  }
}

export default withMethod(
  ["GET", "PUT", "DELETE", "OPTIONS"],
  withAuth(["PUT", "DELETE"], handler)
);
