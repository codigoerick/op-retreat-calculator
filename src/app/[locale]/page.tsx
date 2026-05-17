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
import { useSettings } from "@/context/SettingsContext";

export default function Home() {
  const {
    mode,
    setMode,
    currentConfig,
    availableLevels,
    reset,
    applyLevel,
    applyManual,
  } = useTalentCalculator();

  const { theme, toggleTheme, language, setLanguage, t } = useSettings();

  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleApplyLevel = (lvl: number) => {
    applyLevel(lvl);
    trackCalculation();
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="container-fluid p-0 min-vh-100 d-flex flex-column">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Left Sidebar */}
      <aside className={`mobile-sidebar ${isSidebarOpen ? "active" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>{t("nav.title")}</span>
          </div>
          <button 
            className="btn-sidebar-close" 
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close Menu"
          >
            {/* @ts-ignore */}
            <ion-icon name="close-outline" style={{ fontSize: "1.8rem" }}></ion-icon>
          </button>
        </div>

        {/* Sidebar Footer (Language and Theme Toggles) */}
        <div className="sidebar-footer">
          <div className="sidebar-section-title">
            {/* @ts-ignore */}
            <ion-icon name="language-outline" style={{ fontSize: "1rem" }}></ion-icon>
            <span>{language === "es" ? "Idioma" : "Language"}</span>
          </div>
          <div className="sidebar-toggle-group">
            <button
              onClick={() => setLanguage("en")}
              className={`sidebar-toggle-btn ${language === "en" ? "active" : ""}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`sidebar-toggle-btn ${language === "es" ? "active" : ""}`}
            >
              Español
            </button>
          </div>

          <div className="sidebar-section-title mt-4">
            {/* @ts-ignore */}
            <ion-icon name="color-palette-outline" style={{ fontSize: "1rem" }}></ion-icon>
            <span>{language === "es" ? "Tema" : "Theme"}</span>
          </div>
          <div className="sidebar-toggle-group theme-toggles">
            <button
              onClick={toggleTheme}
              className="sidebar-toggle-btn active-theme-display"
            >
              {theme === "dark" ? (
                <>
                  {/* @ts-ignore */}
                  <ion-icon name="moon-outline" style={{ color: "#60a5fa" }}></ion-icon>
                  <span>{language === "es" ? "Oscuro" : "Dark"}</span>
                </>
              ) : theme === "sepia" ? (
                <>
                  {/* @ts-ignore */}
                  <ion-icon name="contrast-outline" style={{ color: "#f59e0b" }}></ion-icon>
                  <span>Sepia</span>
                </>
              ) : (
                <>
                  {/* @ts-ignore */}
                  <ion-icon name="aperture-outline" style={{ color: "#ef4444" }}></ion-icon>
                  <span>{language === "es" ? "Claro" : "Light"}</span>
                </>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="sidebar-toggle-btn action-cycle"
              title="Cycle Theme"
            >
              {/* @ts-ignore */}
              <ion-icon name="arrow-forward-outline"></ion-icon>
            </button>
          </div>
        </div>
      </aside>

      <header className="app-navbar-wrapper">
        <nav className="app-navbar">
          <div className="app-navbar__container">
            <div className="app-navbar__logo">
              <Image 
                src="/assets/images/icons/gears.svg" 
                alt="Settings" 
                width={35} 
                height={35} 
                priority 
                className="d-none d-md-inline"
                style={{ marginRight: "8px" }}
              />
              <span>{t("nav.title")}</span>
            </div>
            
            {/* Desktop Navigation Toggles */}
            <div className="app-navbar__actions d-none d-md-flex align-items-center gap-3">
              {/* Language Switcher */}
              <div className="language-toggle">
                {/* @ts-ignore */}
                <ion-icon name="language-outline" className="lang-icon" style={{ fontSize: "1.1rem", marginRight: "4px", color: "rgba(255, 255, 255, 0.5)" }}></ion-icon>
                <button
                  onClick={() => setLanguage("en")}
                  className={`btn-lang-pill ${language === "en" ? "active" : ""}`}
                >
                  EN
                </button>
                <span className="lang-separator">/</span>
                <button
                  onClick={() => setLanguage("es")}
                  className={`btn-lang-pill ${language === "es" ? "active" : ""}`}
                >
                  ES
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="btn-theme-toggle"
                aria-label="Toggle Theme"
                title={theme === "dark" ? "Dark Mode" : theme === "sepia" ? "Warm Sepia (Dim)" : "Light Mode"}
              >
                {theme === "dark" ? (
                  /* @ts-ignore */
                  <ion-icon name="moon-outline" style={{ fontSize: "1.25rem", color: "#60a5fa" }}></ion-icon>
                ) : theme === "sepia" ? (
                  /* @ts-ignore */
                  <ion-icon name="contrast-outline" style={{ fontSize: "1.25rem", color: "#f59e0b" }}></ion-icon>
                ) : (
                  /* @ts-ignore */
                  <ion-icon name="aperture-outline" style={{ fontSize: "1.25rem", color: "#ef4444" }}></ion-icon>
                )}
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="btn-hamburger d-md-none"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Toggle Menu"
            >
              {/* @ts-ignore */}
              <ion-icon name="menu-outline" style={{ fontSize: "1.85rem" }}></ion-icon>
            </button>
          </div>
        </nav>

      </header>

      <div className="flex-grow-1 d-flex flex-column">
        <TalentTree currentConfig={currentConfig} />
        <ControlsBar
          onOpenCalculator={() => setShowCalcModal(true)}
        />
      </div>

      {/* Modals */}
      <CalculatorModal
        show={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        onApplyLevel={handleApplyLevel}
        mode={mode}
        setMode={setMode}
        availableLevels={availableLevels}
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

      <footer className="footer-legal pt-4 pb-5 pb-md-4">
        <div className="container">
          <div className="row align-items-center py-2">
            {/* Left: Logo & Trademark */}
            <div className="col-md-6 d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-md-start gap-2 mb-3 mb-md-0 text-center text-sm-start">
              <div className="d-flex align-items-center gap-2">
                <Image src="/assets/images/icons/gears.svg" alt="OP Retreat" width={24} height={24} className="img-fluid" />
                <span className="text-white fw-bold" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>OP Retreat</span>
              </div>
              <span className="text-secondary" style={{ fontSize: "0.82rem" }}>{t("footer.rights")}</span>
            </div>

            {/* Right: Legal Links */}
            <div className="col-md-6 d-flex justify-content-center justify-content-md-end gap-3 gap-sm-4">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="btn btn-link text-decoration-none text-secondary hover-white p-0 shadow-none fw-semibold"
                style={{ fontSize: "0.85rem", transition: "color 0.2s" }}
              >
                {t("footer.privacy")}
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="btn btn-link text-decoration-none text-secondary hover-white p-0 shadow-none fw-semibold"
                style={{ fontSize: "0.85rem", transition: "color 0.2s" }}
              >
                {t("footer.terms")}
              </button>
            </div>
          </div>

          <div className="footer-divider my-3" style={{ opacity: 0.15 }}></div>

          {/* Bottom: Stats Counter */}
          <div className="row">
            <div className="col-12 d-flex justify-content-center pt-2">
              <StatsDisplay />
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll Navigation Arrows */}
      <div className="scroll-navigation-wrapper">
        <button
          onClick={scrollToTop}
          className="btn-scroll-nav"
          aria-label="Scroll to Top"
          title="Scroll to Top"
        >
          {/* @ts-ignore */}
          <ion-icon name="arrow-up-outline"></ion-icon>
        </button>
        <button
          onClick={scrollToBottom}
          className="btn-scroll-nav"
          aria-label="Scroll to Bottom"
          title="Scroll to Bottom"
        >
          {/* @ts-ignore */}
          <ion-icon name="arrow-down-outline"></ion-icon>
        </button>
      </div>
    </main>
  );
}
