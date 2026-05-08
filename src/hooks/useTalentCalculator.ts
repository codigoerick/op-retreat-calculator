"use client";

import { useState, useMemo } from "react";
import talentsData from "@/data/talents.json";
import talentsConfigLow from "@/data/talents_config.json";
import talentsConfigFull from "@/data/talents_config_full.json";
import diffSequences from "@/data/diff_sequences.json";

interface Talent {
  id: number;
  name: string;
  icon: string;
  bgClass: string;
}

interface Config {
  [key: string]: number[];
}

export function useTalentCalculator() {
  const [points, setPoints] = useState<number>(0);
  const [mode, setMode] = useState<"low" | "full">("low");
  const [manualPoints, setManualPoints] = useState<number | null>(null);

  const currentConfig = useMemo(() => {
    const configs: any = mode === "low" ? talentsConfigLow : talentsConfigFull;
    
    // If it's an exact level (80, 90, etc.)
    if (manualPoints === null) {
        if (points === 0) return null;
        return configs[points.toString()];
    }

    // Manual Calculation logic
    const p = manualPoints;
    if (configs[p.toString()]) return configs[p.toString()];

    const baseLevel = Math.floor(p / 10) * 10;
    const baseConfig = configs[baseLevel.toString()];
    if (!baseConfig) return configs["80"]; // Fallback

    const newConfig = JSON.parse(JSON.stringify(baseConfig));
    const pointsToAdd = p - baseLevel;
    const sequence = (diffSequences as any)[baseLevel.toString()];

    if (sequence) {
      for (let i = 0; i < pointsToAdd; i++) {
        if (i < sequence.length) {
          const talentId = sequence[i];
          if (!newConfig[talentId]) newConfig[talentId] = [0];
          newConfig[talentId][0]++;
        }
      }
    }
    return newConfig;
  }, [points, mode, manualPoints]);

  const reset = () => {
    setPoints(0);
    setManualPoints(null);
  };

  const applyLevel = (lvl: number) => {
    setPoints(lvl);
    setManualPoints(null);
  };

  const applyManual = (p: number) => {
    setManualPoints(p);
    setPoints(p);
  };

  return {
    points,
    mode,
    setMode,
    currentConfig,
    reset,
    applyLevel,
    applyManual,
  };
}
