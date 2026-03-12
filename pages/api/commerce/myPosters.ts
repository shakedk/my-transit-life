import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../src/lib/db";
import { withAuth } from "../../../src/lib/auth/requireAuth";
import { sendError, withMethod } from "../../../src/lib/api/validation";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = (req as any).authUser as { uid: string } | undefined;

  if (!authUser) {
    return sendError(res, 401, "Authentication required");
  }

  try {
    const snapshot = await db
      .collection("posters")
      .where("userId", "==", authUser.uid)
      .orderBy("created", "desc")
      .limit(100)
      .get();

    const posters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ posters });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to load posters for user", e);
    return sendError(res, 500, "Failed to load posters");
  }
}

export default withMethod("GET", withAuth(["GET"], handler));

