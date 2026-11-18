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

export const BUFFS: BuffEntry[] = buffsData.buffs.map((buff) => ({
  ...buff,
  kind: buff.kind === "buff" ? "buff" : "debuff",
}));

export function getLocalizedBuffText(
  value: BuffText,
  locale: BuffLocale
): string {
  return value[locale];
}
