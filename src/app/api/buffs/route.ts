import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import {
  isBuffKind,
  isMissingBuffsTableError,
  mapBuffRow,
  type BuffDbRow,
} from "@/lib/buffs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_BUFF_ICON, type BuffKind } from "@/data/buffs";

type BuffDraft = {
  kind: BuffKind;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
};

async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminUser(user)) {
    return null;
  }

  // Service-role writes are optional. Without the key, the authenticated
  // admin session writes through RLS (app_metadata.role = "admin").
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : supabase;
}

function dbErrorResponse(error: { code?: string; message?: string }) {
  const missingTable = isMissingBuffsTableError(error);

  return NextResponse.json(
    {
      error: missingTable
        ? "The public.buffs table does not exist yet. Run supabase/buffs.sql in the Supabase SQL Editor, then reload this page."
        : error.message || "The buffs database request failed.",
      code: missingTable ? "BUFFS_TABLE_MISSING" : "BUFFS_DB_ERROR",
    },
    { status: missingTable ? 503 : 500 }
  );
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

function parseDraft(body: Record<string, unknown>): BuffDraft | null {
  const kind = isBuffKind(body.kind) ? body.kind : null;
  const titleEs = readText(body.titleEs, 120);
  const titleEn = readText(body.titleEn, 120);
  const descriptionEs = readText(body.descriptionEs, 600);
  const descriptionEn = readText(body.descriptionEn, 600);

  if (!kind || !titleEs || !titleEn || !descriptionEs || !descriptionEn) {
    return null;
  }

  return { kind, titleEs, titleEn, descriptionEs, descriptionEn };
}

function draftToRow(draft: BuffDraft) {
  return {
    kind: draft.kind,
    title_es: draft.titleEs,
    title_en: draft.titleEn,
    description_es: draft.descriptionEs,
    description_en: draft.descriptionEn,
    updated_at: new Date().toISOString(),
  };
}

// GET /api/buffs — admin list, including the four initial rows after setup.
export async function GET() {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("buffs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return dbErrorResponse(error);

  return NextResponse.json({
    buffs: ((data ?? []) as BuffDbRow[]).map(mapBuffRow),
  });
}

// POST /api/buffs — create a buff/debuff card.
export async function POST(request: Request) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const draft = parseDraft(body);

    if (!draft) {
      return NextResponse.json(
        {
          error:
            "Completa el tipo, el título y la descripción en español e inglés.",
        },
        { status: 400 }
      );
    }

    const { data: lastRow, error: orderError } = await supabase
      .from("buffs")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (orderError) return dbErrorResponse(orderError);

    const sortOrder = (lastRow?.sort_order ?? 0) + 1;

    const { data, error } = await supabase
      .from("buffs")
      .insert({
        ...draftToRow(draft),
        icon: DEFAULT_BUFF_ICON,
        duration: null,
        sort_order: sortOrder,
      })
      .select("*")
      .single();

    if (error) return dbErrorResponse(error);

    return NextResponse.json({
      buff: mapBuffRow(data as BuffDbRow),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

// PATCH /api/buffs — edit the bilingual title/description or kind.
export async function PATCH(request: Request) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const draft = parseDraft(body);

    if (!id || !draft) {
      return NextResponse.json(
        { error: "Faltan datos para actualizar el buff." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("buffs")
      .update(draftToRow(draft))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) return dbErrorResponse(error);
    if (!data) {
      return NextResponse.json({ error: "Buff not found." }, { status: 404 });
    }

    return NextResponse.json({
      buff: mapBuffRow(data as BuffDbRow),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

// DELETE /api/buffs?id=<uuid>
export async function DELETE(request: Request) {
  const supabase = await getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "Missing buff id." }, { status: 400 });
  }

  const { error } = await supabase.from("buffs").delete().eq("id", id);

  if (error) return dbErrorResponse(error);

  return NextResponse.json({ success: true });
}
