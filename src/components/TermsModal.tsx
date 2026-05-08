"use client";

interface TermsModalProps {
  show: boolean;
  onClose: () => void;
}

export default function TermsModal({ show, onClose }: TermsModalProps) {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.85)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content modal-content-dark bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-warning">Terms of Use & Intellectual Property</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body" style={{ fontSize: "0.9rem", color: "#ccc" }}>
            <p>By using this website, you agree to the following terms:</p>

            <h6 className="text-white">1. Intellectual Property</h6>
            <p>All art, item icons, character names, skills, and logos shown on this site are the exclusive property of <strong>HABBY PTE. LTD.</strong>. This site claims no rights over such content.</p>

            <h6 className="text-white">2. Project Nature</h6>
            <p>This is a personal, free, non-profit project created to help the game community with calculation tools and guides. There is no commercial relationship with the official developers.</p>

            <h6 className="text-white">3. Information Usage</h6>
            <p>The information and calculations provided are for informational and entertainment purposes. Use of this tool is at the user's own risk.</p>

            <h6 className="text-white">4. Content Removal (Take-down policy)</h6>
            <p>If you are a legal representative of the developer and believe this site infringes on any policy, please contact us. We are willing to make changes or shut down the site immediately upon request.</p>

            <h6 className="text-white">5. Fair Use</h6>
            <p>The use of graphic assets on this site is made under the 'Fair Use' doctrine for educational, critical, and research purposes, providing an analytical tool that does not replace the original game experience.</p>

            <h6 className="text-white">6. Data Accuracy</h6>
            <p>While we strive to keep the calculator updated with official game values, we are not responsible for discrepancies caused by recent server updates, patches, or undocumented hidden attributes.</p>
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
