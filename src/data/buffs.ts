import buffsData from "./buffs.json";

export type BuffLocale = "en" | "es";
export type BuffKind = "buff" | "debuff";
export type BuffText = Record<BuffLocale, string>;

export type BuffEntry = {
  id: string;
  kind: BuffKind;
  icon: string;
  title: BuffText;
  description: BuffText;
  duration?: string;
};

export const DEFAULT_BUFF_ICON =
  "/assets/images/buff/CommonAffixIcon_BadPerk2.png";

/**
 * Local fallback used when the public.buffs table is not available yet.
 * The live source for the info hub is Supabase (see src/lib/buffs.ts).
 */
export const DEFAULT_BUFFS: BuffEntry[] = buffsData.buffs.map((buff) => ({
  ...buff,
  kind: buff.kind === "buff" ? "buff" : "debuff",
}));

export function getLocalizedBuffText(
  value: BuffText,
  locale: BuffLocale
): string {
  return value[locale];
}
