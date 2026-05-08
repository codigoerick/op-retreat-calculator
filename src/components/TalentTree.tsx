import React from "react";
import TalentNode from "./TalentNode";
import talents from "@/data/talents.json";

interface TalentTreeProps {
  currentConfig: any;
}

export default function TalentTree({ currentConfig }: TalentTreeProps) {
  // Helper to get talent by ID
  const getTalent = (id: number) => talents.find((t) => t.id === id);

  // Group into rows
  const rows = [];
  for (let i = 21; i >= 0; i--) {
    rows.push([i * 3 + 1, i * 3 + 2, i * 3 + 3]);
  }
  rows.push([0]); // The final single node

  const isUnlocked = (id: number) => {
    if (!currentConfig) return false;
    return !!currentConfig[id.toString()] && currentConfig[id.toString()][0] > 0;
  };

  const getStars = (id: number) => {
    if (!currentConfig || !currentConfig[id.toString()]) return 0;
    return currentConfig[id.toString()][0];
  };

  return (
    <section className="talent__tree">
      <div className="container">
        <div className="talent__rows__container">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={`talent__row ${row.length === 1 ? "talent__row--single" : ""}`}>
              {row.map((id, colIndex) => {
                const talent = getTalent(id);
                if (!talent) return null;

                const unlocked = isUnlocked(id);
                
                // Connections logic
                let hasVertical = false;
                let hasDiagonalLeft = false;
                let hasDiagonalRight = false;
                let showVertical = false;
                let showDiagonalLeft = false;
                let showDiagonalRight = false;

                if (id === 0) {
                    // No downstream
                } else if (id >= 1 && id <= 3) {
                    // Row 2 connects to Row 1 (ID 0)
                    if (id === 2) {
                        hasVertical = true;
                        showVertical = unlocked && isUnlocked(0);
                    } else if (id === 1) {
                        hasDiagonalLeft = true;
                        showDiagonalLeft = unlocked && isUnlocked(0);
                    } else if (id === 3) {
                        hasDiagonalRight = true;
                        showDiagonalRight = unlocked && isUnlocked(0);
                    }
                } else {
                    // Standard vertical connection to id - 3
                    hasVertical = true;
                    showVertical = unlocked && isUnlocked(id - 3);
                }

                return (
                  <React.Fragment key={id}>
                    <TalentNode
                      {...talent}
                      stars={getStars(id)}
                      unlocked={unlocked}
                      hasVerticalConnection={hasVertical}
                      hasDiagonalLeft={hasDiagonalLeft}
                      hasDiagonalRight={hasDiagonalRight}
                      showVerticalBar={showVertical}
                      showDiagonalLeftBar={showDiagonalLeft}
                      showDiagonalRightBar={showDiagonalRight}
                    />
                    {colIndex < row.length - 1 && (
                      <div className="connection__horizontal__bg">
                        <div
                          className="connection__horizontal__bar"
                          style={{
                            display: unlocked && isUnlocked(row[colIndex + 1]) ? "block" : "none",
                          }}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
