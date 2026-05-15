"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import styles from "./page.module.css";

interface Member {
  id: number;
  name: string;
  role: string;
  avatar_url: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      const { data, error } = await supabase
        .from("contributors")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) {
        setMembers(data);
      }
      setIsLoading(false);
    }
    fetchTeam();
  }, []);

  return (
    <div className={styles.teamContainer}>
      {/* Navbar Minimalista */}
      <header className={styles.teamHeader}>
        <div className="container d-flex align-items-center justify-content-between py-3">
          <a href="/" className="text-decoration-none d-flex align-items-center gap-2">
            <Image src="/assets/images/icons/gears.svg" alt="Logo" width={30} height={30} />
            <span className="text-gold fw-bold" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>OP Retreat</span>
          </a>
          <a href="/" className="btn btn-outline-warning btn-sm">Volver a la Calculadora</a>
        </div>
      </header>

      <main className="container py-5">
        <div className="text-center mb-5">
          <h1 className={styles.title} style={{ fontFamily: 'var(--font-heading)' }}>Nuestro Equipo</h1>
          <p className={styles.subtitle} style={{ fontFamily: 'var(--font-primary)' }}>
            Las mentes y colaboradores detrás del optimizador de talentos más potente de OP Retreat.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : (
          <div className="row justify-content-center g-4">
            {members.map((member) => (
              <div key={member.id} className="col-12 col-md-6 col-lg-4">
                <div className={styles.memberCard}>
                  <div className={styles.cardHeader}></div>
                  <div className={styles.cardBody}>
                    <div className={styles.avatarWrapper}>
                      <Image 
                        src={member.avatar_url || "/assets/images/icons/gears.svg"} 
                        alt={member.name} 
                        width={80} 
                        height={80} 
                        className={styles.avatar}
                      />
                    </div>
                    <h3 className={styles.memberName} style={{ fontFamily: 'var(--font-heading)' }}>{member.name}</h3>
                    <p className={styles.memberRole} style={{ fontFamily: 'var(--font-primary)' }}>{member.role}</p>
                    <div className={styles.badge}>Miembro Activo</div>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-center text-muted">Aún no hay miembros registrados.</div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-5 text-secondary small">
        OP Retreat Community Project © 2026
      </footer>
    </div>
  );
}
