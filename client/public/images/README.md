# Estructura de Imágenes - Alma Dulces Caseros

Esta carpeta contiene todas las imágenes estáticas del sitio.

## Estructura de Carpetas

### `/products`
Imágenes de productos individuales
- Formato recomendado: JPG o WebP
- Resolución sugerida: 800x800px (cuadradas)
- Nomenclatura: `producto-nombre-descriptivo.jpg`
- Ejemplo: `torta-chocolate.jpg`, `alfajores-dulce-leche.jpg`
- **Archivo especial**: `placeholder.svg` - Imagen por defecto para productos sin foto

### `/categories`
Imágenes representativas de categorías de productos
- Formato recomendado: JPG o WebP
- Resolución sugerida: 600x400px
- Nomenclatura: `categoria-nombre.jpg`
- Ejemplo: `categoria-tortas.jpg`, `categoria-postres.jpg`

### `/gallery`
Galería de fotos del negocio, proceso de elaboración, etc.
- Formato recomendado: JPG
- Resolución sugerida: 1200x800px
- Nomenclatura: `galeria-descripcion-##.jpg`
- Ejemplo: `galeria-cocina-01.jpg`, `galeria-proceso-02.jpg`

### `/logo`
Logo y variaciones de marca
- Formato recomendado: PNG (con transparencia) o SVG
- Archivos disponibles:
  - `logo.svg` - Logo principal con gradiente
  - `logo-dark.svg` - Logo para fondos oscuros
  - Nota: También existe `/alma-logo.svg` en la raíz de public

### `/banners`
Banners promocionales y de portada
- Formato recomendado: JPG o WebP
- Resolución sugerida: 1920x600px (desktop), 800x600px (mobile)
- Nomenclatura: `banner-descripcion.jpg`
- Ejemplo: `banner-inicio.jpg`, `banner-promo-navidad.jpg`

### `/hero`
Imágenes para la sección hero (portada principal)
- Formato recomendado: SVG o JPG de alta calidad
- Resolución sugerida: 1200x1200px (o SVG escalable)
- Archivo actual: `hero-main.svg` - Tarta artesanal ilustrada

### `/about`
Imágenes para la sección "Acerca de"
- Formato recomendado: SVG, PNG o JPG
- Resolución sugerida: 800x800px
- Archivo actual: `about-chef.svg` - Ilustración de chef/emprendedora

## Uso en el Código

Las imágenes se referencian con rutas absolutas desde la raíz pública:

```tsx
// En componentes React
<img src="/images/products/torta-chocolate.jpg" alt="Torta de chocolate" />
<img src="/images/logo/logo.png" alt="Alma Dulces Caseros" />
```

## Optimización

Para mejor rendimiento:
1. Comprimir imágenes antes de subirlas (TinyPNG, Squoosh)
2. Usar formatos modernos como WebP cuando sea posible
3. Mantener resoluciones apropiadas para web
4. Usar lazy loading para imágenes below the fold

## Notas

- Las imágenes en esta carpeta NO son procesadas por Vite
- Son servidas directamente tal como están
- Asegúrate de tener los derechos de las imágenes utilizadas
