"use client";

import { useState } from "react";

interface CalculatorModalProps {
  show: boolean;
  onClose: () => void;
  onApplyLevel: (lvl: number) => void;
  onApplyManual: (points: number) => void;
  mode: "low" | "full";
  setMode: (mode: "low" | "full") => void;
}

export default function CalculatorModal({
  show,
  onClose,
  onApplyLevel,
  onApplyManual,
  mode,
  setMode,
}: CalculatorModalProps) {
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");

  const presets = [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
  const fullHpValid = [80, 120, 144, 190, 200];

  const handleManualSubmit = () => {
    const val = parseInt(manualInput);
    if (isNaN(val) || val < 80 || val > 200) {
      setError("Please enter a value between 80 and 200.");
      return;
    }
    if (mode === "full" && !fullHpValid.includes(val)) {
        setError(`For Full HP, only levels ${fullHpValid.join(", ")} are supported.`);
        return;
    }
    onApplyManual(val);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-custom bg-dark">
          <div className="modal-header border-0">
            <h5 className="modal-title w-100 text-center text-gold">Talent Configuration</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body text-center">
            
            {/* Section 1: Manual Calculation */}
            <div className="mb-4">
              <label className="form-label text-light">Please enter current points <br/>(80 - 200)</label>
              <div className="input-group justify-content-center">
                <input
                  type="number"
                  className="form-control manual-input"
                  style={{ width: "100px" }}
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="80-200"
                />
              </div>
              {error && <div className="error-message show shake">{error}</div>}
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button className="modal-btn-calc" onClick={handleManualSubmit}>Calculate</button>
                <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
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
              {presets.map((lvl) => (
                <button
                  key={lvl}
                  className="btn-preset"
                  disabled={mode === "full" && !fullHpValid.includes(lvl)}
                  onClick={() => {
                    onApplyLevel(lvl);
                    onClose();
                  }}
                >
                  {lvl}
                </button>
              ))}
              {mode === "full" && (
                <button className="btn-preset" onClick={() => { onApplyLevel(144); onClose(); }}>144</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
