export type ExchangeLocale = "en" | "es";
export type ExchangeText = Record<ExchangeLocale, string>;
export type ExchangeGroup = "equipment" | "chests" | "materials";
export type ExchangeFilter = "all" | ExchangeGroup;

export type ExchangeItem = {
  id: string;
  title: ExchangeText;
  icon: string;
  group: ExchangeGroup;
  /** Number of times this item can be exchanged in the current rotation. */
  stock: number;
  /** Price in Retreat Coins for one exchange. */
  cost: number;
};

export const EXCHANGE_BASE_URL = "https://op-retreat-calculator.vercel.app";

export const EXCHANGE_CURRENCY = {
  icon: "/assets/shop/currency/EscapeCoin.png",
  name: {
    en: "Retreat Coins",
    es: "Monedas de retirada",
  },
} satisfies { icon: string; name: ExchangeText };

export const EXCHANGE_GROUP_LABELS: Record<ExchangeGroup, ExchangeText> = {
  equipment: {
    en: "Equipment",
    es: "Equipo",
  },
  chests: {
    en: "Chests",
    es: "Cofres",
  },
  materials: {
    en: "Materials",
    es: "Materiales",
  },
};

export const EXCHANGE_FILTERS: { id: ExchangeFilter; label: ExchangeText }[] = [
  { id: "all", label: { en: "All", es: "Todos" } },
  { id: "equipment", label: EXCHANGE_GROUP_LABELS.equipment },
  { id: "chests", label: EXCHANGE_GROUP_LABELS.chests },
  { id: "materials", label: EXCHANGE_GROUP_LABELS.materials },
];

export interface ExchangeCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  backToCalculator: string;
  inRotation: string;
  totalLabel: string;
  totalNote: string;
  itemsLabel: string;
  unitsLabel: string;
  catalogTitle: string;
  catalogSubtitle: string;
  filtersLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  showing: string;
  perUnit: string;
  itemTotal: string;
  exchange: string;
  exchanges: string;
  noResults: string;
  noResultsHint: string;
  warningTitle: string;
  warningBody: string;
  disclaimer: string;
}

export const EXCHANGE_UI = {
  en: {
    eyebrow: "Exchange",
    title: "OP Retreat Exchange",
    subtitle:
      "The full OP Retreat shop in one place. Check each item, its exchange limit, and the total cost to clear the current rotation before you spend a single Retreat Coin.",
    backToCalculator: "Open calculator",
    inRotation: "Current rotation",
    totalLabel: "Total shop cost",
    totalNote: "to clear all stock",
    itemsLabel: "items",
    unitsLabel: "exchanges",
    catalogTitle: "Exchange list",
    catalogSubtitle:
      "Prices are per unit. Each card also shows the total cost for all available exchanges.",
    filtersLabel: "Filter by category",
    searchLabel: "Search exchange items",
    searchPlaceholder: "Search item...",
    showing: "Showing {shown} of {total} items · Prices are per unit.",
    perUnit: "per unit",
    itemTotal: "Total x{count}",
    exchange: "exchange",
    exchanges: "exchanges",
    noResults: "No items found.",
    noResultsHint: "Try another name or change the filter.",
    warningTitle: "Season reset",
    warningBody:
      "Retreat Coins reset when the season ends. Spend them before the exchange rotation changes.",
    disclaimer:
      "This page only shows the catalog and total cost. It does not buy items or connect to your game account.",
  },
  es: {
    eyebrow: "Intercambio",
    title: "Intercambios de OP Retreat",
    subtitle:
      "Toda la tienda de OP Retreat en un solo lugar. Consulta cada artículo, sus veces de intercambio y el costo total para agotar la rotación actual antes de gastar una sola Moneda de retirada.",
    backToCalculator: "Abrir calculadora",
    inRotation: "Rotación actual",
    totalLabel: "Costo total de la tienda",
    totalNote: "para agotar todo el stock",
    itemsLabel: "artículos",
    unitsLabel: "intercambios",
    catalogTitle: "Lista de intercambios",
    catalogSubtitle:
      "Los precios son por unidad. Cada tarjeta también muestra el costo total de todos los intercambios disponibles.",
    filtersLabel: "Filtrar por categoría",
    searchLabel: "Buscar artículos de intercambio",
    searchPlaceholder: "Buscar artículo...",
    showing: "Mostrando {shown} de {total} artículos · Los precios son por unidad.",
    perUnit: "por unidad",
    itemTotal: "Total x{count}",
    exchange: "intercambio",
    exchanges: "intercambios",
    noResults: "No encontramos ese artículo.",
    noResultsHint: "Prueba con otro nombre o cambia el filtro.",
    warningTitle: "Reinicio de temporada",
    warningBody:
      "Las Monedas de retirada se reinician al terminar la temporada. Úsalas antes de que cambie la rotación de intercambios.",
    disclaimer:
      "Esta página solo muestra el catálogo y el costo total. No compra artículos ni se conecta a tu cuenta del juego.",
  },
} satisfies Record<ExchangeLocale, ExchangeCopy>;

/**
 * OP Retreat exchange catalog.
 *
 * Source: the OP Retreat shop rotation used in the previous project
 * (templates/shopsExchange/assets/js/main.js), plus the season additions
 * (component key and S vehicle core).
 */
export const EXCHANGE_ITEMS: ExchangeItem[] = [
  {
    id: "s-vehicle-core",
    title: { en: "Mount Core", es: "Núcleo de Montura" },
    icon: "/assets/shop/items/SVehicleCore.png",
    group: "materials",
    stock: 1,
    cost: 35_000,
  },
  {
    id: "xenomascota-core",
    title: { en: "Xenopet Core", es: "Núcleo de Xenomascota" },
    icon: "/assets/shop/items/SPetCore.png",
    group: "materials",
    stock: 1,
    cost: 35_000,
  },
  {
    id: "legendary-resonance-chip-box",
    title: {
      en: "Legendary Resonance Chip Selection Chest",
      es: "Cofre de elección de chip de resonancia legendario",
    },
    icon: "/assets/shop/items/selectBox1_resonanceAccessory.png",
    group: "chests",
    stock: 1,
    cost: 35_000,
  },
  {
    id: "awakening-crystal-box",
    title: {
      en: "Awakening Crystal Selection Chest",
      es: "Cofre de elección de Cristal del despertar",
    },
    icon: "/assets/shop/items/selectBox_petAwaken.png",
    group: "chests",
    stock: 1,
    cost: 35_000,
  },
  {
    id: "resonance-chip-box",
    title: {
      en: "Resonance Chip Selection Chest",
      es: "Cofre de elección de Chip de resonancia",
    },
    icon: "/assets/shop/items/selectBox_resonanceAccessory.png",
    group: "chests",
    stock: 1,
    cost: 35_000,
  },
  {
    id: "relic-core-box",
    title: {
      en: "Relic Core Selection Chest",
      es: "Cofre de elección de Núcleo de reliquia",
    },
    icon: "/assets/shop/items/selectBox_holyStone.png",
    group: "chests",
    stock: 1,
    cost: 35_000,
  },
  {
    id: "survivor-awakening-core-box",
    title: {
      en: "Survivor Awakening Core Selection Chest",
      es: "Cofre de elección de Núcleo de despertar de superviviente",
    },
    icon: "/assets/shop/items/selectBox_agentAwaken.png",
    group: "chests",
    stock: 1,
    cost: 35_000,
  },
  {
    id: "epic-collectible-pack",
    title: {
      en: "Epic Collectible Chest Pack",
      es: "Paquete de cofre de coleccionable épico",
    },
    icon: "/assets/shop/items/collection_choose_7.png",
    group: "chests",
    stock: 4,
    cost: 6_500,
  },
  {
    id: "epic-pet-pack",
    title: {
      en: "Epic Pet Selection Pack",
      es: "Paquete de elección de mascota épica",
    },
    icon: "/assets/shop/items/pet_choose_7.png",
    group: "chests",
    stock: 4,
    cost: 6_500,
  },
  {
    id: "epic-piece-pack",
    title: {
      en: "Epic Piece Selection Pack",
      es: "Paquete de elección de pieza épica",
    },
    icon: "/assets/shop/items/accessory_choose_7.png",
    group: "chests",
    stock: 4,
    cost: 6_500,
  },
  {
    id: "epic-equipment-pack",
    title: {
      en: "Epic Equipment Selection Pack",
      es: "Paquete de elección de equipo épico",
    },
    icon: "/assets/shop/items/equip_choose_7.png",
    group: "chests",
    stock: 4,
    cost: 6_500,
  },
  {
    id: "s-equipment-pack",
    title: {
      en: "S-Grade Excellent Equipment Selection Pack",
      es: "Paquete de elección de equipo excelente de grado S",
    },
    icon: "/assets/shop/items/equip_choose_S_4.png",
    group: "equipment",
    stock: 4,
    cost: 12_000,
  },
  {
    id: "master-yang-fragment",
    title: { en: "Master Yang Fragment", es: "Fragmento de Maestro Yang" },
    icon: "/assets/shop/items/Frag_9.png",
    group: "materials",
    stock: 20,
    cost: 400,
  },
  {
    id: "excellent-collectible-chest",
    title: {
      en: "Excellent Collectible Chest",
      es: "Cofre de coleccionable excelente",
    },
    icon: "/assets/shop/items/collection_drop_4.png",
    group: "chests",
    stock: 8,
    cost: 300,
  },
  {
    id: "excellent-pet-chest",
    title: { en: "Excellent Pet Chest", es: "Cofre de mascota excelente" },
    icon: "/assets/shop/items/pet_drop_0.png",
    group: "chests",
    stock: 8,
    cost: 300,
  },
  {
    id: "excellent-piece-chest",
    title: { en: "Excellent Piece Box", es: "Caja de piezas excelente" },
    icon: "/assets/shop/items/accessory_drop.png",
    group: "chests",
    stock: 8,
    cost: 300,
  },
  {
    id: "excellent-supplies-chest",
    title: {
      en: "Excellent Supplies Box",
      es: "Caja de suministros excelente",
    },
    icon: "/assets/shop/items/equip_drop_0.png",
    group: "chests",
    stock: 8,
    cost: 300,
  },
  {
    id: "random-survivor-fragments",
    title: {
      en: "Random Survivor Fragments",
      es: "Fragmentos de superviviente al azar",
    },
    icon: "/assets/shop/items/Frag_R.png",
    group: "materials",
    stock: 40,
    cost: 100,
  },
  {
    id: "icon-key",
    title: {
      en: "Component Box Key",
      es: "Llave de caja de componentes",
    },
    icon: "/assets/shop/items/icon_key.png",
    group: "materials",
    stock: 30,
    cost: 30,
  },
  {
    id: "piece-box-key",
    title: {
      en: "Piece Box Key",
      es: "Llave de la caja de piezas",
    },
    icon: "/assets/shop/items/AccessoryKey.png",
    group: "materials",
    stock: 30,
    cost: 30,
  },
  {
    id: "collectible-chest-key",
    title: {
      en: "Collectible Chest Key",
      es: "Llave de cofre de coleccionable",
    },
    icon: "/assets/shop/items/CollectionKey.png",
    group: "materials",
    stock: 30,
    cost: 30,
  },
  {
    id: "s-supplies-key",
    title: {
      en: "S Supplies Key",
      es: "Clave de suministros S",
    },
    icon: "/assets/shop/items/Currency_DiamondBoxSpecial.png",
    group: "materials",
    stock: 30,
    cost: 30,
  },
];

const COST_FORMATTERS: Record<ExchangeLocale, Intl.NumberFormat> = {
  en: new Intl.NumberFormat("en-US"),
  es: new Intl.NumberFormat("es-ES"),
};

export function isExchangeLocale(locale: string): locale is ExchangeLocale {
  return locale === "en" || locale === "es";
}

export function getExchangeText(
  value: ExchangeText,
  locale: ExchangeLocale
): string {
  return value[locale];
}

export function formatExchangeCost(
  value: number,
  locale: ExchangeLocale
): string {
  return COST_FORMATTERS[locale].format(value);
}

export function getExchangeItemTotal(item: ExchangeItem): number {
  return item.cost * item.stock;
}

export function getExchangeTotalCost(
  items: readonly ExchangeItem[] = EXCHANGE_ITEMS
): number {
  return items.reduce(
    (total, item) => total + getExchangeItemTotal(item),
    0
  );
}

export function getExchangeTotalStock(
  items: readonly ExchangeItem[] = EXCHANGE_ITEMS
): number {
  return items.reduce((total, item) => total + item.stock, 0);
}
