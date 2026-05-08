"use client";

interface ControlsBarProps {
  onReset: () => void;
  onOpenCalculator: () => void;
  onOpenReport: () => void;
}

export default function ControlsBar({ onReset, onOpenCalculator, onOpenReport }: ControlsBarProps) {
  return (
    <div className="controls-bar">
      <div className="controls-grid">
        <button className="modal-btn-cancel" id="btn-reset" onClick={onReset}>
          Reset
        </button>
        <button className="modal-btn-calc" onClick={onOpenCalculator}>
          Calculate
        </button>
        <button className="btn-bug-report" title="Report a Bug" onClick={onOpenReport}>
          <i className="bi bi-bug-fill"></i>
        </button>
      </div>
    </div>
  );
}
