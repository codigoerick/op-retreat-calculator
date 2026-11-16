"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

type LoginFormProps = {
  initialError?: string;
};

export default function LoginForm({ initialError = "" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        router.push("/control-panel");
        router.refresh();
        return;
      }

      setError(data.error || "No se pudo iniciar sesión.");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.brand}>
          <div className={styles.logoShell}>
            <Image
              src="/assets/images/icons/gears.svg"
              alt="OP Retreat"
              width={34}
              height={34}
              priority
              className={styles.logo}
            />
          </div>
          <span className={styles.eyebrow}>
            <span className={styles.dot} aria-hidden="true" />
            Admin Console
          </span>
          <h1 id="login-title" className={styles.title}>
            OP Retreat
          </h1>
          <p className={styles.subtitle}>Acceso al panel de control</p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              placeholder="tu@correo.com"
              required
              autoFocus
              autoComplete="email"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">
                Contraseña
              </label>
              <Link href="/login/reset" className={styles.link}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className={styles.inputShell}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Tu contraseña"
                required
                autoComplete="current-password"
                className={`${styles.input} ${styles.inputWithButton}`}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.alertError} role="alert">
              {error}
            </div>
          )}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                />
                Verificando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <p className={styles.note}>
          Acceso exclusivo para administradores.
          <br />
          El registro estará disponible próximamente.
        </p>

        <div className={styles.footer}>
          <Link href="/" className={styles.footerLink}>
            Volver al sitio
          </Link>
        </div>
      </section>
    </main>
  );
}
