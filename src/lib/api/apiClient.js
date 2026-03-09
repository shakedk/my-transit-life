/**
 * Axios instance that adds Firebase ID token to mutation requests.
 * Use this for POST, PUT, DELETE to /api/poster/* endpoints.
 */
import axios from "axios";
import { getFirebaseAuth } from "../auth/firebaseClient";

let authAxiosInstance = null;

function getTokenGetter() {
  return async () => {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    return user ? user.getIdToken() : null;
  };
}

/**
 * Returns an axios instance that adds Authorization header with Bearer token.
 * Token is obtained from Firebase Auth currentUser when the request is made.
 * Use this for authenticated API calls (POST, PUT, DELETE to poster endpoints).
 */
export function getAuthAxios() {
  if (!authAxiosInstance) {
    authAxiosInstance = axios.create();
    authAxiosInstance.interceptors.request.use(async (config) => {
      const getToken = getTokenGetter();
      const token = getToken ? await getToken() : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    authAxiosInstance.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 && typeof globalThis !== "undefined" && globalThis.window) {
          const redirect = encodeURIComponent(
            globalThis.window.location.pathname + globalThis.window.location.search
          );
          globalThis.window.location.href = `/signin?redirect=${redirect}`;
        }
        return Promise.reject(err);
      }
    );
  }
  return authAxiosInstance;
}
