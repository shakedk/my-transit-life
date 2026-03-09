import db from "../../../src/lib/db";
import {
  posterCreateSchema,
  withMethod,
  sendError,
} from "../../../src/lib/api/validation";
import { withAuth } from "../../../src/lib/auth/requireAuth";

async function handler(req, res) {
  try {
    const parseResult = posterCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(res, 400, "Invalid request: slug, posterType, and routeID are required");
    }

    const { slug, posterType, routeID } = parseResult.data;

    const posters = await db.collection("posters").get();
    const postersData = posters.docs.map((poster) => poster.data());

    if (postersData.some((poster) => poster.slug === slug)) {
      return res.status(200).end();
    }

    const { id } = await db.collection("posters").add({
      slug,
      posterType,
      routeID,
      created: new Date().toISOString(),
      ...(req.authUser && { userId: req.authUser.uid }),
    });
    return res.status(200).json({ id });
  } catch (e) {
    console.error("poster create error:", e);
    return sendError(res, 500, "Failed to create poster");
  }
}

export default withMethod("POST", withAuth(["POST"], handler));
