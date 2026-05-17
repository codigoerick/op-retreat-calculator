"use client";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";

interface CalculatorModalProps {
  show: boolean;
  onClose: () => void;
  onApplyLevel: (lvl: number) => void;
  mode: "low" | "full";
  setMode: (mode: "low" | "full") => void;
  availableLevels: number[];
}

const NEW_PLAYER_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80];
const VETERAN_LEVELS = [90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

export default function CalculatorModal({
  show,
  onClose,
  onApplyLevel,
  mode,
  setMode,
  availableLevels,
}: CalculatorModalProps) {
  const { t } = useSettings();

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-custom bg-dark">
          <div className="modal-header border-0">
            <h5 className="modal-title w-100 text-center text-gold">{t("modal.title")}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body text-center">
 
            {/* Mode Switcher */}
            <div className="mb-4">
              <div className="mode-switcher-container">
                <label className={`btn-mode ${mode === "low" ? "active" : ""}`} onClick={() => setMode("low")}>
                  <input type="radio" name="hpMode" value="low" checked={mode === "low"} readOnly />
                  <span>{t("modal.mode.low")}</span>
                </label>
                <label className={`btn-mode ${mode === "full" ? "active" : ""}`} onClick={() => setMode("full")}>
                  <input type="radio" name="hpMode" value="full" checked={mode === "full"} readOnly />
                  <span>{t("modal.mode.full")}</span>
                </label>
              </div>
            </div>

            <hr className="border-secondary my-3" />

            {/* New Players Section */}
            <div className="mb-3">
              <p className="text-muted mb-2" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {t("modal.section.new")}
              </p>
              <div className="preset-grid">
                {NEW_PLAYER_LEVELS.map((lvl) => {
                  const isAvailable = availableLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      className="btn-preset"
                      disabled={!isAvailable}
                      onClick={() => { onApplyLevel(lvl); onClose(); }}
                      title={!isAvailable ? t("modal.preset.not_available") : undefined}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
              {availableLevels.length === 0 && (
                <p style={{ fontSize: "0.72rem", color: "#555", marginTop: "8px" }}>{t("modal.preset.coming_soon")}</p>
              )}
            </div>

            <hr className="border-secondary my-3" />

            {/* Veterans Section */}
            <div className="mb-4">
              <p className="text-muted mb-2" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {t("modal.section.veterans")}
              </p>
              <div className="preset-grid">
                {VETERAN_LEVELS.map((lvl) => {
                  const isAvailable = availableLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      className="btn-preset"
                      disabled={!isAvailable}
                      onClick={() => { onApplyLevel(lvl); onClose(); }}
                      title={!isAvailable ? t("modal.preset.not_available") : undefined}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="d-flex justify-content-center mt-4 mb-2">
              <button className="modal-btn-cancel px-4" onClick={onClose}>{t("modal.btn.cancel")}</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
