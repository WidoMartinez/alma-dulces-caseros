# Guía Rápida: Cómo Reemplazar Imágenes del Sitio

## 📸 Imágenes Principales que Puedes Reemplazar

### 1. Logo del Sitio

**Ubicación actual**: `client/public/alma-logo.svg`

**Cómo reemplazar**:

1. Prepara tu logo en formato SVG, PNG o JPG
2. Colócalo en: `client/public/alma-logo.svg` (o `.png`)
3. Si cambias el formato, actualiza `client/src/const.ts`:
   ```typescript
   export const APP_LOGO = "/alma-logo.png"; // Cambia la extensión
   ```

**Recomendaciones**:

- SVG para mejor escalabilidad
- PNG con fondo transparente
- Tamaño: 200x200px mínimo

---

### 2. Imagen del Hero (Portada Principal)

**Ubicación actual**: `client/public/images/hero/hero-main.svg`

**Cómo reemplazar**:

1. Prepara una imagen atractiva de tus dulces (1200x1200px)
2. Guárdala como: `client/public/images/hero/hero-main.jpg`
3. Actualiza `client/src/components/sections/HeroSection.tsx`:
   ```tsx
   src = "/images/hero/hero-main.jpg"; // Cambia .svg por .jpg
   ```

**Tips**:

- Usa fotos profesionales de tus productos más llamativos
- Fondo claro y limpio
- Formato: JPG optimizado o WebP

---

### 3. Imagen de "Acerca de" (About)

**Ubicación actual**: `client/public/images/about/about-chef.svg`

**Cómo reemplazar**:

1. Usa una foto personal o de tu espacio de trabajo
2. Guárdala como: `client/public/images/about/about-chef.jpg`
3. Actualiza `client/src/components/sections/AboutSection.tsx`:
   ```tsx
   src = "/images/about/about-chef.jpg"; // Cambia .svg por .jpg
   ```

**Ideas**:

- Foto tuya cocinando
- Tu cocina/espacio de trabajo
- Foto profesional con productos
- Tamaño: 800x800px

---

### 4. Imágenes de Productos

**Ubicación**: `client/public/images/products/`

**Cómo agregar**:

1. Toma fotos de tus productos (800x800px, fondo neutro)
2. Guárdalas con nombres descriptivos:
   - `torta-chocolate.jpg`
   - `galletas-avena.jpg`
   - `brownie-nueces.jpg`
3. En el panel de administración, usa la ruta:
   ```
   /images/products/torta-chocolate.jpg
   ```

**Consejos para fotos de productos**:

- Luz natural o caja de luz
- Fondo blanco o de madera clara
- Ángulo de 45° o cenital
- Mostrar el producto completo
- JPG optimizado (no más de 500KB por imagen)

---

### 5. Placeholder de Productos

**Ubicación**: `client/public/images/products/placeholder.svg`

Esta imagen se muestra cuando un producto no tiene foto. Puedes reemplazarla con tu propia imagen genérica.

---

## 🛠️ Herramientas Recomendadas

### Para Optimizar Imágenes:

- **TinyPNG** (https://tinypng.com/) - Comprime JPG/PNG
- **Squoosh** (https://squoosh.app/) - Convierte a WebP
- **SVGOMG** (https://jakearchibald.github.io/svgomg/) - Optimiza SVG

### Para Editar Fotos:

- **Photopea** (https://www.photopea.com/) - Editor online gratuito
- **Remove.bg** (https://www.remove.bg/) - Quitar fondos
- **Canva** (https://www.canva.com/) - Diseños y composiciones

---

## 📋 Checklist de Reemplazo

- [ ] Logo principal (`alma-logo.svg`)
- [ ] Imagen Hero (`images/hero/hero-main.svg`)
- [ ] Imagen About (`images/about/about-chef.svg`)
- [ ] Al menos 3 fotos de productos en `images/products/`
- [ ] Todas las imágenes optimizadas (< 500KB)
- [ ] Verificar que se vean bien en móvil y desktop

---

## 🚀 Después de Reemplazar

1. **Prueba local**: Abre el sitio en `http://localhost:5000`
2. **Verifica en móvil**: Usa DevTools (F12) y modo responsive
3. **Commit los cambios**:
   ```bash
   git add client/public/images/
   git commit -m "Actualizar imágenes del sitio"
   git push
   ```

---

## 💡 Tips Profesionales

1. **Mantén consistencia**: Usa el mismo estilo de foto para todos los productos
2. **Optimiza siempre**: Imágenes pesadas ralentizan el sitio
3. **Nombres descriptivos**: `torta-chocolate.jpg` mejor que `IMG_1234.jpg`
4. **Backup**: Guarda las originales en alta resolución aparte
5. **Actualiza regularmente**: Nuevas fotos mantienen el sitio fresco

---

¿Necesitas ayuda? Revisa `client/public/images/README.md` para más detalles técnicos.
