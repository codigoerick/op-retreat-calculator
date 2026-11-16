"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../login.module.css";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => createClient())
      .then((supabase) => supabase.auth.getSession())
      .then(({ data }) => {
        if (!active) return;
        if (!data.session) setInvalid(true);
        setChecking(false);
      })
      .catch(() => {
        if (!active) return;
        setInvalid(true);
        setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        const message = updateError.message.toLowerCase();
        setError(
          message.includes("should be different")
            ? "La nueva contraseña debe ser diferente a la anterior."
            : "No se pudo actualizar la contraseña. Solicita un nuevo enlace."
        );
        return;
      }

      setSuccess("Contraseña actualizada. Redirigiendo al panel...");
      window.setTimeout(() => {
        router.push("/control-panel");
        router.refresh();
      }, 1200);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="update-title">
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
            Seguridad
          </span>
          <h1 id="update-title" className={styles.title}>
            Nueva contraseña
          </h1>
          <p className={styles.subtitle}>
            Elige una contraseña segura de al menos 8 caracteres.
          </p>
        </div>

        {checking ? (
          <div className={styles.checking}>
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            />
            Verificando enlace...
          </div>
        ) : invalid ? (
          <>
            <div className={styles.alertError} role="alert">
              El enlace expiró o no es válido. Solicita uno nuevo para
              continuar.
            </div>
            <Link href="/login/reset" className={styles.buttonLink}>
              Solicitar un nuevo enlace
            </Link>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="new-password">
                Nueva contraseña
              </label>
              <div className={styles.inputShell}>
                <input
                  id="new-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoFocus
                  autoComplete="new-password"
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

            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm-password">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Repite la contraseña"
                required
                minLength={8}
                autoComplete="new-password"
                className={styles.input}
              />
            </div>

            {error && (
              <div className={styles.alertError} role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className={styles.alertSuccess} role="status">
                {success}
              </div>
            )}

            <button
              type="submit"
              className={styles.button}
              disabled={loading || Boolean(success)}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <Link href="/login" className={styles.footerLink}>
            Volver al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
