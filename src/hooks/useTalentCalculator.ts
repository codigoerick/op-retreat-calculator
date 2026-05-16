"use client";

import { useState, useMemo, useEffect } from "react";
import diffSequences from "@/data/diff_sequences.json";
import { supabase } from "@/lib/supabase";

export function useTalentCalculator() {
  const [points, setPoints] = useState<number>(0);
  const [mode, setMode] = useState<"low" | "full">("low");
  const [manualPoints, setManualPoints] = useState<number | null>(null);

  const [configsLow, setConfigsLow] = useState<any>(null);
  const [configsFull, setConfigsFull] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Maintenance state
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    // Fail-safe: Force stop loading after 5 seconds if Supabase hangs (common on mobile/adblockers)
    const failSafe = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch Configs and Maintenance Status in parallel
        const [configRes, settingsRes] = await Promise.all([
          supabase.from('talent_presets').select('mode, config_data'),
          supabase.from('site_settings').select('*').eq('key', 'maintenance').single()
        ]);

        if (!configRes.error && configRes.data) {
          const low = configRes.data.find(d => d.mode === 'low')?.config_data;
          const full = configRes.data.find(d => d.mode === 'full')?.config_data;
          if (low) setConfigsLow(low);
          if (full) setConfigsFull(full);
        }

        if (!settingsRes.error && settingsRes.data) {
          setIsMaintenance(settingsRes.data.value.enabled);
          setMaintenanceMessage(settingsRes.data.value.message);
        }
      } catch (e) {
        console.error("Error fetching data from Supabase:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    return () => clearTimeout(failSafe);
  }, []);

  const currentConfig = useMemo(() => {
    if (isLoading) return null;
    
    const configs: any = mode === "low" ? configsLow : configsFull;
    if (!configs) return null;

    if (manualPoints === null) {
        if (points === 0) return null;
        return configs[points.toString()];
    }

    const p = manualPoints;
    if (configs[p.toString()]) return configs[p.toString()];

    const baseLevels = Object.keys(configs).map(Number).sort((a, b) => b - a);
    const baseLevel = baseLevels.find(l => l <= p) ?? baseLevels[baseLevels.length - 1];
    const baseConfig = configs[baseLevel.toString()];
    if (!baseConfig) return null;
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
  }, [points, mode, manualPoints, configsLow, configsFull, isLoading]);

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
    isLoading,
    isMaintenance,
    maintenanceMessage,
    configsLow,
    configsFull
  };
}
