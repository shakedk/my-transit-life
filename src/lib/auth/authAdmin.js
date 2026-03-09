/**
 * Firebase Admin Auth - verifies ID tokens from Firebase Auth client.
 * Requires Firebase Admin to be initialized (via db module) before use.
 */
import admin from "firebase-admin";

/**
 * Verifies a Firebase ID token and returns the decoded token.
 * @param {string} token - Bearer token from Authorization header
 * @returns {Promise<{ uid: string, email?: string } | null>} Decoded token or null if invalid
 */
export async function verifyIdToken(token) {
  if (!token || typeof token !== "string") return null;
  const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
  if (!cleanToken) return null;
  try {
    const decoded = await admin.auth().verifyIdToken(cleanToken);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}
