"use client";

import { useSettings } from "@/context/SettingsContext";

interface ControlsBarProps {
  onReset?: () => void; // Keep optional for backward compatibility
  onOpenCalculator: () => void;
  onOpenReport?: () => void;
}

export default function ControlsBar({ onOpenCalculator }: ControlsBarProps) {
  const { language } = useSettings();

  return (
    <button
      className="floating-options-pill"
      onClick={onOpenCalculator}
      title={language === "es" ? "Mostrar opciones de configuración" : "Show configuration options"}
    >
      {/* @ts-ignore */}
      <ion-icon name="options-outline" style={{ fontSize: "1.25rem" }}></ion-icon>
      <span>{language === "es" ? "Opciones" : "Options"}</span>
    </button>
  );
}
