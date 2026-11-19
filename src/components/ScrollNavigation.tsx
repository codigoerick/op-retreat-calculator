"use client";

import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

export default function ScrollNavigation() {
  const { language } = useSettings();
  const pathname = usePathname();
  const isSpanish = language === "es";
  const isContentPage = /^\/(en|es)\/(?:info|exchange)(?:\/|$)/.test(
    pathname || ""
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`scroll-navigation-wrapper ${
        isContentPage ? "scroll-navigation-wrapper--content" : ""
      }`}
    >
      <button
        onClick={scrollToTop}
        className="btn-scroll-nav btn-scroll-nav--top"
        aria-label={isSpanish ? "Ir arriba" : "Scroll to top"}
        title={isSpanish ? "Ir arriba" : "Scroll to top"}
      >
        {/* @ts-expect-error - ion-icon is a custom element */}
        <ion-icon name="arrow-up-outline"></ion-icon>
      </button>
      <button
        onClick={scrollToBottom}
        className="btn-scroll-nav btn-scroll-nav--bottom"
        aria-label={isSpanish ? "Ir abajo" : "Scroll to bottom"}
        title={isSpanish ? "Ir abajo" : "Scroll to bottom"}
      >
        {/* @ts-expect-error - ion-icon is a custom element */}
        <ion-icon name="arrow-down-outline"></ion-icon>
      </button>
    </div>
  );
}
