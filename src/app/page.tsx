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
    isLoading,
    isMaintenance,
    maintenanceMessage,
    configsLow,
    configsFull
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

  if (isMaintenance) {
    return (
      <main className="container-fluid p-0 min-vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-center px-4">
        <Image src="/assets/images/LoadUI.png" alt="Maintenance" width={400} height={200} className="mb-4 rounded-3 shadow-lg" style={{ objectFit: 'contain' }} />
        <h1 className="text-warning mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Modo Mantenimiento</h1>
        <p className="text-white fs-5 max-w-600">{maintenanceMessage}</p>
        <div className="mt-4 text-secondary small">Vuelve a visitarnos pronto.</div>
      </main>
    );
  }

  return (
    <main className="container-fluid p-0 min-vh-100 d-flex flex-column">
      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-dark" style={{ zIndex: 9999, opacity: 0.9 }}>
          <div className="spinner-border text-warning mb-3" role="status"></div>
          <span className="text-white">Cargando configuraciones...</span>
        </div>
      )}
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
        configsLow={configsLow}
        configsFull={configsFull}
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
          <div className="row align-items-center mb-4">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                OP Retreat Calculator © 2025 - 2026. <br /><br className="d-md-none" />
                Desarrollado por <a href="/team" className="text-warning fw-bold text-decoration-none hover-underline">el Equipo de OP Retreat</a>
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
