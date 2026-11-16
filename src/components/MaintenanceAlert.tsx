"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

// New key so every visitor sees the update once, even if they dismissed the
// previous maintenance notice in an older session.
const ALERT_STORAGE_KEY = "op_retreat_update_alert_seen_v1";

const MaintenanceAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { t } = useSettings();

  useEffect(() => {
    let shouldShow = true;
    try {
      shouldShow = !localStorage.getItem(ALERT_STORAGE_KEY);
    } catch {
      // If storage is blocked, show the notice once per page load.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVisible(shouldShow);
  }, []);

  const closeAlert = () => {
    try {
      localStorage.setItem(ALERT_STORAGE_KEY, "true");
    } catch {
      // localStorage can be blocked; closing the modal is still useful.
    }
    setIsVisible(false);
  };

  const isAdminRoute =
    pathname?.startsWith("/login") || pathname?.startsWith("/control-panel");
  const isInfoRoute = /^\/(en|es)\/info(?:\/|$)/.test(pathname || "");

  if (!isVisible || isAdminRoute || isInfoRoute) return null;

  return (
    <div
      className="maintenance-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-alert-title"
    >
      <div className="maintenance-card">
        <div className="maintenance-icon" aria-hidden>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
          </svg>
        </div>

        <div className="maintenance-content">
          <span className="maintenance-badge">{t("alert.badge")}</span>
          <h3 id="update-alert-title">{t("alert.title")}</h3>
          <p>{t("alert.body")}</p>
          <p className="maintenance-once">{t("alert.once")}</p>
          <button onClick={closeAlert} className="maintenance-button">
            {t("alert.button")}
          </button>
        </div>
      </div>

      <style jsx>{`
        .maintenance-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.4s ease-out;
        }

        .maintenance-card {
          background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transform: translateY(0);
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .maintenance-icon {
          color: #facc15;
          margin-bottom: 20px;
          display: inline-flex;
          padding: 15px;
          background: rgba(250, 204, 21, 0.1);
          border-radius: 50%;
        }

        .maintenance-content h3 {
          color: #fff;
          font-size: 1.5rem;
          margin-bottom: 12px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .maintenance-content p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .maintenance-badge {
          display: inline-block;
          margin-bottom: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(250, 204, 21, 0.35);
          background: rgba(250, 204, 21, 0.12);
          color: #facc15;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .maintenance-content p.maintenance-once {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.78rem;
          margin: -12px 0 20px;
        }

        .maintenance-button {
          background: #facc15;
          color: #000;
          border: none;
          padding: 12px 32px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .maintenance-button:hover {
          background: #eab308;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(234, 179, 8, 0.5);
        }

        .maintenance-button:active {
          transform: translateY(0);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceAlert;
