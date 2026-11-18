import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_BUFF_ICON,
  DEFAULT_BUFFS,
  type BuffEntry,
  type BuffKind,
} from "@/data/buffs";

export type BuffDbRow = {
  id: string;
  kind: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  icon: string | null;
  duration: string | null;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
};

let hasWarnedAboutMissingTable = false;

export function isBuffKind(value: unknown): value is BuffKind {
  return value === "buff" || value === "debuff";
}

export function mapBuffRow(row: BuffDbRow): BuffEntry {
  return {
    id: row.id,
    kind: isBuffKind(row.kind) ? row.kind : "debuff",
    icon: row.icon || DEFAULT_BUFF_ICON,
    title: {
      es: row.title_es,
      en: row.title_en,
    },
    description: {
      es: row.description_es,
      en: row.description_en,
    },
    duration: row.duration || undefined,
  };
}

export function isMissingBuffsTableError(error: {
  code?: string;
  message?: string;
} | null | undefined): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    /could not find the table.*buffs/i.test(error.message ?? "")
  );
}

/**
 * Reads the public buff gallery from Supabase.
 *
 * If the table has not been created yet (or Supabase is unavailable), the
 * local JSON fallback keeps the public info hub working.
 */
export async function getPublicBuffs(): Promise<BuffEntry[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return DEFAULT_BUFFS;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            cache: "no-store",
          }),
      },
    });

    const { data, error } = await supabase
      .from("buffs")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (!hasWarnedAboutMissingTable) {
        hasWarnedAboutMissingTable = true;
        console.warn(
          "Buffs table unavailable; using src/data/buffs.json fallback.",
          error.message
        );
      }
      return DEFAULT_BUFFS;
    }

    return ((data ?? []) as BuffDbRow[]).map(mapBuffRow);
  } catch (error) {
    if (!hasWarnedAboutMissingTable) {
      hasWarnedAboutMissingTable = true;
      console.warn(
        "Could not load buffs from Supabase; using local fallback.",
        error
      );
    }
    return DEFAULT_BUFFS;
  }
}
