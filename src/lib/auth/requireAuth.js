/**
 * Wraps an API handler to require authentication.
 * Returns 401 if no valid Bearer token is present.
 * In development (NODE_ENV=development), auth is bypassed.
 */
import { verifyIdToken } from "./authAdmin";
import { sendError } from "../api/validation";

const isDev = process.env.NODE_ENV === "development";

/**
 * Extracts Bearer token from Authorization header or from cookies (for SSR).
 * @param {import('next').NextApiRequest} req
 * @returns {string | null}
 */
function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}

/**
 * Wraps a handler to require authentication for mutation methods.
 * GET requests pass through; POST, PUT, DELETE require auth.
 * In development mode, auth is bypassed (no login required).
 * @param {string[]} protectedMethods - HTTP methods that require auth
 * @param {Function} handler - Original handler (req, res) => Promise
 * @returns {Function} Wrapped handler
 */
export function withAuth(protectedMethods, handler) {
  return async (req, res) => {
    if (protectedMethods.includes(req.method)) {
      if (isDev) {
        req.authUser = { uid: "dev-bypass", email: "dev@local" };
      } else {
        const token = getTokenFromRequest(req);
        const user = await verifyIdToken(token);
        if (!user) {
          return sendError(res, 401, "Authentication required");
        }
        req.authUser = user;
      }
    }
    return handler(req, res);
  };
}
