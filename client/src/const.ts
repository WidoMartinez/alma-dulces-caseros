export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Alma - Dulces Caseros Artesanales";

export const APP_LOGO = "/alma-logo.svg";

export const BRAND_INFO = {
  name: "Alma",
  owner: "Alejandra Sáez",
  location: "Temuco, Araucanía",
  tagline: "Dulces artesanales con amor y dedicación",
  description: "Cada producto es cocinado artesanalmente con ingredientes naturales y orgánicos de la más alta calidad.",
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Return a fallback URL if OAuth is not configured
  if (!oauthPortalUrl || !appId) {
    return "#";
  }
  
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
