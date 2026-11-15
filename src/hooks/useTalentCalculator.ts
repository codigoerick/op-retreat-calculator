import { useState, useEffect, useMemo } from "react";
import {
  STANDARD_LEVELS,
  hasTalentPoints,
  type TalentConfig,
  type TalentMode,
} from "@/data/talent-levels";

// Cache in memory to avoid repeated fetches during a session
const configCache: Record<string, Record<string, TalentConfig>> = { low: {}, full: {} };
const cacheLoaded: Record<string, boolean> = { low: false, full: false };

async function fetchConfigs(mode: TalentMode): Promise<Record<string, TalentConfig>> {
  if (cacheLoaded[mode]) return configCache[mode];
  try {
    const res = await fetch(`/api/talent-configs?mode=${mode}`);
    const data: { level: number; config: TalentConfig }[] = await res.json();
    const standardLevels = new Set(STANDARD_LEVELS);
    const map: Record<string, TalentConfig> = {};
    data.forEach((row) => {
      if (!standardLevels.has(row.level)) return;
      if (!hasTalentPoints(row.config)) return;
      map[row.level.toString()] = row.config;
    });
    configCache[mode] = map;
    cacheLoaded[mode] = true;
    return map;
  } catch {
    return {};
  }
}

function isStandardLevel(level: number): boolean {
  return STANDARD_LEVELS.includes(level);
}

export function useTalentCalculator() {
  const [mode, setMode] = useState<"low" | "full">("low");
  const [points, setPoints] = useState(0);
  const [configs, setConfigs] = useState<Record<string, TalentConfig>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch configs whenever mode changes
  useEffect(() => {
    setIsLoading(true);
    fetchConfigs(mode).then((data) => {
      setConfigs(data);
      setIsLoading(false);
    });
  }, [mode]);

  const currentConfig = useMemo<TalentConfig | null>(() => {
    if (points === 0) return null;

    // Exact match
    if (configs[points.toString()]) return configs[points.toString()];

    // A standard preset without a published config must stay empty instead of
    // falling back to a stale configuration from the previous update.
    if (isStandardLevel(points)) return null;

    // Manual values between presets can use the closest published level below.
    const levels = Object.keys(configs).map(Number).sort((a, b) => b - a);
    const closest = levels.find((l) => l <= points);
    return closest !== undefined ? configs[closest.toString()] : null;
  }, [points, configs]);

  const availableLevels = Object.keys(configs)
    .map(Number)
    .sort((a, b) => a - b);

  const reset = () => setPoints(0);
  const applyLevel = (lvl: number) => setPoints(lvl);
  const applyManual = (p: number) => setPoints(p);

  return {
    mode,
    setMode,
    points,
    currentConfig,
    isLoading,
    availableLevels,
    reset,
    applyLevel,
    applyManual,
  };
}
