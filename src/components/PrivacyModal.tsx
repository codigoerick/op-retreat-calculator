"use client";

interface PrivacyModalProps {
  show: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ show, onClose }: PrivacyModalProps) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-content-dark bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Privacy Policy</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>This site does not collect personal user data. We do not use databases to store browsing information.</p>
            <p><strong>Cookies:</strong> Essential technical cookies are used for calculator functionality and interface preferences.</p>
            <hr className="border-secondary" />
            <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.4 }}>
              <strong>Legal Notice:</strong> This website is a non-profit fan project.
              All visual content, talent icons (e.g., <em>Elite Player</em>, <em>Flesh Bargain</em>) and trademarks are the exclusive intellectual property of <strong>HABBY PTE. LTD.</strong>.
              This site is not affiliated with or endorsed by the game creators.
            </p>
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
