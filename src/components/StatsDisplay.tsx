"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Base offsets requested by the user
const BASE_VISITS = 1780;
const BASE_CALCULATIONS = 1669;

export default function StatsDisplay({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState({ visits: 0, calculations: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Increment visit count (RPC)
        await supabase.rpc("increment_visits");

        // 2. Fetch current stats
        const { data, error } = await supabase
          .from("site_stats")
          .select("visits, calculations")
          .eq("id", 1)
          .single();

        if (data && !error) {
          setStats(data);
        }
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    }

    fetchStats();
    
    // Real-time updates
    const channel = supabase
      .channel('site_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_stats',
        },
        (payload) => {
          setStats(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={`stats-display ${className}`}>
      <div className="d-flex align-items-center gap-3 gap-sm-4 flex-wrap justify-content-center">
        <div className="stat-item d-flex align-items-center">
          <i className="bi bi-eye-fill text-muted me-2" style={{ fontSize: "1.2rem" }} title="Visitas"></i>
          <span className="stat-value text-warning">{(stats.visits + BASE_VISITS).toLocaleString()}</span>
        </div>
        <div className="stat-divider" style={{ color: "#444", opacity: 0.5 }}>|</div>
        <div className="stat-item d-flex align-items-center">
          <i className="bi bi-calculator-fill text-muted me-2" style={{ fontSize: "1.1rem" }} title="Calculado"></i>
          <span className="stat-value text-success">{(stats.calculations + BASE_CALCULATIONS).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export async function trackCalculation() {
    try {
        await supabase.rpc("increment_calculations");
    } catch (e) {
        console.error("Error tracking calculation:", e);
    }
}
