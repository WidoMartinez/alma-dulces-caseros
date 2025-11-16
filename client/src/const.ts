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

// URL de login local (sin OAuth)
export const getLoginUrl = () => {
  return "/login";
};
