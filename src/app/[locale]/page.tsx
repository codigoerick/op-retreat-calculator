"use client";

import { useState } from "react";
import CalculatorModal from "@/components/CalculatorModal";
import ControlsBar from "@/components/ControlsBar";
import ReportModal from "@/components/ReportModal";
import { TalentTree } from "@/components/talent-tree/TalentTree";
import { trackCalculation } from "@/components/StatsDisplay";
import { useTalentCalculator } from "@/hooks/useTalentCalculator";

export default function Home() {
  const {
    mode,
    setMode,
    currentConfig,
    availableLevels,
    applyLevel,
  } = useTalentCalculator();

  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleApplyLevel = (lvl: number) => {
    applyLevel(lvl);
    trackCalculation();
  };

  return (
    <>
      <section className="talent__tree">
        <div className="container">
          <TalentTree config={currentConfig} size="large" />
        </div>
      </section>
      <ControlsBar
        onOpenCalculator={() => setShowCalcModal(true)}
      />

      <CalculatorModal
        show={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        onApplyLevel={handleApplyLevel}
        mode={mode}
        setMode={setMode}
        availableLevels={availableLevels}
      />

      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
}
