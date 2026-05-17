"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/control-panel");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f" }}>
      <div style={{ backgroundColor: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: "16px", padding: "40px", maxWidth: "380px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Image src="/assets/images/icons/gears.svg" alt="OP Retreat" width={52} height={52} style={{ marginBottom: "12px", opacity: 0.9 }} />
          <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: "20px", margin: 0 }}>OP Retreat</h2>
          <p style={{ color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>Control Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#a1a1aa", fontSize: "12px", fontWeight: 600 }}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Player810"
              required
              autoFocus
              autoComplete="username"
              style={{ background: "#121212", border: "1px solid #2e2e2e", borderRadius: "8px", color: "white", padding: "12px 14px", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: "#a1a1aa", fontSize: "12px", fontWeight: 600 }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{ background: "#121212", border: "1px solid #2e2e2e", borderRadius: "8px", color: "white", padding: "12px 14px", fontSize: "14px", outline: "none" }}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#ef4444", padding: "10px 14px", fontSize: "13px", textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? "#374151" : "#f59e0b", color: loading ? "#9ca3af" : "#000", border: "none", borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", marginTop: "4px" }}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
