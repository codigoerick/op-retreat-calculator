"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSettings } from "@/context/SettingsContext";

const RELEASE_SEEN_STORAGE_KEY = "op-release-notice-seen-v1";

type ReleaseNoticeProps = {
  buildVersion: string;
};

export default function ReleaseNotice({ buildVersion }: ReleaseNoticeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { language, t } = useSettings();

  useEffect(() => {
    if (!buildVersion) return;

    let shouldShow = true;
    try {
      shouldShow =
        localStorage.getItem(RELEASE_SEEN_STORAGE_KEY) !== buildVersion;
    } catch {
      // If storage is blocked, show the notice on each page load.
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(shouldShow);
  }, [buildVersion]);

  useEffect(() => {
    if (!buildVersion) return;

    const syncAcrossTabs = (event: StorageEvent) => {
      if (
        event.key === RELEASE_SEEN_STORAGE_KEY &&
        event.newValue === buildVersion
      ) {
        setIsVisible(false);
      }
    };

    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, [buildVersion]);

  const markSeen = () => {
    try {
      localStorage.setItem(RELEASE_SEEN_STORAGE_KEY, buildVersion);
    } catch {
      // Closing the notice for this render still works.
    }
    setIsVisible(false);
  };

  const isAdminRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/control-panel") ||
    pathname?.startsWith("/auth");

  if (!isVisible || isAdminRoute) return null;

  const isExchangePage =
    pathname === `/${language}/exchange` ||
    pathname?.startsWith(`/${language}/exchange/`);
  const primaryHref = isExchangePage
    ? `/${language}/info`
    : `/${language}/exchange`;
  const primaryLabel = isExchangePage
    ? t("release.info")
    : t("release.exchange");

  return (
    <div
      className="release-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="release-title"
    >
      <div className="release-card">
        <div className="release-icon" aria-hidden>
          <Image
            src="/assets/images/icons/new.png"
            alt=""
            width={40}
            height={40}
          />
        </div>

        <div className="release-content">
          <span className="release-badge">{t("release.badge")}</span>
          <h3 id="release-title">{t("release.title")}</h3>
          <p>{t("release.body")}</p>

          <div className="release-actions">
            <Link
              href={primaryHref}
              className="release-primary"
              onClick={markSeen}
            >
              {primaryLabel}
            </Link>
            <button
              type="button"
              className="release-secondary"
              onClick={markSeen}
            >
              {t("release.dismiss")}
            </button>
          </div>

          <p className="release-once">{t("release.once")}</p>
        </div>
      </div>

      <style jsx>{`
        .release-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          animation: release-fade-in 0.4s ease-out;
        }

        .release-card {
          width: min(520px, 100%);
          max-height: calc(100vh - 32px);
          overflow-y: auto;
          padding: 36px 32px 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
          animation: release-slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .release-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          margin-bottom: 18px;
          border-radius: 50%;
          background: rgba(237, 135, 60, 0.12);
          color: #ed873c;
        }

        .release-icon :global(img) {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .release-content h3 {
          margin: 0 0 12px;
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .release-content p {
          margin: 0 0 22px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .release-badge {
          display: inline-block;
          margin-bottom: 12px;
          padding: 4px 10px;
          border: 1px solid rgba(237, 135, 60, 0.35);
          border-radius: 999px;
          background: rgba(237, 135, 60, 0.12);
          color: #ed873c;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .release-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .release-actions :global(.release-primary),
        .release-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 12px 20px;
          border-radius: 12px;
          font: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease;
        }

        .release-actions :global(.release-primary) {
          flex: 1 1 auto;
          border: 1px solid transparent;
          background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
          color: #ffffff;
        }

        .release-actions :global(.release-primary:hover) {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px -12px rgba(237, 135, 60, 0.9);
        }

        .release-secondary {
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: transparent;
          color: rgba(255, 255, 255, 0.82);
        }

        .release-secondary:hover {
          border-color: rgba(255, 255, 255, 0.34);
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }

        .release-actions :global(.release-primary:active),
        .release-secondary:active {
          transform: translateY(0);
        }

        .release-content p.release-once {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.78rem;
        }

        .release-actions :global(.release-primary:focus-visible),
        .release-secondary:focus-visible {
          outline: 2px solid #ed873c;
          outline-offset: 2px;
        }

        @keyframes release-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes release-slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 520px) {
          .release-card {
            padding: 28px 20px 22px;
          }

          .release-content h3 {
            font-size: 1.28rem;
          }

          .release-actions {
            flex-direction: column;
          }

          .release-actions :global(.release-primary),
          .release-secondary {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .release-overlay,
          .release-card {
            animation: none;
          }

          .release-actions :global(.release-primary),
          .release-secondary {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
