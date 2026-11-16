# Cómo agregar contenido a `/info`

La sección pública de información usa una estructura de contenido reutilizable. El hub, las páginas de detalle, el sitemap y los metadatos se generan a partir de los mismos datos.

## Archivos principales

- `src/data/info.ts`: categorías, textos de interfaz y artículos.
- `src/app/[locale]/info/page.tsx`: página principal de información.
- `src/app/[locale]/info/[slug]/page.tsx`: plantilla de detalle para cada artículo.
- `src/app/[locale]/info/info.module.css`: estilos compartidos del hub y los artículos.
- `public/assets/images/info/`: imágenes públicas de las guías.

## Agregar una guía nueva

1. Copia las imágenes a `public/assets/images/info/<tema>/`. No uses la carpeta `info-kunai` como ruta pública.
2. Agrega un objeto nuevo al arreglo `INFO_ARTICLES` en `src/data/info.ts`.
3. Completa `slug`, `category`, `icon`, `publishedAt`, `updatedAt`, `readingMinutes`, `title`, `excerpt`, `tags`, `source` y `blocks`.
4. Usa un `slug` corto, en minúsculas y sin espacios. Ejemplo: `kunai-damage-breakdown`.
5. Ejecuta `npm run build` para comprobar tipos, rutas y metadatos.

La URL se crea automáticamente:

- `/es/info/<slug>`
- `/en/info/<slug>`

## Bloques disponibles

El campo `blocks` acepta estos tipos:

- `paragraph`: párrafo de texto.
- `heading`: subtítulo dentro del artículo.
- `list`: lista con viñetas o numerada.
- `table`: tabla de dos columnas con iconos opcionales y barras de porcentaje.
- `callout`: nota informativa, advertencia o confirmación.
- `image`: imagen con texto alternativo y leyenda opcional.

Cada texto se declara con `{ en: "...", es: "..." }` para mantener el contenido bilingüe.

## Categorías

Las categorías viven en `INFO_CATEGORIES`. Para crear una categoría nueva:

1. Agrega su `id` al tipo `InfoCategoryId`.
2. Agrega el objeto de categoría con `label`, `description` e icono de Bootstrap Icons.
3. Asigna esa categoría a uno o más artículos.

El hub solo muestra categorías que tienen al menos un artículo. Si una categoría crece lo suficiente, se puede promover a un enlace propio en la navegación sin rehacer las páginas existentes.

## SEO y sitemap

- El `title`, `excerpt`, `tags` y `updatedAt` de cada artículo alimentan el título, la descripción, el canonical, los hreflang y el JSON-LD.
- `src/app/sitemap.ts` genera `/sitemap.xml` automáticamente con el hub y todos los artículos en `INFO_ARTICLES`.
- No edites `public/sitemap.xml`: ese archivo estático fue retirado para evitar conflictos con el sitemap dinámico.

## Imágenes actuales

Las imágenes de la primera guía están en:

`public/assets/images/info/kunai/`

La carpeta `info-kunai/` de la raíz es material de referencia local. Los archivos que debe servir la web se copian a `public/`.
