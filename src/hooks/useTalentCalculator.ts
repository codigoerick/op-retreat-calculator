import { useState, useEffect, useMemo } from "react";

type TalentConfig = Record<string, [number]>;

// Cache in memory to avoid repeated fetches during a session
let configCache: Record<string, Record<string, TalentConfig>> = { low: {}, full: {} };
let cacheLoaded: Record<string, boolean> = { low: false, full: false };

async function fetchConfigs(mode: string): Promise<Record<string, TalentConfig>> {
  if (cacheLoaded[mode]) return configCache[mode];
  try {
    const res = await fetch(`/api/talent-configs?mode=${mode}`);
    const data: { level: number; config: TalentConfig }[] = await res.json();
    const map: Record<string, TalentConfig> = {};
    data.forEach((row) => { map[row.level.toString()] = row.config; });
    configCache[mode] = map;
    cacheLoaded[mode] = true;
    return map;
  } catch {
    return {};
  }
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

    // Find closest level below
    const levels = Object.keys(configs).map(Number).sort((a, b) => b - a);
    const closest = levels.find((l) => l <= points);
    return closest !== undefined ? configs[closest.toString()] : null;
  }, [points, configs]);

  const availableLevels = Object.keys(configs).map(Number);

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
