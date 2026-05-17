"use client";

import { useState, useEffect } from "react";
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
  const [currentSection, setCurrentSection] = useState<'calculator' | 'faq' | 'exchange' | 'guides'>('calculator');
  const [faqData, setFaqData] = useState<{id: string, order: number, question_es: string, answer_es: string, question_en: string, answer_en: string}[]>([]);

  // Load FAQ from API
  useEffect(() => {
    fetch('/api/save-faq')
      .then(res => res.json())
      .then(data => setFaqData(data.faqs || []))
      .catch(err => console.error("Error loading FAQs:", err));
  }, []);

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

        <nav className="sidebar-nav" style={{display:'flex', flexDirection:'column', padding:'20px 0'}}>
          <a href="#" className={`sidebar-link ${currentSection === 'calculator' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('calculator'); setIsSidebarOpen(false); }}>
            {/* @ts-ignore */}
            <ion-icon name="calculator-outline"></ion-icon> <span>Calculadora</span>
          </a>
          <a href="#" className={`sidebar-link ${currentSection === 'faq' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('faq'); setIsSidebarOpen(false); }}>
            {/* @ts-ignore */}
            <ion-icon name="help-circle-outline"></ion-icon> <span>FAQ</span>
          </a>
          <a href="#" className={`sidebar-link ${currentSection === 'exchange' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('exchange'); setIsSidebarOpen(false); }}>
            {/* @ts-ignore */}
            <ion-icon name="swap-horizontal-outline"></ion-icon> <span>Tienda (WIP)</span>
          </a>
          <a href="#" className={`sidebar-link ${currentSection === 'guides' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('guides'); setIsSidebarOpen(false); }}>
            {/* @ts-ignore */}
            <ion-icon name="book-outline"></ion-icon> <span>Guías (WIP)</span>
          </a>
        </nav>

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

        {/* Subnavbar - Desktop Only */}
        <nav className="app-subnavbar d-none d-md-block">
          <div className="app-subnavbar__container" style={{display:'flex', gap:'30px', padding:'0 24px'}}>
            <a href="#" className={`subnav-link ${currentSection === 'calculator' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('calculator'); }} style={{padding:'12px 0', fontWeight: currentSection === 'calculator' ? 'bold' : 'normal', color: currentSection === 'calculator' ? '#3ecf8e' : '#8a8a8a', borderBottom: currentSection === 'calculator' ? '2px solid #3ecf8e' : 'none', textDecoration:'none'}}>
              Calculadora
            </a>
            <a href="#" className={`subnav-link ${currentSection === 'faq' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('faq'); }} style={{padding:'12px 0', fontWeight: currentSection === 'faq' ? 'bold' : 'normal', color: currentSection === 'faq' ? '#3ecf8e' : '#8a8a8a', borderBottom: currentSection === 'faq' ? '2px solid #3ecf8e' : 'none', textDecoration:'none'}}>
              FAQ
            </a>
            <a href="#" className={`subnav-link ${currentSection === 'exchange' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('exchange'); }} style={{padding:'12px 0', fontWeight: currentSection === 'exchange' ? 'bold' : 'normal', color: currentSection === 'exchange' ? '#3ecf8e' : '#8a8a8a', borderBottom: currentSection === 'exchange' ? '2px solid #3ecf8e' : 'none', textDecoration:'none'}}>
              Tienda
            </a>
            <a href="#" className={`subnav-link ${currentSection === 'guides' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setCurrentSection('guides'); }} style={{padding:'12px 0', fontWeight: currentSection === 'guides' ? 'bold' : 'normal', color: currentSection === 'guides' ? '#3ecf8e' : '#8a8a8a', borderBottom: currentSection === 'guides' ? '2px solid #3ecf8e' : 'none', textDecoration:'none'}}>
              Guías
            </a>
          </div>
        </nav>

      </header>

      <div className="flex-grow-1 d-flex flex-column" style={{position:'relative', zIndex:1}}>
        {currentSection === 'calculator' && (
          <>
            <TalentTree currentConfig={currentConfig} />
            <ControlsBar onOpenCalculator={() => setShowCalcModal(true)} />
          </>
        )}

        {currentSection === 'faq' && (
          <div className="container py-5" style={{maxWidth:'800px', margin:'0 auto'}}>
            <h2 className="text-center mb-5 fw-bold" style={{color:'var(--color-primary)'}}>
              {language === 'es' ? 'Preguntas Frecuentes (FAQ)' : 'Frequently Asked Questions (FAQ)'}
            </h2>
            <div className="accordion" id="faqAccordion">
              {faqData.sort((a,b) => a.order - b.order).map((faq, idx) => {
                // Determine if this FAQ is currently open based on URL hash or just use a local state. 
                // Since we can't easily add a new useState hook at the top level without replacing the whole component,
                // we'll use a trick: store the open state in the component's dataset or just use a small inline component wrapper if needed.
                // Wait, it's a map. I can't declare state inside a map.
                // But I can create a custom component right inside the file!
                return <FaqAccordionItem key={faq.id} faq={faq} language={language} />;
              })}
              {faqData.length === 0 && (
                <div className="text-center p-5 text-muted">
                  Cargando / Loading FAQs...
                </div>
              )}
            </div>
          </div>
        )}

        {currentSection === 'exchange' && (
          <div className="container py-5 text-center" style={{maxWidth:'800px', margin:'0 auto'}}>
            <h2 className="fw-bold mb-4" style={{color:'var(--color-primary)'}}>
              {language === 'es' ? 'Tienda de Retiro (Próximamente)' : 'Retreat Exchange (Coming Soon)'}
            </h2>
            <p className="text-muted">
              {language === 'es' 
                ? 'Esta sección mostrará los objetos temporales que puedes comprar con tus Monedas de Retiro.' 
                : 'This section will show the temporary items you can buy with your Retreat Coins.'}
            </p>
          </div>
        )}

        {currentSection === 'guides' && (
          <div className="container py-5 text-center" style={{maxWidth:'800px', margin:'0 auto'}}>
            <h2 className="fw-bold mb-4" style={{color:'var(--color-primary)'}}>
              {language === 'es' ? 'Guías y Tips (Próximamente)' : 'Guides & Tips (Coming Soon)'}
            </h2>
            <p className="text-muted">
              {language === 'es' 
                ? 'Aprende las mejores estrategias para sobrevivir más tiempo y asegurar tu botín.' 
                : 'Learn the best strategies to survive longer and secure your loot.'}
            </p>
          </div>
        )}
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

function FaqAccordionItem({ faq, language }: { faq: any, language: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item" style={{background:'var(--color-bg-light)', border:'1px solid var(--color-border)', marginBottom:'16px', borderRadius:'12px', overflow:'hidden'}}>
      <h2 className="accordion-header">
        <button 
          className={`accordion-button ${isOpen ? '' : 'collapsed'}`}
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          style={{background:'transparent', color:'var(--color-text-main)', fontWeight:'600', boxShadow:'none', padding:'20px'}}
        >
          {language === 'es' ? faq.question_es : faq.question_en}
        </button>
      </h2>
      <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}>
        <div 
          className="accordion-body faq-content-html" 
          style={{color:'var(--color-text-muted)', borderTop:'1px solid var(--color-border)', padding:'20px', whiteSpace:'normal'}}
          dangerouslySetInnerHTML={{ __html: language === 'es' ? faq.answer_es : faq.answer_en }}
        />
      </div>
    </div>
  );
}
