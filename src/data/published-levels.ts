export type TalentMode = "low" | "full";

export const STANDARD_LEVELS: readonly number[] = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170,
  180, 190, 200,
];

/**
 * Levels that should be usable on the public site right now.
 *
 * Some rows still exist in Supabase from the previous update. Keep this list
 * explicit so stale 140-190 rows stay hidden until their new configurations
 * are published. When new levels are ready, add them here.
 */
export const PUBLISHED_LEVELS: Record<TalentMode, readonly number[]> = {
  low: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 200],
  full: [80, 90, 100, 110, 120, 130, 200],
};

export function isPublishedLevel(mode: TalentMode, level: number): boolean {
  return PUBLISHED_LEVELS[mode].includes(level);
}
