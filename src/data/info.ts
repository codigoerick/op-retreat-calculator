export type InfoLocale = "en" | "es";
export type LocalizedText = Record<InfoLocale, string>;
export type LocalizedList = Record<InfoLocale, string[]>;

export type InfoCategoryId = "damage";

export interface InfoCategory {
  id: InfoCategoryId;
  icon: string;
  label: LocalizedText;
  description: LocalizedText;
}

export interface InfoTableCell {
  label: LocalizedText;
  value: string;
  icon?: string;
  share?: number;
  note?: LocalizedText;
}

export type InfoBlock =
  | { type: "paragraph"; text: LocalizedText }
  | { type: "heading"; text: LocalizedText }
  | { type: "list"; ordered?: boolean; items: LocalizedList }
  | {
      type: "table";
      columns: LocalizedList;
      rows: InfoTableCell[];
      caption?: LocalizedText;
    }
  | {
      type: "callout";
      tone?: "info" | "warning" | "success";
      title?: LocalizedText;
      text: LocalizedText;
    }
  | {
      type: "image";
      src: string;
      width: number;
      height: number;
      alt: LocalizedText;
      caption?: LocalizedText;
    };

export interface InfoArticle {
  slug: string;
  category: InfoCategoryId;
  icon: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  title: LocalizedText;
  excerpt: LocalizedText;
  tags: LocalizedList;
  source: LocalizedText;
  blocks: InfoBlock[];
}

export const INFO_CATEGORIES: InfoCategory[] = [
  {
    id: "damage",
    icon: "bi-lightning-charge-fill",
    label: {
      en: "Damage & skills",
      es: "Daño y habilidades",
    },
    description: {
      en: "Damage breakdowns and comparisons for weapons, skills, and evolutions.",
      es: "Desgloses y comparativas de daño de armas, habilidades y evoluciones.",
    },
  },
];

export const INFO_UI = {
  en: {
    eyebrow: "Knowledge base",
    title: "OP Retreat Info",
    subtitle:
      "Guides, damage breakdowns, and practical notes for OP Retreat. This section is built to grow with new topics and categories.",
    featured: "Latest guide",
    readLatest: "Read latest guide",
    allGuides: "All guides",
    categories: "Categories",
    buffsTitle: "Buffs & debuffs",
    buffsSubtitle:
      "Effects that can appear when clearing spawn towers and altars. More entries will be added as they are documented.",
    buffsCount: "effects",
    readGuide: "Read guide",
    minRead: "min read",
    updated: "Updated",
    published: "Published",
    category: "Category",
    home: "Home",
    backToInfo: "Back to info",
    backToCalculator: "Open calculator",
    calculatorCta: "Plan your build",
    calculatorCtaBody:
      "Use the talent calculator while you read. It opens on the main page and keeps the public site unchanged.",
    source: "Source",
    note: "Note",
    moreComing: "More content coming soon",
    moreComingBody:
      "Each new topic gets its own card and detail page. That keeps the hub organized as more guides, tables, and sections are added.",
    new: "New",
    empty: "No guides published yet.",
    notFoundTitle: "Guide not found",
    notFoundBody: "The guide you are looking for does not exist or has been moved.",
    notFoundCta: "Back to info",
    tags: "Tags",
  },
  es: {
    eyebrow: "Base de conocimiento",
    title: "Información de OP Retreat",
    subtitle:
      "Guías, desgloses de daño y notas prácticas de OP Retreat. Esta sección está pensada para crecer con nuevos temas y categorías.",
    featured: "Última guía",
    readLatest: "Leer última guía",
    allGuides: "Todas las guías",
    categories: "Categorías",
    buffsTitle: "Buffs y debuffs",
    buffsSubtitle:
      "Efectos que pueden aparecer al completar torres de aparición y altares. Se irán agregando más a medida que se documenten.",
    buffsCount: "efectos",
    readGuide: "Leer guía",
    minRead: "min de lectura",
    updated: "Actualizado",
    published: "Publicado",
    category: "Categoría",
    home: "Inicio",
    backToInfo: "Volver a información",
    backToCalculator: "Abrir calculadora",
    calculatorCta: "Planifica tu build",
    calculatorCtaBody:
      "Usa la calculadora de talentos mientras lees. Se abre en la página principal y el sitio público sigue igual.",
    source: "Fuente",
    note: "Nota",
    moreComing: "Más contenido próximamente",
    moreComingBody:
      "Cada tema nuevo tendrá su propia tarjeta y página de detalle. Así el centro de información se mantiene ordenado a medida que agregamos guías, tablas y secciones.",
    new: "Nuevo",
    empty: "Todavía no hay guías publicadas.",
    notFoundTitle: "Guía no encontrada",
    notFoundBody: "La guía que buscas no existe o fue movida.",
    notFoundCta: "Volver a información",
    tags: "Etiquetas",
  },
} satisfies Record<InfoLocale, Record<string, string>>;

const KUNAI_ICON_PATH = "/assets/images/info/kunai";

export const INFO_ARTICLES: InfoArticle[] = [
  {
    slug: "kunai-damage-breakdown",
    category: "damage",
    icon: `${KUNAI_ICON_PATH}/spiritShuriken.png`,
    publishedAt: "2026-11-16",
    updatedAt: "2026-11-16",
    readingMinutes: 4,
    title: {
      en: "Kunai & Evolved Skill Damage",
      es: "Daño de kunai y habilidades evolucionadas",
    },
    excerpt: {
      en: "Phase damage breakdown for Spirit Shuriken, Supercell, Whistling Arrow, Quantum Ball, Destroyer, and Fuel Barrel.",
      es: "Reparto del daño de fase entre Spirit Shuriken, Supercell, Whistling Arrow, Quantum Ball, Destroyer y Fuel Barrel.",
    },
    tags: {
      en: ["Kunai", "Damage", "Evolved skills"],
      es: ["Kunai", "Daño", "Habilidades evolucionadas"],
    },
    source: {
      en: "Community reference data shared for this guide.",
      es: "Datos de referencia compartidos por la comunidad para esta guía.",
    },
    blocks: [
      {
        type: "paragraph",
        text: {
          en: "This table shows how phase damage was distributed across the evolved weapon skills in one sample. The percentages add up to 100% and are useful for comparing how much each skill contributed.",
          es: "Esta tabla muestra cómo se repartió el daño de una fase entre las habilidades de arma evolucionadas en una muestra. Los porcentajes suman 100% y sirven para comparar cuánto aportó cada habilidad.",
        },
      },
      {
        type: "table",
        columns: {
          en: ["Weapon skill", "% of phase damage"],
          es: ["Habilidad de arma", "% del daño de fase"],
        },
        caption: {
          en: "Percentage of phase damage by weapon skill.",
          es: "Porcentaje del daño de fase por habilidad de arma.",
        },
        rows: [
          {
            label: { en: "Destroyer", es: "Destroyer" },
            value: "30.2%",
            share: 30.2,
            icon: `${KUNAI_ICON_PATH}/destroyer.png`,
          },
          {
            label: { en: "Supercell", es: "Supercell" },
            value: "24.5%",
            share: 24.5,
            icon: `${KUNAI_ICON_PATH}/supercell.png`,
          },
          {
            label: { en: "Whistling Arrow", es: "Whistling Arrow" },
            value: "20.8%",
            share: 20.8,
            icon: `${KUNAI_ICON_PATH}/whistlingArrow.png`,
          },
          {
            label: { en: "Spirit Shuriken", es: "Spirit Shuriken" },
            value: "15.1%",
            share: 15.1,
            icon: `${KUNAI_ICON_PATH}/spiritShuriken.png`,
          },
          {
            label: { en: "Quantum Ball", es: "Quantum Ball" },
            value: "7.5%",
            share: 7.5,
            icon: `${KUNAI_ICON_PATH}/quantumBall.png`,
          },
          {
            label: { en: "Fuel Barrel", es: "Fuel Barrel" },
            value: "1.9%",
            share: 1.9,
            icon: `${KUNAI_ICON_PATH}/fuelBarrel.png`,
          },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: { en: "Reference data", es: "Datos de referencia" },
        text: {
          en: "These values come from one sample. The distribution can change with the phase, skill level, gear, and combat duration.",
          es: "Estos valores vienen de una muestra. La distribución puede cambiar según la fase, el nivel de las habilidades, el equipo y la duración del combate.",
        },
      },
      {
        type: "heading",
        text: { en: "Quick read", es: "Lectura rápida" },
      },
      {
        type: "list",
        items: {
          en: [
            "Destroyer led the sample with 30.2% of phase damage.",
            "Supercell (24.5%) and Whistling Arrow (20.8%) completed the top three.",
            "Spirit Shuriken contributed 15.1%.",
            "Quantum Ball (7.5%) and Fuel Barrel (1.9%) had a smaller share in this sample.",
          ],
          es: [
            "Destroyer lideró la muestra con 30.2% del daño de fase.",
            "Supercell (24.5%) y Whistling Arrow (20.8%) completaron el top 3.",
            "Spirit Shuriken aportó 15.1%.",
            "Quantum Ball (7.5%) y Fuel Barrel (1.9%) tuvieron un peso menor en esta muestra.",
          ],
        },
      },
      {
        type: "heading",
        text: {
          en: "How to use this breakdown",
          es: "Cómo usar este desglose",
        },
      },
      {
        type: "paragraph",
        text: {
          en: "A high percentage means that the skill did more damage in that sample; it does not automatically mean it is the best choice in every situation. Use the table to identify which skills are carrying the damage and to decide what to test next.",
          es: "Un porcentaje alto significa que esa habilidad hizo más daño en esa muestra; no significa automáticamente que sea la mejor opción en todas las situaciones. Usa la tabla para identificar qué habilidades están cargando el daño y decidir qué probar después.",
        },
      },
      {
        type: "list",
        items: {
          en: [
            "Keep the same skill levels when comparing two runs.",
            "Test more than one phase before drawing a conclusion.",
            "Note the gear, talents, and run duration used for each measurement.",
          ],
          es: [
            "Mantén los mismos niveles de habilidad al comparar dos pruebas.",
            "Prueba más de una fase antes de sacar una conclusión.",
            "Anota el equipo, los talentos y la duración de cada medición.",
          ],
        },
      },
      {
        type: "callout",
        tone: "warning",
        title: { en: "Keep samples separate", es: "No mezcles muestras" },
        text: {
          en: "Do not compare tables from different phases as if they were the same sample. If you change a skill level, gear, or duration, the percentages are no longer directly comparable.",
          es: "No compares tablas de fases distintas como si fueran la misma muestra. Si cambias el nivel de una habilidad, el equipo o la duración, los porcentajes dejan de ser comparables directamente.",
        },
      },
      {
        type: "heading",
        text: { en: "Source and updates", es: "Fuente y actualizaciones" },
      },
      {
        type: "paragraph",
        text: {
          en: "This guide will be updated when new measurements or additional evolved skills are available.",
          es: "Esta guía se actualizará cuando haya nuevas mediciones o habilidades evolucionadas adicionales.",
        },
      },
    ],
  },
];

export const INFO_BASE_URL = "https://op-retreat-calculator.vercel.app";

export function isInfoLocale(value: string): value is InfoLocale {
  return value === "en" || value === "es";
}

export function formatInfoDate(value: string, locale: InfoLocale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function getLocalized<T>(
  value: Record<InfoLocale, T>,
  locale: InfoLocale
): T {
  return value[locale];
}

export function getInfoArticle(slug: string): InfoArticle | undefined {
  return INFO_ARTICLES.find((article) => article.slug === slug);
}

export function getInfoNotificationKey(
  article: Pick<InfoArticle, "slug" | "updatedAt">
): string {
  return `${article.slug}@${article.updatedAt}`;
}

export function getCategory(
  categoryId: InfoCategoryId
): InfoCategory | undefined {
  return INFO_CATEGORIES.find((category) => category.id === categoryId);
}
