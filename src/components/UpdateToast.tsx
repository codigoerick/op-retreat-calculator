"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import styles from "./UpdateToast.module.css";

const VERSION_CHECK_INTERVAL_MS = 60_000;

type UpdateToastProps = {
  buildVersion: string;
};

type VersionResponse = {
  version?: unknown;
};

export default function UpdateToast({ buildVersion }: UpdateToastProps) {
  const { t } = useSettings();
  const [hasUpdate, setHasUpdate] = useState(false);
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
          nextVersion === buildVersion
        ) {
          return;
        }

        setHasUpdate(true);
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

  const reloadPage = () => {
    setIsReloading(true);
    window.location.reload();
  };

  if (!hasUpdate) return null;

  return (
    <div
      className={styles.wrap}
      role="alert"
      aria-live="assertive"
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
        </div>
      </div>
    </div>
  );
}
