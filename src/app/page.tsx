"use client";

import { useState } from "react";
import TalentTree from "@/components/TalentTree";
import ControlsBar from "@/components/ControlsBar";
import CalculatorModal from "@/components/CalculatorModal";
import ReportModal from "@/components/ReportModal";
import PrivacyModal from "@/components/PrivacyModal";
import TermsModal from "@/components/TermsModal";
import { useTalentCalculator } from "@/hooks/useTalentCalculator";
import { trackCalculation } from "@/components/StatsDisplay";
import StatsDisplay from "@/components/StatsDisplay";
import Image from "next/image";

export default function Home() {
  const {
    mode,
    setMode,
    currentConfig,
    reset,
    applyLevel,
    applyManual,
  } = useTalentCalculator();

  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
            <Image src="/assets/images/icons/gears.svg" alt="Settings" width={35} height={35} priority />
            <span>OP Retreat</span>
          </div>
        </div>
      </header>

      <div className="flex-grow-1 d-flex flex-column">
        <TalentTree currentConfig={currentConfig} />
        <ControlsBar 
          onReset={reset} 
          onOpenCalculator={() => setShowCalcModal(true)} 
          onOpenReport={() => setShowReportModal(true)}
        />
      </div>

      {/* Modals */}
      <CalculatorModal
        show={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        onApplyLevel={handleApplyLevel}
        onApplyManual={handleApplyManual}
        mode={mode}
        setMode={setMode}
      />

      <ReportModal 
        show={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />

      <PrivacyModal 
        show={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />

      <TermsModal 
        show={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />

      <footer className="footer-legal pt-3 pb-4">
        <div className="container">
          {/* Top Section: Credits (Left) and Links (Right) */}
          <div className="row align-items-center mb-4">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                OP Retreat Calculator © 2025 - 2026. <br /><br className="d-md-none" />
                Developed by <span className="text-warning fw-bold">Pl4yer810</span> & <span className="text-warning fw-bold">Miguel Amaya</span>
              </p>
            </div>
            <div className="col-md-6 d-flex justify-content-center justify-content-md-end gap-3">
              <button 
                onClick={() => setShowPrivacyModal(true)} 
                className="btn btn-link text-decoration-none text-secondary hover-white p-0 shadow-none"
              >
                Privacy
              </button>
              <span className="text-muted">|</span>
              <button 
                onClick={() => setShowTermsModal(true)} 
                className="btn btn-link text-decoration-none text-secondary hover-white p-0 shadow-none"
              >
                Terms
              </button>
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
