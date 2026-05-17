"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
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
        body: JSON.stringify({ identifier, password }),
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
    <main className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="login-card p-5 rounded-4 shadow-lg" style={{ backgroundColor: "#1a1a1a", border: "1px solid #333", maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-4">
          <Image 
            src="/assets/images/icons/gears.svg" 
            alt="Admin Login" 
            width={60} 
            height={60} 
            className="mb-3"
            style={{ opacity: 0.9 }}
          />
          <h3 className="text-gold fw-bold mb-1">OP Retreat</h3>
          <p className="text-secondary small text-uppercase tracking-wider">Control Panel Access</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label text-light small mb-2">Usuario o Correo</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Player810 o tu@correo.com"
              required
              autoFocus
              autoComplete="username"
              style={{ padding: "12px" }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-light small mb-2">Contraseña</label>
            <input
              type="password"
              className="form-control bg-dark text-light border-secondary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ padding: "12px" }}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small text-center shake mb-4" style={{ backgroundColor: "rgba(220, 53, 69, 0.1)", color: "#ef4444", border: "1px solid rgba(220, 53, 69, 0.2)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 fw-bold"
            style={{ 
              backgroundColor: "#f59e0b", 
              color: "#000", 
              padding: "12px",
              transition: "all 0.2s ease"
            }}
          >
            {loading ? "Autenticando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
