"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import styles from "./UpdateToast.module.css";

const VERSION_CHECK_INTERVAL_MS = 60_000;
const DISMISSED_VERSION_KEY = "op-update-dismissed-version-v1";

type UpdateToastProps = {
  buildVersion: string;
};

type VersionResponse = {
  version?: unknown;
};

function getDismissedVersion(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(DISMISSED_VERSION_KEY);
  } catch {
    return null;
  }
}

function dismissVersion(version: string): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(DISMISSED_VERSION_KEY, version);
  } catch {
    // The toast can still be closed for this render if storage is blocked.
  }
}

export default function UpdateToast({ buildVersion }: UpdateToastProps) {
  const { t } = useSettings();
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (!buildVersion || buildVersion === "development") return;

    let cancelled = false;

    const checkVersion = async () => {
      try {
        const response = await fetch("/api/version", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as VersionResponse;
        const nextVersion =
          typeof data.version === "string" ? data.version : null;

        if (
          cancelled ||
          !nextVersion ||
          nextVersion === "development" ||
          nextVersion === buildVersion ||
          nextVersion === getDismissedVersion()
        ) {
          return;
        }

        setAvailableVersion(nextVersion);
        setIsVisible(true);
      } catch {
        // Ignore temporary network errors and retry on the next check.
      }
    };

    void checkVersion();

    const intervalId = window.setInterval(() => {
      void checkVersion();
    }, VERSION_CHECK_INTERVAL_MS);

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };

    const checkWhenOnline = () => {
      void checkVersion();
    };

    document.addEventListener("visibilitychange", checkWhenVisible);
    window.addEventListener("online", checkWhenOnline);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.removeEventListener("online", checkWhenOnline);
    };
  }, [buildVersion]);

  const dismiss = () => {
    if (availableVersion) dismissVersion(availableVersion);
    setIsVisible(false);
  };

  const reloadPage = () => {
    setIsReloading(true);
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div
      className={styles.wrap}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={styles.toast}>
        <div className={styles.icon} aria-hidden>
          <Image
            src="/assets/images/icons/new.png"
            alt=""
            width={30}
            height={30}
          />
        </div>

        <div className={styles.content}>
          <span className={styles.badge}>{t("update.badge")}</span>
          <p className={styles.title}>{t("update.title")}</p>
          <p className={styles.body}>{t("update.body")}</p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.updateButton}
            onClick={reloadPage}
            disabled={isReloading}
          >
            {isReloading ? t("update.reloading") : t("update.button")}
          </button>
          <button
            type="button"
            className={styles.dismissButton}
            onClick={dismiss}
            disabled={isReloading}
          >
            {t("update.dismiss")}
          </button>
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={dismiss}
          aria-label={t("update.close")}
          disabled={isReloading}
        >
          <i className="bi bi-x-lg" aria-hidden />
        </button>
      </div>
    </div>
  );
}
