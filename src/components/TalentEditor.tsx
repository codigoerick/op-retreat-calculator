"use client";

import React, { useState, useMemo, useEffect } from "react";
import TalentNode from "./TalentNode";
import talentsData from "@/data/talents.json";
import { supabase } from "@/lib/supabase";

interface TalentEditorProps {
  initialMode: "low" | "full";
}

export default function TalentEditor({ initialMode }: TalentEditorProps) {
  const [mode, setMode] = useState<"low" | "full">(initialMode);
  const [level, setLevel] = useState<string>("");
  const [editConfig, setEditConfig] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [availableBases, setAvailableBases] = useState<string[]>([]);
  const [isLoadingBases, setIsLoadingBases] = useState(false);

  // Memoize the talents map
  const talentsMap = useMemo(() => {
    const map: Record<number, any> = {};
    talentsData.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, []);

  // Rows structure
  const rows = useMemo(() => {
    const r = [];
    for (let i = 21; i >= 0; i--) {
      r.push([i * 3 + 1, i * 3 + 2, i * 3 + 3]);
    }
    r.push([0]);
    return r;
  }, []);

  // Fetch available levels for the "Copy from" functionality
  useEffect(() => {
    const fetchBases = async () => {
      setIsLoadingBases(true);
      const { data } = await supabase.from("talent_presets").select("config_data").eq("mode", mode).single();
      if (data?.config_data) {
        setAvailableBases(Object.keys(data.config_data).sort((a,b) => Number(b) - Number(a)));
      }
      setIsLoadingBases(false);
    };
    fetchBases();
  }, [mode]);

  const loadBase = async (lvl: string) => {
    if (!lvl) return;
    const { data } = await supabase.from("talent_presets").select("config_data").eq("mode", mode).single();
    if (data?.config_data && data.config_data[lvl]) {
      setEditConfig(data.config_data[lvl]);
      setLevel(lvl); // Pre-fill level if copying
    }
  };

  const handleNodeClick = (id: number) => {
    const currentStars = editConfig[id.toString()] ? editConfig[id.toString()][0] : 0;
    const nextStars = (currentStars + 1) % 6; // Cycle 0-5
    
    setEditConfig({
      ...editConfig,
      [id.toString()]: [nextStars]
    });
  };

  const saveConfig = async () => {
    if (!level || isNaN(Number(level))) {
      alert("Por favor ingresa un número de nivel válido.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: preset } = await supabase.from("talent_presets").select("config_data").eq("mode", mode).single();
      const updatedConfig = { ...(preset?.config_data || {}), [level]: editConfig };
      
      const { error } = await supabase.from("talent_presets").update({ config_data: updatedConfig }).eq("mode", mode);
      if (error) throw error;
      
      alert(`Configuración nivel ${level} (${mode}) guardada con éxito.`);
      window.location.reload();
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStars = (id: number) => {
    return editConfig[id.toString()] ? editConfig[id.toString()][0] : 0;
  };

  const isUnlocked = (id: number) => {
    return getStars(id) > 0;
  };

  return (
    <div className="talent-editor-wrapper">
      <div className="admin-controls-card mb-4 p-4 bg-dark border border-secondary rounded">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="text-secondary small mb-1 uppercase">Modo de HP</label>
            <select className="form-select bg-dark text-white border-secondary" value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="low">Low HP</option>
              <option value="full">Full HP</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="text-secondary small mb-1 uppercase">Nivel Target</label>
            <input 
              type="number" 
              className="form-control bg-dark text-white border-secondary" 
              placeholder="Ej: 110" 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="text-secondary small mb-1 uppercase">Cargar de Existente (Opcional)</label>
            <select className="form-select bg-dark text-white border-secondary" onChange={(e) => loadBase(e.target.value)}>
              <option value="">-- Seleccionar Base --</option>
              {availableBases.map(b => (
                <option key={b} value={b}>Nivel {b}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-warning w-100 fw-bold" onClick={saveConfig} disabled={isSaving}>
              {isSaving ? "GUARDANDO..." : "GUARDAR CONFIGURACIÓN"}
            </button>
          </div>
        </div>
      </div>

      <div className="editor-tree-container" style={{ position: 'relative', zoom: 0.8 }}>
        <div className="alert alert-info py-2 small text-center mb-4">
          <i className="bi bi-info-circle me-2"></i>
          Haz clic en cualquier nodo para subir estrellas (0 a 5).
        </div>

        <section className="talent__tree">
          <div className="talent__rows__container">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className={`talent__row ${row.length === 1 ? "talent__row--single" : ""}`}>
                {row.map((id, colIndex) => {
                  const talent = talentsMap[id];
                  if (!talent) return null;

                  const stars = getStars(id);
                  const unlocked = stars > 0;
                  
                  return (
                    <div key={id} onClick={() => handleNodeClick(id)} style={{ cursor: 'pointer' }}>
                      <TalentNode
                        {...talent}
                        stars={stars}
                        unlocked={unlocked}
                        hasVerticalConnection={false} // Connectors are visual, simplified here
                        hasDiagonalLeft={false}
                        hasDiagonalRight={false}
                        showVerticalBar={false}
                        showDiagonalLeftBar={false}
                        showDiagonalRightBar={false}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
