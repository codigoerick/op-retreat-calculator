"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import PrivacyModal from "@/components/PrivacyModal";
import StatsDisplay from "@/components/StatsDisplay";
import TermsModal from "@/components/TermsModal";
import { useSettings } from "@/context/SettingsContext";

export default function SiteFooter() {
  const { language, t } = useSettings();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <>
      <footer className="footer-legal pt-4 pb-5 pb-md-4">
        <div className="container">
          <div className="row align-items-center py-2">
            <div className="col-md-6 d-flex flex-column flex-sm-row align-items-center justify-content-center justify-content-md-start gap-2 mb-3 mb-md-0 text-center text-sm-start">
              <div className="d-flex align-items-center gap-2">
                <Image
                  src="/assets/images/icons/gears.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="img-fluid"
                />
                <span
                  className="footer-legal-brand fw-bold"
                  style={{ fontSize: "1rem", letterSpacing: "0.5px" }}
                >
                  OP Retreat
                </span>
              </div>
              <span className="footer-legal-muted" style={{ fontSize: "0.82rem" }}>
                {t("footer.rights")}
              </span>
            </div>

            <div className="col-md-6 d-flex flex-wrap justify-content-center justify-content-md-end gap-3 gap-sm-4">
              <Link
                href={`/${language}/info`}
                className="btn btn-link text-decoration-none footer-legal-link p-0 shadow-none fw-semibold"
                style={{ fontSize: "0.85rem", transition: "color 0.2s" }}
              >
                {t("nav.info")}
              </Link>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="btn btn-link text-decoration-none footer-legal-link p-0 shadow-none fw-semibold"
                style={{ fontSize: "0.85rem", transition: "color 0.2s" }}
              >
                {t("footer.privacy")}
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="btn btn-link text-decoration-none footer-legal-link p-0 shadow-none fw-semibold"
                style={{ fontSize: "0.85rem", transition: "color 0.2s" }}
              >
                {t("footer.terms")}
              </button>
            </div>
          </div>

          <div className="footer-divider my-3" style={{ opacity: 0.15 }}></div>

          <div className="row">
            <div className="col-12 d-flex justify-content-center pt-2">
              <StatsDisplay />
            </div>
          </div>
        </div>
      </footer>

      <PrivacyModal
        show={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <TermsModal
        show={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </>
  );
}
