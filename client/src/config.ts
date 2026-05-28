export const API_URL =
  import.meta.env.DEV
    ? "/api"
    : (import.meta.env.VITE_API_URL ||
       import.meta.env.VITE_ECHO_URL ||
       "https://echo-server-iji0.onrender.com/api");
export const CLIENT_URL =
  import.meta.env.VITE_CLIENT_URL || "https://quorum-io.vercel.app";
