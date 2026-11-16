"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../login.module.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "No se pudo enviar el enlace.");
        return;
      }

      setSent(true);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="reset-title">
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
            Recuperar acceso
          </span>
          <h1 id="reset-title" className={styles.title}>
            Restablecer contraseña
          </h1>
          <p className={styles.subtitle}>
            Te enviaremos un enlace seguro al correo de tu cuenta.
          </p>
        </div>

        {sent ? (
          <>
            <div className={styles.alertSuccess} role="status">
              Si el correo está registrado, recibirás un enlace para crear una
              nueva contraseña. Revisa también la carpeta de spam.
            </div>
            <Link href="/login" className={styles.buttonLink}>
              Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="reset-email">
                Correo electrónico
              </label>
              <input
                id="reset-email"
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
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </button>
          </form>
        )}

        {!sent && (
          <div className={styles.footer}>
            <Link href="/login" className={styles.footerLink}>
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
