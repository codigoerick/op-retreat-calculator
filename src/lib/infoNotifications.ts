import { getAppVersion } from "@/lib/appVersion";

const INFO_SEEN_STORAGE_KEY = "op-info-seen-v1";
const MAX_SEEN_KEYS = 300;

export const INFO_SEEN_EVENT = "op-info-seen-updated";

type SeenState = {
  version: string;
  keys: string[];
};

function readSeenState(): SeenState {
  const version = getAppVersion();

  if (typeof window === "undefined") {
    return { version, keys: [] };
  }

  try {
    const raw = window.localStorage.getItem(INFO_SEEN_STORAGE_KEY);
    if (!raw) return { version, keys: [] };

    const parsed: unknown = JSON.parse(raw);

    // Older versions stored a plain array. Ignore it for the current
    // deployment so existing visitors see the release badges again.
    if (Array.isArray(parsed)) return { version, keys: [] };

    if (!parsed || typeof parsed !== "object") {
      return { version, keys: [] };
    }

    const stored = parsed as { version?: unknown; keys?: unknown };
    if (stored.version !== version || !Array.isArray(stored.keys)) {
      return { version, keys: [] };
    }

    return {
      version,
      keys: stored.keys.filter(
        (value): value is string => typeof value === "string"
      ),
    };
  } catch {
    return { version, keys: [] };
  }
}

export function getUnseenKeys(keys: string[]): string[] {
  const seen = new Set(readSeenState().keys);
  return keys.filter((key) => !seen.has(key));
}

export function hasUnseenKeys(keys: string[]): boolean {
  return getUnseenKeys(keys).length > 0;
}

export function markKeysSeen(keys: string[]): void {
  if (typeof window === "undefined" || keys.length === 0) return;

  try {
    const state = readSeenState();
    const seen = new Set(state.keys);
    const sizeBefore = seen.size;

    keys.forEach((key) => seen.add(key));
    if (seen.size === sizeBefore) return;

    // Keep the most recent entries so the stored list does not grow forever.
    const next: SeenState = {
      version: state.version,
      keys: Array.from(seen).slice(-MAX_SEEN_KEYS),
    };
    window.localStorage.setItem(INFO_SEEN_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(INFO_SEEN_EVENT));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}
