"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import { useTalentCalculator } from "@/hooks/useTalentCalculator";
import { supabase } from "@/lib/supabase";

type AdminTab = "dashboard" | "vision" | "settings" | "team";

export default function AdminPage() {
  const { configsLow, configsFull, isMaintenance, maintenanceMessage, isLoading } = useTalentCalculator();
  
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<{ id: number; message: string; type: "info" | "success" | "error" }[]>([]);

  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintMsg, setMaintMsg] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  const fetchTeam = async () => {
    const { data } = await supabase.from("contributors").select("*").order("created_at", { ascending: true });
    if (data) setTeamMembers(data);
  };

  useEffect(() => {
    if (isAuthenticated) fetchTeam();
  }, [isAuthenticated]);

  const handleAddMember = async () => {
    if (!newMemberName || !newMemberRole) return;
    const { error } = await supabase.from("contributors").insert([{ name: newMemberName, role: newMemberRole }]);
    if (!error) {
      setNewMemberName("");
      setNewMemberRole("");
      fetchTeam();
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (confirm("¿Eliminar de la página de equipo?")) {
      await supabase.from("contributors").delete().eq("id", id);
      fetchTeam();
    }
  };

  useEffect(() => {
    if (!isLoading) {
      setMaintEnabled(isMaintenance);
      setMaintMsg(maintenanceMessage);
    }
  }, [isLoading, isMaintenance, maintenanceMessage]);

  // Persist session
  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session === "true") {
      setIsAuthenticated(true);
      setUsername(localStorage.getItem("admin_user") || "Admin");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setIsAuthenticated(true);
      setLoginError("");
      localStorage.setItem("admin_session", "true");
      localStorage.setItem("admin_user", username);
    } else {
      setLoginError(data.error || "Error desconocido al iniciar sesión");
    }
  };

  const handleSaveSettings = async () => {
    if (isLoading) return;
    setIsSavingSettings(true);
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      body: JSON.stringify({ enabled: maintEnabled, message: maintMsg }),
    });
    if (res.ok) {
      alert("Ajustes vBulletin actualizados");
    }
    setIsSavingSettings(false);
  };

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    setIsUploading(true);
    for (const file of files) {
      addLog(`[V-VISION] Procesando ${file.name}...`, "info");
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/parse-talents", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          addLog(`[V-VISION] ¡Éxito! ${file.name} sincronizado.`, "success");
        } else {
          addLog(`[V-VISION] Error en ${file.name}: ${data.error}`, "error");
        }
      } catch (error: any) {
        addLog(`[V-VISION] Fallo crítico de red: ${error.message}`, "error");
      }
    }
    setIsUploading(false);
    e.target.value = "";
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <div className="text-center mb-4">
            <Image src="/assets/images/icons/gears.svg" alt="Admin" width={60} height={60} className="mb-2" />
            <h2 className="text-white fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Admin Suite</h2>
            <p className="text-secondary small">OP Retreat v2.0 - Management</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="text-secondary small mb-1">USUARIO</label>
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white py-2" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-secondary small mb-1">CONTRASEÑA</label>
              <input 
                type="password" 
                className="form-control bg-dark border-secondary text-white py-2" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && <p className="text-danger small mb-3">{loginError}</p>}
            <button className="btn btn-primary w-100 fw-bold py-2 shadow" style={{ fontFamily: 'var(--font-heading)' }}>ACCEDER AL PANEL</button>
          </form>
        </div>
      </div>
    );
  }

  const allLevels = [80, 90, 100, 110, 120, 130, 140, 144, 150, 160, 170, 180, 190, 200];
  const lowLevels = configsLow ? Object.keys(configsLow) : [];
  const fullLevels = configsFull ? Object.keys(configsFull) : [];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className="d-flex align-items-center gap-2">
            <Image src="/assets/images/icons/gears.svg" alt="Admin" width={30} height={30} />
            <span className="fw-bold text-white letter-spacing-1" style={{ fontSize: '0.9rem', fontFamily: 'var(--font-heading)' }}>OP RETREAT SUITE</span>
          </div>
        </div>
        
        <nav className={styles.sidebarMenu}>
          <div className={`${styles.menuItem} ${activeTab === 'dashboard' ? styles.menuItemActive : ''}`} onClick={() => setActiveTab('dashboard')}>
            <i className="bi bi-speedometer2"></i> Dashboard
          </div>
          <div className={`${styles.menuItem} ${activeTab === 'vision' ? styles.menuItemActive : ''}`} onClick={() => setActiveTab('vision')}>
            <i className="bi bi-eye"></i> V-Vision Sync
          </div>
          <div className={`${styles.menuItem} ${activeTab === 'settings' ? styles.menuItemActive : ''}`} onClick={() => setActiveTab('settings')}>
            <i className="bi bi-gear"></i> Site Settings
          </div>
          <div className={`${styles.menuItem} ${activeTab === 'team' ? styles.menuItemActive : ''}`} onClick={() => setActiveTab('team')}>
            <i className="bi bi-people"></i> Team Manager
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className="text-secondary x-small mb-2">User: <span className="text-info">{username}</span></div>
          <button className="btn btn-outline-danger btn-sm w-100" onClick={() => {
            setIsAuthenticated(false);
            localStorage.removeItem("admin_session");
          }}>Logout</button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className="container-fluid p-0">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard</h2>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={async () => {
                    if(confirm("¿RESET DB?")) {
                      await fetch("/api/admin/reset", { method: "POST" });
                      window.location.reload();
                    }
                  }}
                >
                  RESET DATABASE
                </button>
              </div>

              <div className={styles.vbBlock}>
                <div className={styles.vbBlockHeader}>
                  <h6 className={styles.vbBlockTitle}>Estado de Niveles en Supabase</h6>
                </div>
                <div className={styles.vbBlockContent}>
                  <div className="row">
                    <div className="col-md-6 mb-4 mb-md-0">
                      <h6 className="text-secondary small mb-3">MODO LOW HP</h6>
                      <div className={styles.statusGrid}>
                        {allLevels.map(lvl => (
                          <div key={lvl} className={`${styles.badgeLevel} ${lowLevels.includes(lvl.toString()) ? styles.active : ''}`}>
                            {lvl}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-secondary small mb-3">MODO FULL HP</h6>
                      <div className={styles.statusGrid}>
                        {allLevels.map(lvl => (
                          <div key={lvl} className={`${styles.badgeLevel} ${fullLevels.includes(lvl.toString()) ? styles.active : ''}`}>
                            {lvl}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* V-VISION SYNC TAB */}
          {activeTab === 'vision' && (
            <div className="animate-fade-in">
              <h2 className="text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>V-Vision Sync</h2>
              <div className="row">
                <div className="col-md-7">
                  <div className={styles.vbBlock}>
                    <div className={styles.vbBlockHeader}>
                      <h6 className={styles.vbBlockTitle}>Carga de Capturas Inteligente</h6>
                    </div>
                    <div className={styles.vbBlockContent}>
                      <div className={styles.uploadArea}>
                        <i className="bi bi-cloud-upload text-secondary fs-1 mb-3"></i>
                        <p className="text-secondary mb-3">Sincronización visual mediante IA Gemini 2.5</p>
                        <label htmlFor="file-upload" className={`btn btn-primary fw-bold px-4 ${isUploading ? 'disabled' : ''}`}>
                          {isUploading ? "PROCESANDO..." : "SELECCIONAR IMÁGENES"}
                        </label>
                        <input id="file-upload" type="file" multiple accept="image/*" className="d-none" onChange={handleFileUpload} disabled={isUploading} />
                        <div className="mt-3 text-muted x-small">Recomendado: 1080x2400 (Vertical)</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className={styles.vbBlock}>
                    <div className={styles.vbBlockHeader}>
                      <h6 className={styles.vbBlockTitle}>Terminal de Logs</h6>
                    </div>
                    <div className={styles.vbBlockContent} style={{ padding: '0' }}>
                      <div className={styles.logsConsole}>
                        {logs.length === 0 && <span className="text-muted small">Sin actividad...</span>}
                        {logs.map(log => (
                          <div key={log.id} className={`${styles.logEntry} ${log.type === 'error' ? styles.logError : log.type === 'success' ? styles.logSuccess : styles.logInfo}`}>
                            {log.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in">
              <h2 className="text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Ajustes del Sitio</h2>
              <div className="row">
                <div className="col-md-6">
                  <div className={styles.vbBlock}>
                    <div className={styles.vbBlockHeader}>
                      <h6 className={styles.vbBlockTitle}>Mantenimiento y Alertas</h6>
                    </div>
                    <div className={styles.vbBlockContent}>
                      <div className={styles.maintForm}>
                        <div className="form-check form-switch mb-3">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={maintEnabled}
                            onChange={(e) => setMaintEnabled(e.target.checked)}
                          />
                          <label className="form-check-label text-white small">Activar Bloqueo de Visitantes</label>
                        </div>
                        <label className="text-secondary small mb-2">MENSAJE DE MANTENIMIENTO</label>
                        <textarea 
                          className={styles.maintInput}
                          placeholder="Escribe aquí el motivo del mantenimiento..."
                          rows={4}
                          value={maintMsg}
                          onChange={(e) => setMaintMsg(e.target.value)}
                        />
                        <button 
                          className="btn btn-primary fw-bold mt-2" 
                          onClick={handleSaveSettings}
                          disabled={isSavingSettings || isLoading}
                        >
                          {isLoading ? "CARGANDO..." : isSavingSettings ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div className="animate-fade-in">
              <h2 className="text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Gestión de Equipo</h2>
              <div className="row">
                <div className="col-md-5">
                  <div className={styles.vbBlock}>
                    <div className={styles.vbBlockHeader}>
                      <h6 className={styles.vbBlockTitle}>Añadir Nuevo Miembro</h6>
                    </div>
                    <div className={styles.vbBlockContent}>
                      <div className="mb-3">
                        <label className="text-secondary small mb-1">NOMBRE COMPLETO</label>
                        <input 
                          className={styles.maintInput} 
                          placeholder="Ej: Player810"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="text-secondary small mb-1">ROL O CONTRIBUCIÓN</label>
                        <input 
                          className={styles.maintInput} 
                          placeholder="Ej: Founder / Developer"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                        />
                      </div>
                      <button className="btn btn-success w-100 fw-bold" onClick={handleAddMember}>AÑADIR AL EQUIPO</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-7">
                  <div className={styles.vbBlock}>
                    <div className={styles.vbBlockHeader}>
                      <h6 className={styles.vbBlockTitle}>Staff Actual</h6>
                    </div>
                    <div className={styles.vbBlockContent} style={{ padding: '0' }}>
                      <div className="table-responsive">
                        <table className="table table-dark table-hover mb-0" style={{ backgroundColor: 'transparent' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #334155' }}>
                              <th className="px-4 py-3 text-secondary small">NOMBRE</th>
                              <th className="px-4 py-3 text-secondary small">ROL</th>
                              <th className="px-4 py-3 text-secondary small text-end">ACCIONES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teamMembers.map(m => (
                              <tr key={m.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td className="px-4 py-3 fw-bold text-info">{m.name}</td>
                                <td className="px-4 py-3 text-secondary">{m.role}</td>
                                <td className="px-4 py-3 text-end">
                                  <button className="btn btn-link text-danger p-0 text-decoration-none" onClick={() => handleDeleteMember(m.id)}>Eliminar</button>
                                </td>
                              </tr>
                            ))}
                            {teamMembers.length === 0 && (
                              <tr>
                                <td colSpan={3} className="text-center py-4 text-muted">No hay miembros en el equipo.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
