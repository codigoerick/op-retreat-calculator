"use client";

import { useState } from "react";

interface CalculatorModalProps {
  show: boolean;
  onClose: () => void;
  onApplyLevel: (lvl: number) => void;
  onApplyManual: (points: number) => void;
  mode: "low" | "full";
  setMode: (mode: "low" | "full") => void;
  configsLow: any;
  configsFull: any;
}

export default function CalculatorModal({
  show,
  onClose,
  onApplyLevel,
  onApplyManual,
  mode,
  setMode,
  configsLow,
  configsFull
}: CalculatorModalProps) {
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");

  const presets = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
  
  // Check if a specific level exists in DB for current mode
  const isAvailable = (lvl: number) => {
    const configs = mode === "low" ? configsLow : configsFull;
    return !!configs && !!configs[lvl.toString()];
  };

  const handleManualSubmit = () => {
    const val = parseInt(manualInput);
    if (isNaN(val) || val < 0 || val > 200) {
      setError("Por favor ingresa un valor entre 0 y 200.");
      return;
    }

    // Removed strict check for manual input to allow additive logic
    /*
    if (!isAvailable(val)) {
      setError(`La configuración para el nivel ${val} (${mode === 'low' ? 'Low HP' : 'Full HP'}) aún no ha sido cargada por el administrador.`);
      return;
    }
    */

    onApplyManual(val);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-custom bg-dark">
          <div className="modal-header border-0">
            <h5 className="modal-title w-100 text-center text-gold">Configuración de Talentos</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body text-center">
            
            {/* Section 1: Manual Calculation */}
            <div className="mb-4">
              <label className="form-label text-light small uppercase">Ingresa tus puntos actuales <br/>(0 - 200)</label>
              <div className="input-group justify-content-center">
                <input
                  type="number"
                  className="form-control manual-input"
                  style={{ width: "100px" }}
                  value={manualInput}
                  onChange={(e) => {
                    setManualInput(e.target.value);
                    setError("");
                  }}
                  placeholder="0-200"
                />
              </div>
              {error && <div className="text-danger small mt-2">{error}</div>}
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button className="modal-btn-calc" onClick={handleManualSubmit}>Calcular</button>
                <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
              </div>
            </div>

            <hr className="border-secondary my-4" />

            {/* Section 2: Mode Switcher */}
            <div className="mb-3">
              <div className="mode-switcher-container">
                <label className={`btn-mode ${mode === "low" ? "active" : ""}`} onClick={() => setMode("low")}>
                  <input type="radio" name="hpMode" value="low" checked={mode === "low"} readOnly />
                  <span>Low HP</span>
                </label>
                <label className={`btn-mode ${mode === "full" ? "active" : ""}`} onClick={() => setMode("full")}>
                  <input type="radio" name="hpMode" value="full" checked={mode === "full"} readOnly />
                  <span>Full HP</span>
                </label>
              </div>
            </div>

            {/* Section 3: Preset Buttons Grid */}
            <div className="preset-grid">
              {presets.map((lvl) => {
                const available = isAvailable(lvl);
                return (
                  <button
                    key={lvl}
                    className={`btn-preset ${available ? '' : 'btn-preset-disabled'}`}
                    onClick={() => {
                      if (available) {
                        onApplyLevel(lvl);
                        onClose();
                      } else {
                        alert(`La configuración para el nivel ${lvl} (${mode === 'low' ? 'Low HP' : 'Full HP'}) aún no está disponible.`);
                      }
                    }}
                  >
                    {lvl}
                  </button>
                );
              })}
              {/* Special case for 144 */}
              <button 
                className={`btn-preset ${isAvailable(144) ? '' : 'btn-preset-disabled'}`}
                onClick={() => {
                   if (isAvailable(144)) { onApplyLevel(144); onClose(); }
                   else { alert("Configuración nivel 144 no disponible."); }
                }}
              >
                144
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
