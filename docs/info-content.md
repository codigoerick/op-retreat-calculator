# Cómo agregar contenido a `/info`

La sección pública de información usa una estructura de contenido reutilizable. El hub, las páginas de detalle, el sitemap y los metadatos se generan a partir de los mismos datos.

## Archivos principales

- `src/data/info.ts`: categorías, textos de interfaz y artículos.
- `src/app/[locale]/info/page.tsx`: página principal de información.
- `src/app/[locale]/info/[slug]/page.tsx`: plantilla de detalle para cada artículo.
- `src/app/[locale]/info/info.module.css`: estilos compartidos del hub y los artículos.
- `public/assets/images/info/`: imágenes públicas de las guías.
- `public/assets/images/icons/new.png`: icono de aviso de contenido nuevo.
- `src/data/buffs.json`: datos de buffs y debuffs.
- `src/components/buffs/`: cartel base y galería de buffs.

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

## Notificaciones de contenido nuevo

Las notificaciones se generan automáticamente a partir de `INFO_ARTICLES`:

- Cada artículo usa la clave `slug@updatedAt`.
- Si la clave no se ha visto en ese navegador, aparece un punto rojo en el enlace de Información y en la categoría correspondiente.
- Al abrir el hub o el artículo, la clave se guarda como vista en `localStorage`; el punto desaparece en la siguiente visita.
- Para notificar una actualización de un artículo existente, cambia su `updatedAt`.
- Para una categoría nueva, basta con asignarle un artículo; el chip recibe su punto automáticamente.

No hay que mantener una lista manual de notificaciones. El estado es local a cada navegador y no requiere base de datos.

Para volver a ver las notificaciones durante una prueba, borra la clave `op-info-seen-v1` de `localStorage` en el navegador.

## Buffs y debuffs

Los buffs se guardan en `src/data/buffs.json`, dentro del arreglo `buffs`. Cada entrada usa este formato:

```json
{
  "id": "blurred-vision",
  "kind": "debuff",
  "icon": "/assets/images/buff/CommonAffixIcon_BadPerk2.png",
  "title": { "es": "Visión borrosa", "en": "Blurred Vision" },
  "description": { "es": "...", "en": "..." },
  "duration": "29s"
}
```

- `id`: identificador único, en minúsculas y sin espacios.
- `kind`: `buff` o `debuff`; controla el color del título.
- `icon`: ruta pública del icono del buff.
- `title` y `description`: textos bilingües.
- `duration`: opcional; se muestra en verde si existe.

La galería se renderiza en el hub de información con `BuffGallery`. El cartel base está en `src/components/buffs/BuffCard.tsx` y usa `DamageMeterItemBG.png` como fondo, `ExchangeShopBg.png` como marco del icono y `CommonAffixIcon_BadPerk2.png` como icono de ejemplo. Para agregar más buffs no hace falta tocar el componente: basta con añadir objetos al JSON.

El JSON se importa durante el build, así que los buffs nuevos requieren un nuevo build y despliegue.

`public/assets/images/buff/buff-base.jpeg` es una captura de referencia visual; no se usa en la web.

Las notificaciones de contenido nuevo siguen aplicando solo a los artículos de `INFO_ARTICLES`. Los buffs no generan aviso por ahora.

## SEO y sitemap

- El `title`, `excerpt`, `tags` y `updatedAt` de cada artículo alimentan el título, la descripción, el canonical, los hreflang y el JSON-LD.
- `src/app/sitemap.ts` genera `/sitemap.xml` automáticamente con el hub y todos los artículos en `INFO_ARTICLES`.
- No edites `public/sitemap.xml`: ese archivo estático fue retirado para evitar conflictos con el sitemap dinámico.

## Imágenes actuales

Las imágenes de la primera guía están en:

`public/assets/images/info/kunai/`

La carpeta `info-kunai/` de la raíz es material de referencia local. Los archivos que debe servir la web se copian a `public/`.
