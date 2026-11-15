export type TalentMode = "low" | "full";

export type TalentConfig = Record<string, [number]>;

export const STANDARD_LEVELS: readonly number[] = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170,
  180, 190, 200,
];

/** Total stars in a saved configuration. Empty objects count as zero. */
export function getConfigPoints(config: TalentConfig | null | undefined): number {
  if (!config) return 0;

  return Object.values(config).reduce((total, value) => {
    if (!Array.isArray(value)) return total;
    const stars = Number(value[0] ?? 0);
    return total + (Number.isFinite(stars) ? stars : 0);
  }, 0);
}

/** A level is visible on the public site only when it has at least one point. */
export function hasTalentPoints(config: TalentConfig | null | undefined): boolean {
  return getConfigPoints(config) > 0;
}
