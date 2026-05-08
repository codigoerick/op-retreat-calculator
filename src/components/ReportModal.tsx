"use client";

import { useEffect, useState } from "react";

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ReportModal({ show, onClose }: ReportModalProps) {
  const [userAgent, setUserAgent] = useState("");
  const [screenRes, setScreenRes] = useState("");
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (show) {
      setUserAgent(navigator.userAgent);
      setScreenRes(`${window.screen.width}x${window.screen.height}`);
      setPageUrl(window.location.href);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-custom bg-dark">
          <form action="https://formspree.io/f/mykkkokk" method="POST">
            <div className="modal-header border-0">
              <h5 className="modal-title w-100 text-center text-gold">
                <i className="bi bi-bug-fill me-2"></i> Report Bug
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body text-center">
              <div className="mb-3">
                <label htmlFor="report-name" className="form-label text-light">
                  Your Name or Alias <small className="text-muted">(Optional)</small>
                </label>
                <input
                  type="text"
                  name="name"
                  id="report-name"
                  className="form-control manual-input"
                  style={{ width: "80%", margin: "0 auto" }}
                  placeholder="e.g. Player123"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="report-message" className="form-label text-light">
                  What happened? <span className="text-danger">*</span>
                </label>
                <textarea
                  name="message"
                  id="report-message"
                  className="form-control manual-input"
                  rows={5}
                  required
                  placeholder="Describe the error in detail..."
                  style={{ resize: "vertical", textAlign: "left" }}
                ></textarea>
              </div>
              {/* Hidden fields for additional context */}
              <input type="hidden" name="_subject" value="Bug Report from OP Retreat Calculator" />
              <input type="hidden" name="user_agent" value={userAgent} />
              <input type="hidden" name="screen_resolution" value={screenRes} />
              <input type="hidden" name="page_url" value={pageUrl} />
              <p className="text-white mb-0" style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                <small>📊 Technical data (browser, screen resolution) will be included to help resolve the issue.</small>
              </p>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <button type="submit" className="modal-btn-calc">Send Report</button>
                <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
