const INFO_SEEN_STORAGE_KEY = "op-info-seen-v1";

export const INFO_SEEN_EVENT = "op-info-seen-updated";

function readSeenKeys(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(INFO_SEEN_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export function getUnseenKeys(keys: string[]): string[] {
  const seen = new Set(readSeenKeys());
  return keys.filter((key) => !seen.has(key));
}

export function hasUnseenKeys(keys: string[]): boolean {
  return getUnseenKeys(keys).length > 0;
}

export function markKeysSeen(keys: string[]): void {
  if (typeof window === "undefined" || keys.length === 0) return;

  try {
    const seen = new Set(readSeenKeys());
    const sizeBefore = seen.size;

    keys.forEach((key) => seen.add(key));
    if (seen.size === sizeBefore) return;

    // Keep the most recent entries so the stored list does not grow forever.
    const next = Array.from(seen).slice(-300);
    window.localStorage.setItem(INFO_SEEN_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(INFO_SEEN_EVENT));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}
