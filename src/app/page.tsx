"use client";

import { useState } from "react";
import TalentTree from "@/components/TalentTree";
import ControlsBar from "@/components/ControlsBar";
import CalculatorModal from "@/components/CalculatorModal";
import { useTalentCalculator } from "@/hooks/useTalentCalculator";
import { trackCalculation } from "@/components/StatsDisplay";
import StatsDisplay from "@/components/StatsDisplay";

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

  const handleApplyLevel = (lvl: number) => {
    applyLevel(lvl);
    trackCalculation();
  };

  const handleApplyManual = (p: number) => {
    applyManual(p);
    trackCalculation();
  };

  return (
    <main className="container-fluid p-0 min-vh-100 d-flex flex-column">
      <header className="app-navbar">
        <div className="app-navbar__container">
          <div className="app-navbar__logo">
            <img src="/assets/images/icons/gears.svg" alt="Settings" />
            <span>OP Retreat</span>
          </div>
        </div>
      </header>

      <div className="flex-grow-1" style={{ paddingTop: "80px" }}>
        <TalentTree currentConfig={currentConfig} />
        <ControlsBar onReset={reset} onOpenCalculator={() => setShowModal(true)} />
      </div>

      <CalculatorModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onApplyLevel={handleApplyLevel}
        onApplyManual={handleApplyManual}
        mode={mode}
        setMode={setMode}
      />

      <footer className="footer-legal pt-5 pb-4">
        <div className="container">
          {/* Top Section: Credits (Left) and Links (Right) */}
          <div className="row align-items-center mb-4">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                OP Retreat Calculator. <br /><br className="d-md-none" />
                Developed by <span className="text-warning fw-bold">Pl4yer810</span> & <span className="text-warning fw-bold">Miguel Amaya</span>
              </p>
            </div>
            <div className="col-md-6 d-flex justify-content-center justify-content-md-end gap-3">
              <a href="#" className="text-decoration-none text-secondary hover-white">Privacy</a>
              <span className="text-muted">|</span>
              <a href="#" className="text-decoration-none text-secondary hover-white">Terms</a>
            </div>
          </div>

          <div className="footer-divider mb-4"></div>

          {/* Bottom Section: Stats (Numbers) */}
          <div className="row">
            <div className="col-12 d-flex justify-content-center">
              <StatsDisplay />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
