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
      .collection("orders")
      .where("userId", "==", authUser.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ orders });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to load orders", e);
    return sendError(res, 500, "Failed to load orders");
  }
}

export default withMethod("GET", withAuth(["GET"], handler));

