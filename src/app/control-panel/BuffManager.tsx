"use client";

import { useCallback, useEffect, useState } from "react";
import BuffCard from "@/components/buffs/BuffCard";
import {
  DEFAULT_BUFF_ICON,
  type BuffEntry,
  type BuffKind,
} from "@/data/buffs";

type BuffDraft = {
  kind: BuffKind;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
};

const EMPTY_DRAFT: BuffDraft = {
  kind: "debuff",
  titleEs: "",
  titleEn: "",
  descriptionEs: "",
  descriptionEn: "",
};

const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
  /^https:\/\/([^.]+)\.supabase\.co/
)?.[1];
const SQL_EDITOR_URL = SUPABASE_PROJECT_REF
  ? `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/sql/new`
  : null;

const fieldStyle = {
  background: "#121212",
  border: "1px solid #2e2e2e",
  color: "white",
  padding: "11px 12px",
  borderRadius: "6px",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
} as const;

const labelStyle = {
  color: "#8a8a8a",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.7px",
  marginBottom: "6px",
  display: "block",
} as const;

const primaryButton = {
  background: "#3ecf8e",
  color: "#121212",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  fontWeight: 700,
  fontSize: "12px",
  cursor: "pointer",
} as const;

const secondaryButton = {
  background: "transparent",
  color: "#d4d4d4",
  border: "1px solid #3f3f46",
  borderRadius: "6px",
  padding: "8px 16px",
  fontWeight: 600,
  fontSize: "12px",
  cursor: "pointer",
} as const;

const dangerButton = {
  background: "transparent",
  color: "#ef4444",
  border: "1px solid rgba(239,68,68,0.35)",
  borderRadius: "6px",
  padding: "7px 13px",
  fontWeight: 600,
  fontSize: "12px",
  cursor: "pointer",
} as const;

type BuffManagerProps = {
  showToast: (message: string, ok?: boolean) => void;
};

export default function BuffManager({ showToast }: BuffManagerProps) {
  const [buffs, setBuffs] = useState<BuffEntry[]>([]);
  const [draft, setDraft] = useState<BuffDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableMissing, setTableMissing] = useState(false);

  const loadBuffs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/buffs", { cache: "no-store" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setBuffs([]);
        setTableMissing(data?.code === "BUFFS_TABLE_MISSING");
        setError(data?.error || "No se pudieron cargar los buffs.");
        return;
      }

      setBuffs(data?.buffs || []);
      setTableMissing(false);
    } catch {
      setBuffs([]);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial data load; the component owns its loading/error state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBuffs();
  }, [loadBuffs]);

  const openCreate = () => {
    setEditingId(null);
    setDraft({ ...EMPTY_DRAFT });
    setError(null);
  };

  const openEdit = (buff: BuffEntry) => {
    setEditingId(buff.id);
    setDraft({
      kind: buff.kind,
      titleEs: buff.title.es,
      titleEn: buff.title.en,
      descriptionEs: buff.description.es,
      descriptionEn: buff.description.en,
    });
    setError(null);
  };

  const closeEditor = () => {
    setDraft(null);
    setEditingId(null);
  };

  const updateDraft = (patch: Partial<BuffDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const saveBuff = async () => {
    if (!draft) return;

    if (
      !draft.titleEs.trim() ||
      !draft.titleEn.trim() ||
      !draft.descriptionEs.trim() ||
      !draft.descriptionEn.trim()
    ) {
      showToast("Completa el título y la descripción en ambos idiomas.", false);
      return;
    }

    setIsSaving(true);

    try {
      const isEditing = Boolean(editingId);
      const res = await fetch("/api/buffs", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing ? { id: editingId, ...draft } : draft
        ),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.code === "BUFFS_TABLE_MISSING") {
          setTableMissing(true);
        }
        throw new Error(data?.error || "No se pudo guardar el buff.");
      }

      showToast(
        isEditing
          ? "Buff actualizado en la web pública."
          : "Buff creado en la web pública."
      );
      closeEditor();
      await loadBuffs();
    } catch (saveError) {
      showToast(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el buff.",
        false
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeBuff = async (buff: BuffEntry) => {
    if (!window.confirm(`¿Eliminar "${buff.title.es}"?`)) return;

    setIsSaving(true);

    try {
      const res = await fetch(`/api/buffs?id=${encodeURIComponent(buff.id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (data?.code === "BUFFS_TABLE_MISSING") {
          setTableMissing(true);
        }
        throw new Error(data?.error || "No se pudo eliminar el buff.");
      }

      if (editingId === buff.id) closeEditor();
      showToast("Buff eliminado de la web pública.");
      await loadBuffs();
    } catch (deleteError) {
      showToast(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el buff.",
        false
      );
    } finally {
      setIsSaving(false);
    }
  };

  const previewBuff: BuffEntry | null = draft
    ? {
        id: editingId || "preview",
        kind: draft.kind,
        icon: DEFAULT_BUFF_ICON,
        title: {
          es: draft.titleEs.trim() || "Título del buff",
          en: draft.titleEn.trim() || draft.titleEs.trim() || "Buff title",
        },
        description: {
          es:
            draft.descriptionEs.trim() ||
            "La descripción aparecerá aquí, con el mismo estilo del cartel público.",
          en:
            draft.descriptionEn.trim() ||
            draft.descriptionEs.trim() ||
            "The description will appear here in the public card style.",
        },
      }
    : null;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "24px",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        <div>
          <h2 style={{ color: "white", fontWeight: 700, fontSize: "20px", margin: 0 }}>
            Buffs & Debuffs Manager
          </h2>
          <p
            style={{
              color: "#8a8a8a",
              fontSize: "13px",
              marginTop: "6px",
              maxWidth: "720px",
              lineHeight: 1.6,
            }}
          >
            Crea, edita o elimina los carteles que aparecen en la sección
            pública de Información. El diseño del cartel, el icono y la
            duración se conservan; aquí solo se administran el tipo, el título
            y la descripción en ambos idiomas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => void loadBuffs()}
            disabled={isLoading}
            style={{ ...secondaryButton, opacity: isLoading ? 0.6 : 1 }}
          >
            ⟳ Refresh
          </button>
          <button
            type="button"
            onClick={openCreate}
            disabled={isLoading || isSaving || tableMissing}
            style={{
              ...primaryButton,
              opacity: isLoading || isSaving || tableMissing ? 0.5 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
            Add Buff
          </button>
        </div>
      </div>

      {tableMissing && (
        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.35)",
            borderRadius: "8px",
            padding: "20px 22px",
            marginBottom: "22px",
            color: "#f5d38b",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#f59e0b", display: "block", marginBottom: "6px" }}>
            Falta crear la tabla en Supabase
          </strong>
          <p style={{ margin: 0 }}>
            Ejecuta el archivo <code>supabase/buffs.sql</code> en el SQL Editor
            de Supabase. Después pulsa <strong>Refresh</strong>. Mientras tanto,
            la web pública sigue usando los 4 buffs iniciales de respaldo.{" "}
            {SQL_EDITOR_URL && (
              <a
                href={SQL_EDITOR_URL}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#f5d38b", textDecoration: "underline" }}
              >
                Abrir SQL Editor ↗
              </a>
            )}
          </p>
        </div>
      )}

      {error && !tableMissing && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "8px",
            padding: "14px 16px",
            marginBottom: "22px",
            color: "#fca5a5",
            fontSize: "12.5px",
          }}
        >
          {error}
        </div>
      )}

      {draft && (
        <section
          style={{
            background: "#1e1e1e",
            border: "1px solid #2e2e2e",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h3 style={{ color: "white", fontSize: "16px", margin: 0 }}>
                {editingId ? "Edit buff" : "New buff"}
              </h3>
              <p style={{ color: "#8a8a8a", fontSize: "12px", margin: "5px 0 0" }}>
                Los cambios se publican en <code>/es/info#buffs</code> y{" "}
                <code>/en/info#buffs</code>.
              </p>
            </div>
            <button
              type="button"
              onClick={closeEditor}
              aria-label="Close editor"
              style={{
                background: "transparent",
                border: "none",
                color: "#8a8a8a",
                fontSize: "22px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "26px",
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label htmlFor="buff-kind" style={labelStyle}>
                  Tipo
                </label>
                <select
                  id="buff-kind"
                  value={draft.kind}
                  onChange={(event) =>
                    updateDraft({ kind: event.target.value as BuffKind })
                  }
                  style={fieldStyle}
                >
                  <option value="debuff">Debuff (título rojo)</option>
                  <option value="buff">Buff (título verde)</option>
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "18px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ color: "#3ecf8e", fontSize: "13px", margin: 0 }}>
                    🇲🇽 Español
                  </h4>
                  <div>
                    <label htmlFor="buff-title-es" style={labelStyle}>
                      Título (ES)
                    </label>
                    <input
                      id="buff-title-es"
                      value={draft.titleEs}
                      onChange={(event) =>
                        updateDraft({ titleEs: event.target.value })
                      }
                      placeholder="Visión borrosa"
                      maxLength={120}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="buff-description-es" style={labelStyle}>
                      Descripción (ES)
                    </label>
                    <textarea
                      id="buff-description-es"
                      value={draft.descriptionEs}
                      onChange={(event) =>
                        updateDraft({ descriptionEs: event.target.value })
                      }
                      placeholder="Los enemigos a veces son invisibles..."
                      maxLength={600}
                      style={{ ...fieldStyle, minHeight: "120px", resize: "vertical" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ color: "#60a5fa", fontSize: "13px", margin: 0 }}>
                    🇺🇸 English
                  </h4>
                  <div>
                    <label htmlFor="buff-title-en" style={labelStyle}>
                      Title (EN)
                    </label>
                    <input
                      id="buff-title-en"
                      value={draft.titleEn}
                      onChange={(event) =>
                        updateDraft({ titleEn: event.target.value })
                      }
                      placeholder="Blurred Vision"
                      maxLength={120}
                      style={fieldStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="buff-description-en" style={labelStyle}>
                      Description (EN)
                    </label>
                    <textarea
                      id="buff-description-en"
                      value={draft.descriptionEn}
                      onChange={(event) =>
                        updateDraft({ descriptionEn: event.target.value })
                      }
                      placeholder="Enemies are sometimes invisible..."
                      maxLength={600}
                      style={{ ...fieldStyle, minHeight: "120px", resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span style={labelStyle}>Vista previa (ES)</span>
              <div style={{ maxWidth: "420px" }}>
                {previewBuff && <BuffCard buff={previewBuff} locale="es" />}
              </div>
              <p style={{ color: "#6b7280", fontSize: "11px", lineHeight: 1.5, marginTop: "10px" }}>
                El icono, la duración y el resto del cartel no cambian desde
                este formulario.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "22px",
              paddingTop: "18px",
              borderTop: "1px solid #2e2e2e",
            }}
          >
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  const buff = buffs.find((item) => item.id === editingId);
                  if (buff) void removeBuff(buff);
                }}
                disabled={isSaving}
                style={{ ...dangerButton, marginRight: "auto" }}
              >
                Delete
              </button>
            )}
            <button type="button" onClick={closeEditor} style={secondaryButton}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveBuff()}
              disabled={isSaving}
              style={{ ...primaryButton, opacity: isSaving ? 0.6 : 1 }}
            >
              {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Buff"}
            </button>
          </div>
        </section>
      )}

      {isLoading ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            color: "#8a8a8a",
            border: "1px solid #2e2e2e",
            borderRadius: "8px",
            background: "#171717",
          }}
        >
          Cargando buffs desde Supabase...
        </div>
      ) : buffs.length === 0 && !tableMissing ? (
        <div
          style={{
            padding: "60px 30px",
            textAlign: "center",
            color: "#8a8a8a",
            border: "1px dashed #2e2e2e",
            borderRadius: "8px",
            background: "#171717",
          }}
        >
          No hay buffs registrados. Crea el primero con “Add Buff”.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {buffs.map((buff) => (
            <div
              key={buff.id}
              style={{
                background: "#1e1e1e",
                border: "1px solid #2e2e2e",
                borderRadius: "8px",
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background:
                      buff.kind === "buff"
                        ? "rgba(62,207,142,0.12)"
                        : "rgba(239,68,68,0.12)",
                    color: buff.kind === "buff" ? "#3ecf8e" : "#f87171",
                    border: `1px solid ${
                      buff.kind === "buff"
                        ? "rgba(62,207,142,0.25)"
                        : "rgba(239,68,68,0.25)"
                    }`,
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {buff.kind}
                </span>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <strong style={{ color: "white", fontSize: "14px" }}>
                    {buff.title.es}
                  </strong>
                  <span style={{ color: "#8a8a8a", fontSize: "12px", marginLeft: "10px" }}>
                    {buff.title.en}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => openEdit(buff)}
                    style={secondaryButton}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeBuff(buff)}
                    disabled={isSaving}
                    style={dangerButton}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "12px",
                  marginTop: "14px",
                }}
              >
                <p style={{ color: "#b8b8b8", fontSize: "12px", lineHeight: 1.5, margin: 0 }}>
                  <span style={{ color: "#3ecf8e", fontWeight: 700 }}>ES </span>
                  {buff.description.es}
                </p>
                <p style={{ color: "#b8b8b8", fontSize: "12px", lineHeight: 1.5, margin: 0 }}>
                  <span style={{ color: "#60a5fa", fontWeight: 700 }}>EN </span>
                  {buff.description.en}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "26px",
          paddingTop: "18px",
          borderTop: "1px solid #2e2e2e",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          fontSize: "12px",
        }}
      >
        <a
          href="/es/info#buffs"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#3ecf8e" }}
        >
          Ver sección pública (ES) ↗
        </a>
        <a
          href="/en/info#buffs"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#60a5fa" }}
        >
          View public section (EN) ↗
        </a>
      </div>
    </div>
  );
}
