"use client";

interface ControlsBarProps {
  onReset: () => void;
  onOpenCalculator: () => void;
}

export default function ControlsBar({ onReset, onOpenCalculator }: ControlsBarProps) {
  return (
    <div className="controls-bar">
      <div className="controls-grid">
        <button className="modal-btn-cancel" id="btn-reset" onClick={onReset}>
          Reset
        </button>
        <button className="modal-btn-calc" onClick={onOpenCalculator}>
          Calculate
        </button>
        <button className="btn-bug-report" title="Report a Bug">
          <i className="bi bi-bug-fill"></i>
        </button>
      </div>
    </div>
  );
}
