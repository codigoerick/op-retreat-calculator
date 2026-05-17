"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/data/translations";
import { useParams, usePathname, useRouter } from "next/navigation";

type Theme = "dark" | "sepia" | "light";
type Language = "en" | "es";

interface SettingsContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const applyThemeClass = (themeName: Theme) => {
  if (typeof document === "undefined") return;
  document.body.classList.remove("light-theme", "sepia-theme");
  if (themeName === "light") {
    document.body.classList.add("light-theme");
  } else if (themeName === "sepia") {
    document.body.classList.add("sepia-theme");
  }
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  // Extract the language parameter from the active URL path segment
  const urlLocale = params?.locale as Language;

  const [theme, setTheme] = useState<Theme>("dark");
  
  // Set active language state directly matching the dynamic URL locale (or fallback to 'en')
  const [language, setLanguage] = useState<Language>(() => {
    if (urlLocale === "es" || urlLocale === "en") return urlLocale;
    return "en";
  });

  const [mounted, setMounted] = useState(false);

  // Synchronize state if URL changes (like direct typing or Back/Forward browser actions)
  useEffect(() => {
    if (urlLocale === "en" || urlLocale === "es") {
      setLanguage(urlLocale);
    }
  }, [urlLocale]);

  useEffect(() => {
    // Read theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLang = localStorage.getItem("language") as Language;

    if (savedTheme) {
      setTheme(savedTheme);
      applyThemeClass(savedTheme);
    } else {
      // Default to dark theme
      applyThemeClass("dark");
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    let nextTheme: Theme = "dark";
    if (theme === "dark") {
      nextTheme = "sepia";
    } else if (theme === "sepia") {
      nextTheme = "light";
    } else {
      nextTheme = "dark";
    }
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyThemeClass(nextTheme);
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);

    // Redirect cleanly to the corresponding locale subpath in the URL
    if (pathname) {
      const segments = pathname.split("/");
      // E.g., pathname starts with /en or /es, e.g. ["", "en", "admin"]
      if (segments[1] === "en" || segments[1] === "es") {
        segments[1] = lang;
      } else {
        segments.splice(1, 0, lang);
      }
      const newPath = segments.join("/");
      router.push(newPath);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage: changeLanguage,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
