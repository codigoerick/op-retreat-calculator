"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";

export default function SiteHeader() {
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const normalizedPath = (pathname || "").replace(/\/$/, "");
  const isInfoPage =
    normalizedPath === `/${language}/info` ||
    normalizedPath.startsWith(`/${language}/info/`);
  const isCalculatorPage = normalizedPath === `/${language}`;
  const homeHref = `/${language}`;
  const infoHref = `/${language}/info`;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    if (isSidebarOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen]);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside
        id="mobile-sidebar"
        className={`mobile-sidebar ${isSidebarOpen ? "active" : ""}`}
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
      >
        <div className="sidebar-header">
          <Link
            href={homeHref}
            className="sidebar-logo"
            onClick={closeSidebar}
          >
            {t("nav.title")}
          </Link>
          <button
            className="btn-sidebar-close"
            onClick={closeSidebar}
            aria-label={language === "es" ? "Cerrar menú" : "Close menu"}
          >
            {/* @ts-expect-error - ion-icon is a custom element */}
            <ion-icon name="close-outline" style={{ fontSize: "1.8rem" }}></ion-icon>
          </button>
        </div>

        <nav
          className="sidebar-nav"
          aria-label={language === "es" ? "Navegación principal" : "Main navigation"}
        >
          <Link
            href={homeHref}
            onClick={closeSidebar}
            className={`sidebar-link ${isCalculatorPage ? "sidebar-link--active" : ""}`}
            aria-current={isCalculatorPage ? "page" : undefined}
          >
            {/* @ts-expect-error - ion-icon is a custom element */}
            <ion-icon name="calculator-outline"></ion-icon>
            <span>{t("nav.calculator")}</span>
          </Link>
          <Link
            href={infoHref}
            onClick={closeSidebar}
            className={`sidebar-link ${isInfoPage ? "sidebar-link--active" : ""}`}
            aria-current={isInfoPage ? "page" : undefined}
          >
            {/* @ts-expect-error - ion-icon is a custom element */}
            <ion-icon name="book-outline"></ion-icon>
            <span>{t("nav.info")}</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-section-title">
            {/* @ts-expect-error - ion-icon is a custom element */}
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
            {/* @ts-expect-error - ion-icon is a custom element */}
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
                  {/* @ts-expect-error - ion-icon is a custom element */}
                  <ion-icon name="moon-outline" style={{ color: "#60a5fa" }}></ion-icon>
                  <span>{language === "es" ? "Oscuro" : "Dark"}</span>
                </>
              ) : theme === "sepia" ? (
                <>
                  {/* @ts-expect-error - ion-icon is a custom element */}
                  <ion-icon name="contrast-outline" style={{ color: "#f59e0b" }}></ion-icon>
                  <span>Sepia</span>
                </>
              ) : (
                <>
                  {/* @ts-expect-error - ion-icon is a custom element */}
                  <ion-icon name="aperture-outline" style={{ color: "#ef4444" }}></ion-icon>
                  <span>{language === "es" ? "Claro" : "Light"}</span>
                </>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="sidebar-toggle-btn action-cycle"
              aria-label={language === "es" ? "Cambiar tema" : "Cycle theme"}
              title={language === "es" ? "Cambiar tema" : "Cycle theme"}
            >
              {/* @ts-expect-error - ion-icon is a custom element */}
              <ion-icon name="arrow-forward-outline"></ion-icon>
            </button>
          </div>
        </div>
      </aside>

      <header className="app-navbar-wrapper">
        <nav
          className="app-navbar"
          aria-label={language === "es" ? "Navegación principal" : "Primary"}
        >
          <div className="app-navbar__container">
            <div className="app-navbar__brand-group">
              <Link href={homeHref} className="app-navbar__logo">
                <Image
                  src="/assets/images/icons/gears.svg"
                  alt=""
                  width={35}
                  height={35}
                  priority
                  className="d-none d-md-inline"
                  style={{ marginRight: "8px" }}
                />
                <span>{t("nav.title")}</span>
              </Link>

              <div className="app-navbar__nav d-none d-md-flex">
                <Link
                  href={homeHref}
                  className={`app-navbar__link ${isCalculatorPage ? "active" : ""}`}
                  aria-current={isCalculatorPage ? "page" : undefined}
                >
                  {t("nav.calculator")}
                </Link>
                <Link
                  href={infoHref}
                  className={`app-navbar__link ${isInfoPage ? "active" : ""}`}
                  aria-current={isInfoPage ? "page" : undefined}
                >
                  {t("nav.info")}
                </Link>
              </div>
            </div>

            <div className="app-navbar__actions d-none d-md-flex align-items-center gap-3">
              <div className="language-toggle">
                {/* @ts-expect-error - ion-icon is a custom element */}
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

              <button
                onClick={toggleTheme}
                className="btn-theme-toggle"
                aria-label={language === "es" ? "Cambiar tema" : "Toggle theme"}
                title={
                  theme === "dark"
                    ? language === "es"
                      ? "Modo oscuro"
                      : "Dark mode"
                    : theme === "sepia"
                      ? language === "es"
                        ? "Sepia cálido"
                        : "Warm sepia"
                      : language === "es"
                        ? "Modo claro"
                        : "Light mode"
                }
              >
                {theme === "dark" ? (
                  /* @ts-expect-error - ion-icon is a custom element */
                  <ion-icon name="moon-outline" style={{ fontSize: "1.25rem", color: "#60a5fa" }}></ion-icon>
                ) : theme === "sepia" ? (
                  /* @ts-expect-error - ion-icon is a custom element */
                  <ion-icon name="contrast-outline" style={{ fontSize: "1.25rem", color: "#f59e0b" }}></ion-icon>
                ) : (
                  /* @ts-expect-error - ion-icon is a custom element */
                  <ion-icon name="aperture-outline" style={{ fontSize: "1.25rem", color: "#ef4444" }}></ion-icon>
                )}
              </button>
            </div>

            <button
              className="btn-hamburger d-md-none"
              onClick={() => setIsSidebarOpen(true)}
              aria-label={language === "es" ? "Abrir menú" : "Open menu"}
              aria-expanded={isSidebarOpen}
              aria-controls="mobile-sidebar"
            >
              {/* @ts-expect-error - ion-icon is a custom element */}
              <ion-icon name="menu-outline" style={{ fontSize: "1.85rem" }}></ion-icon>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
