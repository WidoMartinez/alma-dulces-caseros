/**
 * Sistema de Diseño para Alma - Dulces Caseros Artesanales
 * 
 * Paleta de colores femenina y elegante
 * Tipografía moderna con Playfair Display y Lato
 * Enfoque en experiencia del usuario y accesibilidad
 */

export const DESIGN_SYSTEM = {
  colors: {
    primary: "oklch(0.7 0.2 340)", // Rosa/Magenta elegante
    primaryLight: "oklch(0.85 0.15 340)",
    primaryDark: "oklch(0.55 0.25 340)",
    accent: "oklch(0.7 0.2 340)",
    background: "oklch(0.98 0.001 286.375)", // Blanco cálido
    foreground: "oklch(0.235 0.015 65)", // Gris oscuro elegante
    muted: "oklch(0.92 0.002 286.375)",
    border: "oklch(0.92 0.004 286.32)",
  },
  typography: {
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Lato', sans-serif",
    headingSizes: {
      h1: "3.75rem", // 60px
      h2: "3rem", // 48px
      h3: "1.875rem", // 30px
      h4: "1.5rem", // 24px
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.6,
      relaxed: 1.8,
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

export const PRODUCT_EMOJIS = {
  "Tarta de Frutos Rojos": "🍓",
  "Tarta de Chocolate": "🍫",
  "Galletas de Avena y Miel": "🍪",
  "Galletas de Almendra": "🍪",
  "Brownie de Chocolate Oscuro": "🍫",
  "Brownie con Nueces": "🥜",
  "Mermelada de Fresa": "🍓",
  "Mermelada de Frambuesa": "🫐",
};
