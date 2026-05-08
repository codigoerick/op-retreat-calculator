"use client";

import { useState } from "react";
import TalentTree from "@/components/TalentTree";
import ControlsBar from "@/components/ControlsBar";
import CalculatorModal from "@/components/CalculatorModal";
import { useTalentCalculator } from "@/hooks/useTalentCalculator";

export default function Home() {
  const {
    mode,
    setMode,
    currentConfig,
    reset,
    applyLevel,
    applyManual,
  } = useTalentCalculator();

  const [showModal, setShowModal] = useState(false);

  return (
    <main className="container-fluid p-0">
      <header className="app-navbar">
        <div className="app-navbar__container">
          <div className="app-navbar__logo">
            <img src="/assets/images/icons/gears.svg" alt="Settings" />
            <span>OP Retreat</span>
          </div>
        </div>
      </header>

      <TalentTree currentConfig={currentConfig} />

      <ControlsBar onReset={reset} onOpenCalculator={() => setShowModal(true)} />

      <CalculatorModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onApplyLevel={applyLevel}
        onApplyManual={applyManual}
        mode={mode}
        setMode={setMode}
      />

      <footer className="footer-legal py-4" style={{ backgroundColor: "#1a1a1a", color: "#888", fontSize: "0.85rem", borderTop: "1px solid #444" }}>
        <div className="container text-center">
          <p className="mb-3">
            OP Retreat Calculator. <br />Developed by
            <span className="text-warning"> Pl4yer810</span> & <span className="text-warning">Miguel Amaya</span>.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a href="#" className="text-decoration-none text-secondary hover-white">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="text-decoration-none text-secondary hover-white">Terms of Use</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
