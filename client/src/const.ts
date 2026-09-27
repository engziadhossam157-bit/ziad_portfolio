export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Full-page redirect into the Google OAuth login flow. Call this from an
// event handler (e.g. onClick={() => startGoogleLogin()}), not during render.
export const startGoogleLogin = () => {
  window.location.href = "/api/auth/google/start";
};
