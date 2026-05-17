"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import talents from "@/data/talents.json";

const LEVELS = [10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200];
type Config = Record<string, [number]>;

interface DbRow {
  level: number;
  mode: "low" | "full";
  points: number;
  nodesCount: number;
}

export default function AdminTalentEditor() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"editor" | "database" | "analytics" | "settings">("editor");
  const [mode, setMode] = useState<"low"|"full">("low");
  const [level, setLevel] = useState(10);
  const [config, setConfig] = useState<Config>({});
  const [allConfigsLow, setAllConfigsLow] = useState<Record<string,Config>>({});
  const [allConfigsFull, setAllConfigsFull] = useState<Record<string,Config>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);

  // Settings
  const [maintenanceMessage, setMaintenanceMessage] = useState("We are optimizing talent trees for season 2.");

  useEffect(()=>{ setMounted(true); },[]);

  const showToast = (msg:string, ok=true) => {
    setToast({msg,ok});
    setTimeout(()=>setToast(null), 3500);
  };

  // Load all configs from database for both modes
  const loadAllConfigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resLow, resFull] = await Promise.all([
        fetch(`/api/talent-configs?mode=low`),
        fetch(`/api/talent-configs?mode=full`)
      ]);
      const dataLow: {level:number; config:Config}[] = await resLow.json();
      const dataFull: {level:number; config:Config}[] = await resFull.json();

      const mapLow: Record<string,Config> = {};
      dataLow.forEach(r => { mapLow[r.level.toString()] = r.config; });

      const mapFull: Record<string,Config> = {};
      dataFull.forEach(r => { mapFull[r.level.toString()] = r.config; });

      setAllConfigsLow(mapLow);
      setAllConfigsFull(mapFull);

      // Set active editing config based on current level & mode selection
      const currentMap = mode === 'low' ? mapLow : mapFull;
      setConfig(currentMap[level.toString()] ? JSON.parse(JSON.stringify(currentMap[level.toString()])) : {});
    } catch {
      showToast("Sync failed with Supabase Studio", false);
    } finally {
      setIsLoading(false);
    }
  }, [mode, level]);

  useEffect(() => {
    if (mounted) loadAllConfigs();
  }, [mounted]);

  // Sync editing config when mode or level selection changes
  useEffect(() => {
    const currentMap = mode === 'low' ? allConfigsLow : allConfigsFull;
    const ex = currentMap[level.toString()];
    setConfig(ex ? JSON.parse(JSON.stringify(ex)) : {});
  }, [level, mode, allConfigsLow, allConfigsFull]);

  const toggleNode = (id:number) => {
    const k = id.toString();
    const max = (talents.find(t=>t.id===id) as any)?.maxStars ?? 5;
    const cur = config[k]?.[0] ?? 0;
    const next = cur >= max ? 0 : cur+1;
    if(next===0){ const u={...config}; delete u[k]; setConfig(u); }
    else setConfig({...config,[k]:[next]});
  };

  // Right-click: Set to 5 points (or max) in a single click, second click removes it completely
  const maxOrClearNode = (id:number) => {
    const k = id.toString();
    const max = (talents.find(t=>t.id===id) as any)?.maxStars ?? 5;
    const cur = config[k]?.[0] ?? 0;
    if(cur < max){
      setConfig({...config,[k]:[max]});
    } else {
      const u={...config};
      delete u[k];
      setConfig(u);
    }
  };

  const copyFromPrev = () => {
    const idx = LEVELS.indexOf(level);
    if(idx===0) return;
    const currentMap = mode === 'low' ? allConfigsLow : allConfigsFull;
    const prev = currentMap[LEVELS[idx-1].toString()];
    if(!prev){ showToast(`No saved config for level ${LEVELS[idx-1]}`,false); return; }
    setConfig(JSON.parse(JSON.stringify(prev)));
    showToast(`Copied from level ${LEVELS[idx-1]}`);
  };

  const save = async () => {
    if(!confirm(`Save level ${level} (${mode.toUpperCase()}) to Supabase?`)) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/talent-configs',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({mode,level,config})
      });
      if(!res.ok) throw new Error();
      
      // Update local cache state
      if (mode === 'low') {
        setAllConfigsLow(prev => ({ ...prev, [level.toString()]: JSON.parse(JSON.stringify(config)) }));
      } else {
        setAllConfigsFull(prev => ({ ...prev, [level.toString()]: JSON.parse(JSON.stringify(config)) }));
      }
      showToast(`Level ${level} (${mode.toUpperCase()}) successfully deployed!`);
    } catch {
      showToast("Deployment failed", false);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteConfigFromDb = async (delMode: "low" | "full", delLevel: number) => {
    if (!confirm(`Are you sure you want to permanently delete Level ${delLevel} (${delMode.toUpperCase()}) config from database?`)) return;
    try {
      const res = await fetch(`/api/talent-configs?mode=${delMode}&level=${delLevel}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      
      if (delMode === 'low') {
        setAllConfigsLow(prev => {
          const u = { ...prev };
          delete u[delLevel.toString()];
          return u;
        });
      } else {
        setAllConfigsFull(prev => {
          const u = { ...prev };
          delete u[delLevel.toString()];
          return u;
        });
      }
      showToast(`Deleted level ${delLevel} config!`);
    } catch {
      showToast("Failed to delete config", false);
    }
  };

  if(!mounted) return null;

  const getTalent = (id:number) => talents.find(t=>t.id===id);
  const rows:number[][] = [];
  for(let i=21;i>=0;i--) rows.push([i*3+1,i*3+2,i*3+3]);
  rows.push([0]);

  const currentMap = mode === 'low' ? allConfigsLow : allConfigsFull;
  const totalPts = Object.values(config).reduce((a,[v])=>a+v,0);
  const hasSaved = !!currentMap[level.toString()];
  const hasChanges = JSON.stringify(config) !== JSON.stringify(currentMap[level.toString()]??{});

  // Calculate high-level stats for database & analytics views
  const lowSavedCount = Object.keys(allConfigsLow).length;
  const fullSavedCount = Object.keys(allConfigsFull).length;
  const dbRows: DbRow[] = [];
  
  LEVELS.forEach(l => {
    if (allConfigsLow[l.toString()]) {
      const cfg = allConfigsLow[l.toString()];
      dbRows.push({
        level: l,
        mode: 'low',
        points: Object.values(cfg).reduce((a,[v])=>a+v,0),
        nodesCount: Object.keys(cfg).filter(k => (cfg[k]?.[0]??0) > 0).length
      });
    }
    if (allConfigsFull[l.toString()]) {
      const cfg = allConfigsFull[l.toString()];
      dbRows.push({
        level: l,
        mode: 'full',
        points: Object.values(cfg).reduce((a,[v])=>a+v,0),
        nodesCount: Object.keys(cfg).filter(k => (cfg[k]?.[0]??0) > 0).length
      });
    }
  });

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#121212',color:'#ededed',fontFamily:'"Geist Sans","Inter",system-ui,sans-serif',fontSize:'13px'}}>

      {/* PANE 1: FAR LEFT NARROW ICON BAR (Exact Supabase Studio Sidebar) */}
      <nav style={{
        width:'64px',
        background:'#1c1c1c',
        borderRight:'1px solid #2e2e2e',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        padding:'16px 0',
        gap:'16px',
        flexShrink:0
      }}>
        {/* Supabase Styled Logo */}
        <div style={{
          width:'36px',
          height:'36px',
          background:'#1e1e1e',
          border:'1px solid #2e2e2e',
          borderRadius:'8px',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          cursor:'pointer',
          marginBottom:'12px',
          transition:'all 0.2s'
        }} title="Supabase Dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13.2 2L4 12.8h8.8L10.8 22l9.2-10.8h-8.8L13.2 2z" fill="#3ecf8e" />
          </svg>
        </div>

        {/* Tab Icons List */}
        {[
          { tab: 'editor', label: 'Talent Editor', icon: '🎯' },
          { tab: 'database', label: 'Tables / DB Editor', icon: '🗃️' },
          { tab: 'analytics', label: 'Analytics Insights', icon: '📈' },
          { tab: 'settings', label: 'Project Settings', icon: '⚙️' }
        ].map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab as any)}
              style={{
                width:'40px',
                height:'40px',
                borderRadius:'8px',
                border: 'none',
                background: isActive ? '#2e2e2e' : 'transparent',
                color: isActive ? '#3ecf8e' : '#8a8a8a',
                fontSize:'18px',
                cursor:'pointer',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                transition:'all 0.15s',
                position:'relative'
              }}
              title={item.label}
            >
              {item.icon}
              {isActive && (
                <div style={{
                  position:'absolute',
                  left: 0,
                  top: '20%',
                  height: '60%',
                  width: '3px',
                  background: '#3ecf8e',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
            </button>
          );
        })}

        <div style={{flex:1}} />

        {/* Profile Avatar At Bottom */}
        <div style={{
          width:'32px',
          height:'32px',
          borderRadius:'50%',
          background:'#2e2e2e',
          color:'#3ecf8e',
          border:'1px solid #3ecf8e',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontWeight:'bold',
          cursor:'pointer',
          fontSize:'11px'
        }} title="Project Admin">
          A
        </div>
      </nav>

      {/* PANE 2: SUB-SIDEBAR (Clean Supabase Second Column) */}
      <aside style={{
        width:'240px',
        background:'#171717',
        borderRight:'1px solid #2e2e2e',
        display:'flex',
        flexDirection:'column',
        flexShrink:0
      }}>
        
        {/* Sub-sidebar Title Header */}
        <div style={{
          padding:'18px 20px',
          borderBottom:'1px solid #2e2e2e',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between'
        }}>
          <span style={{color:'white',fontWeight:'700',fontSize:'13px',letterSpacing:'0.3px'}}>
            {activeTab === 'editor' && "Talent Studio"}
            {activeTab === 'database' && "Supabase Studio"}
            {activeTab === 'analytics' && "Metrics & Graphs"}
            {activeTab === 'settings' && "Engine Settings"}
          </span>
          <span style={{
            fontSize:'10px',
            background:'#2e2e2e',
            color:'#8a8a8a',
            padding:'2px 6px',
            borderRadius:'4px',
            fontWeight:'700'
          }}>v3</span>
        </div>

        {/* Dynamic Inner Sub-Navigation options */}
        <div style={{padding:'12px 8px',display:'flex',flexDirection:'column',gap:'4px',flex:1,overflowY:'auto'}}>
          
          {activeTab === 'editor' && (
            <>
              {/* Operation mode select header */}
              <div style={{color:'#6b7280',fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1px',padding:'8px 12px 4px'}}>Mode Toggle</div>
              {(['low','full'] as const).map(m => {
                const isActive = mode === m;
                return (
                  <button key={m} onClick={() => setMode(m)} style={subSidebarItemStyle(isActive)}>
                    <span style={{color: isActive ? '#3ecf8e' : '#8a8a8a'}}>{m === 'low' ? '🛡️' : '❤️'}</span>
                    <span style={{flex:1,textAlign:'left'}}>{m === 'low' ? 'Low HP Profile' : 'Full HP Profile'}</span>
                  </button>
                );
              })}

              {/* Levels grid list */}
              <div style={{color:'#6b7280',fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1px',padding:'16px 12px 4px'}}>Database Levels</div>
              <div style={{padding:'4px 8px'}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'4px'}}>
                  {LEVELS.map(l => {
                    const saved = !!(mode === 'low' ? allConfigsLow : allConfigsFull)[l.toString()];
                    const isActive = l === level;
                    return (
                      <button key={l} onClick={()=>setLevel(l)} style={{
                        height:'28px',
                        borderRadius:'4px',
                        border:'1px solid',
                        borderColor: isActive ? '#3ecf8e' : '#2e2e2e',
                        background: isActive ? 'rgba(62,207,142,0.1)' : '#1e1e1e',
                        color: isActive ? '#3ecf8e' : saved ? '#a8a8a8' : '#6b7280',
                        fontWeight: '700',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.1s'
                      }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'database' && (
            <>
              <div style={{color:'#6b7280',fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1px',padding:'8px 12px 4px'}}>Database Schema</div>
              <button style={subSidebarItemStyle(true)}>
                <span>🗃️</span>
                <span style={{flex:1,textAlign:'left'}}>talent_configs</span>
                <span style={{color:'#3ecf8e',fontSize:'10px'}}>●</span>
              </button>
              <button style={subSidebarItemStyle(false)}>
                <span>📊</span>
                <span style={{flex:1,textAlign:'left'}}>site_stats</span>
              </button>
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              <div style={{color:'#6b7280',fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1px',padding:'8px 12px 4px'}}>Metrics View</div>
              <button style={subSidebarItemStyle(true)}>
                <span>📈</span>
                <span style={{flex:1,textAlign:'left'}}>Point Density Rates</span>
              </button>
              <button style={subSidebarItemStyle(false)}>
                <span>📊</span>
                <span style={{flex:1,textAlign:'left'}}>Deployment Progress</span>
              </button>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div style={{color:'#6b7280',fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1px',padding:'8px 12px 4px'}}>Project Parameters</div>
              <button style={subSidebarItemStyle(true)}>
                <span>🔧</span>
                <span style={{flex:1,textAlign:'left'}}>Maintenance Message</span>
              </button>
              <button style={subSidebarItemStyle(false)}>
                <span>📦</span>
                <span style={{flex:1,textAlign:'left'}}>Database Presets</span>
              </button>
            </>
          )}

        </div>

        {/* Sync Summary in Sub-Sidebar Footer */}
        <div style={{
          padding:'16px 20px',
          borderTop:'1px solid #2e2e2e',
          background:'#141414',
          display:'flex',
          flexDirection:'column',
          gap:'6px'
        }}>
          <span style={{color:'#6b7280',fontSize:'10px',fontWeight:'700',textTransform:'uppercase'}}>Deployment Status</span>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'11.5px',color:'#8a8a8a'}}>
            <span>low_hp:</span>
            <span style={{color:'#3ecf8e',fontWeight:'bold'}}>{lowSavedCount} / 20</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:'11.5px',color:'#8a8a8a'}}>
            <span>full_hp:</span>
            <span style={{color:'#3ecf8e',fontWeight:'bold'}}>{fullSavedCount} / 20</span>
          </div>
        </div>

      </aside>

      {/* PANE 3: MAIN WORKSPACE (Pure Supabase Dark Clean Content Panel) */}
      <main style={{flex:1,display:'flex',flexDirection:'column',overflowY:'auto'}}>

        {/* BREADCRUMB HEADER */}
        <div style={{
          background:'#171717',
          borderBottom:'1px solid #2e2e2e',
          height:'50px',
          padding:'0 24px',
          display:'flex',
          alignItems:'center',
          gap:'8px',
          fontSize:'12.5px',
          color:'#8a8a8a'
        }}>
          <span>Project</span>
          <span>/</span>
          <span style={{color:'white',fontWeight:'500'}}>op-retreat-calculator</span>
          <span>/</span>
          <span style={{color:'#3ecf8e',fontWeight:'600'}}>
            {activeTab === 'editor' && "Talent Tree Editor"}
            {activeTab === 'database' && "Supabase Studio DB Browser"}
            {activeTab === 'analytics' && "Performance & Allocation Density"}
            {activeTab === 'settings' && "Engine Settings & Maintenance Alerts"}
          </span>

          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'12px'}}>
            {isLoading && <span style={{color:'#f1c40f',fontSize:'11px'}}>⟳ Syncing database...</span>}
            {hasSaved && !hasChanges && <span style={{background:'rgba(62,207,142,0.1)',color:'#3ecf8e',padding:'2px 10px',borderRadius:'4px',fontSize:'11px',border:'1px solid rgba(62,207,142,0.2)',fontWeight:'bold'}}>SYNCED WITH DATABASE</span>}
            {hasChanges && <span style={{background:'rgba(245,158,11,0.1)',color:'#f59e0b',padding:'2px 10px',borderRadius:'4px',fontSize:'11px',border:'1px solid rgba(245,158,11,0.2)',fontWeight:'bold'}}>UNSAVED PARAMETERS</span>}
            
            <div style={{width:'1px',height:'16px',background:'#2e2e2e',margin:'0 4px'}} />
            
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              style={{
                background:'transparent',
                color:'#ef4444',
                border:'1px solid rgba(239, 68, 68, 0.3)',
                padding:'4px 12px',
                borderRadius:'4px',
                fontSize:'11.5px',
                fontWeight:'600',
                cursor:'pointer',
                transition:'all 0.2s',
                display:'flex',
                alignItems:'center',
                gap:'6px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>⏻</span> Cerrar Sesión
            </button>
          </div>
        </div>

        {/* ACTIVE VIEW DISPATCHER */}

        {/* 1. TALENT TREE EDITOR VIEW */}
        {activeTab === 'editor' && (
          <>
            {/* WORKSPACE HEADER TOOLBAR */}
            <div style={{
              background:'#121212',
              borderBottom:'1px solid #2e2e2e',
              padding:'14px 24px',
              display:'flex',
              alignItems:'center',
              gap:'12px',
              flexWrap:'wrap'
            }}>
              
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{background:'#1e1e1e',border:'1px solid #2e2e2e',color:'white',padding:'4px 10px',borderRadius:'6px',fontSize:'11.5px',fontWeight:'bold'}}>
                  {mode === 'low' ? '🛡️ Low HP' : '❤️ Full HP'}
                </span>
                <span style={{color:'white',fontWeight:'bold',fontSize:'14px'}}>Level {level} Profile</span>
              </div>

              <div style={{width:'1px',height:'20px',background:'#2e2e2e',margin:'0 8px'}} />

              <button onClick={copyFromPrev} disabled={LEVELS.indexOf(level)===0} style={supabaseBtnStyle()}>
                ⬇ Copy Previous ({LEVELS[LEVELS.indexOf(level)-1] ?? '–'})
              </button>

              <button onClick={() => { if(confirm("Clear current nodes?")) setConfig({}); }} style={supabaseBtnStyle('#ea580c', '#ffffff', 'none')}>
                ✕ Reset Grid
              </button>

              <button onClick={loadAllConfigs} style={supabaseBtnStyle()}>
                ⟳ Sync DB
              </button>

              <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12.5px'}}>
                  <span style={{color:'#8a8a8a'}}>Allocated:</span>
                  <span style={{color:'#3ecf8e',fontWeight:'bold'}}>{totalPts}</span>
                  <span style={{color:'#8a8a8a'}}>/</span>
                  <span style={{color:'white',fontWeight:'bold'}}>{level} pts</span>
                </div>

                <button onClick={save} disabled={isSaving || !hasChanges} style={{
                  background: !hasChanges ? '#1e1e1e' : '#3ecf8e',
                  color: !hasChanges ? '#6b7280' : '#121212',
                  border: !hasChanges ? '1px solid #2e2e2e' : 'none',
                  borderRadius: '6px',
                  padding: '6px 18px',
                  fontWeight: '700',
                  cursor: !hasChanges ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s'
                }}>
                  {isSaving ? 'Deploying...' : 'Deploy Changes'}
                </button>
              </div>
            </div>

            {/* MAIN WORKSPACE CONTENT GRID */}
            <div style={{display:'flex',flex:1,overflow:'hidden'}}>
              
              {/* Tree Viewport */}
              <div style={{flex:1,overflow:'auto',padding:'30px',background:'#121212',position:'relative'}}>
                {isLoading && (
                  <div style={{position:'absolute',inset:0,background:'rgba(18,18,18,0.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>
                    <div style={{background:'#1e1e1e',border:'1px solid #2e2e2e',borderRadius:'8px',padding:'24px 40px',color:'#3ecf8e',fontWeight:'700',display:'flex',alignItems:'center',gap:'12px'}}>
                      <span style={{animation:'spin 1s infinite linear'}}>🌀</span>
                      <span>Fetching Supabase parameters...</span>
                    </div>
                  </div>
                )}

                {/* Supabase Green Alert Callout */}
                <div style={{
                  background:'rgba(62,207,142,0.05)',
                  border:'1px solid rgba(62,207,142,0.2)',
                  borderRadius:'8px',
                  padding:'14px 20px',
                  marginBottom:'24px',
                  color:'#ededed',
                  fontSize:'12.5px',
                  lineHeight:'1.5'
                }}>
                  <span style={{color:'#3ecf8e',fontWeight:'bold'}}>⚡ Supabase CP Fast Macros Active:</span> <b>Left Click</b> cycles stars (0 ➔ max). <b>Right Click</b> applies/removes <b>5 stars instantly</b>. Use this mechanism to allocate points rapidly.
                </div>

                <div className="talent__tree" style={{
                  background:'#171717',
                  border:'1px solid #2e2e2e',
                  borderRadius:'8px',
                  padding:'40px 30px',
                  boxShadow:'0 4px 20px rgba(0,0,0,0.2)'
                }}>
                  <div className="talent__rows__container">
                    {rows.map((row,rowIndex)=>(
                      <div key={rowIndex} className={`talent__row${row.length===1?' talent__row--single':''}`}>
                        {row.map(id=>{
                          const talent = getTalent(id);
                          if(!talent) return null;
                          const stars = config[id.toString()]?.[0]||0;
                          return (
                            <div key={id} className={`talent__node${stars===0?' talent--locked':''}`}
                              onClick={()=>toggleNode(id)}
                              onContextMenu={e=>{e.preventDefault();maxOrClearNode(id);}}
                              title={`${talent.name} (ID:${id}) | Stars: ${stars}/${(talent as any).maxStars ?? 5}`}
                              style={{cursor:'pointer',position:'relative',transition:'transform 0.15s'}}
                            >
                              <div className={`talent__bg ${talent.bgClass}`}>
                                <div className="talent__name">{talent.name}</div>
                                <img src={`/${talent.icon}`} alt={talent.name} className="talent__icon" style={{width:'40px',height:'40px'}}/>
                                <div className="talent__level-bar">
                                  {[...Array(5)].map((_,i)=>(
                                    <img key={i} src="/assets/images/icons/talent-level.webp" alt="" className="talent__level-star" style={{opacity:i<stars?1:0,width:'11px'}}/>
                                  ))}
                                </div>
                                {stars===0 && <img src="/assets/images/icons/lock.webp" alt="locked" className="talent__lock" style={{display:'block',width:'40px'}}/>}
                                {stars>0 && <span style={{position:'absolute',top:'-8px',right:'-8px',background:'#3ecf8e',color:'#121212',width:'20px',height:'20px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'900',fontSize:'11px',pointerEvents:'none',border:'1.5px solid #171717'}}>{stars}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar drawer: Active Nodes */}
              <aside style={{
                width:'240px',
                background:'#171717',
                borderLeft:'1px solid #2e2e2e',
                padding:'20px',
                overflowY:'auto',
                display:'flex',
                flexDirection:'column',
                gap:'16px'
              }}>
                <span style={{color:'#6b7280',fontSize:'10px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'1px'}}>Row Allocations</span>
                
                <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
                  {Object.entries(config).filter(([,[v]])=>v>0).sort(([a],[b])=>Number(a)-Number(b)).map(([id,[stars]])=>(
                    <div key={id} style={{
                      display:'flex',
                      justifyContent:'space-between',
                      padding:'8px 10px',
                      background:'#121212',
                      borderRadius:'6px',
                      border:'1px solid #2e2e2e',
                      fontSize:'11.5px'
                    }}>
                      <span style={{color:'#3ecf8e',fontWeight:'bold'}}>ID:{id}</span>
                      <span style={{color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100px'}}>{getTalent(Number(id))?.name}</span>
                      <span style={{color:'#3ecf8e',fontWeight:'bold'}}>{stars}★</span>
                    </div>
                  ))}
                  {Object.keys(config).length === 0 && (
                    <span style={{color:'#475569',fontStyle:'italic',fontSize:'11px',textAlign:'center',padding:'20px 0'}}>No nodes set. Click on talent tree.</span>
                  )}
                </div>
              </aside>

            </div>
          </>
        )}

        {/* 2. DATABASE SCHEMA TABLE VIEW */}
        {activeTab === 'database' && (
          <div style={{padding:'40px',maxWidth:'1000px'}}>
            <div style={{marginBottom:'24px'}}>
              <h2 style={{color:'white',fontWeight:'700',fontSize:'20px',margin:0}}>Table Editor: talent_configs</h2>
              <p style={{color:'#8a8a8a',fontSize:'13px',marginTop:'4px'}}>Inspecting active database records synced in target supabase schema.</p>
            </div>

            <div style={{background:'#1e1e1e',border:'1px solid #2e2e2e',borderRadius:'8px',overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',textAlign:'left',fontSize:'12.5px'}}>
                <thead>
                  <tr style={{background:'#171717',borderBottom:'1px solid #2e2e2e',color:'#8a8a8a'}}>
                    <th style={{padding:'14px 20px',fontWeight:'600'}}>mode</th>
                    <th style={{padding:'14px 20px',fontWeight:'600'}}>level_profile</th>
                    <th style={{padding:'14px 20px',fontWeight:'600'}}>points_allocated</th>
                    <th style={{padding:'14px 20px',fontWeight:'600'}}>active_nodes</th>
                    <th style={{padding:'14px 20px',fontWeight:'600',textAlign:'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dbRows.sort((a,b) => a.mode.localeCompare(b.mode) || a.level - b.level).map((row, idx) => (
                    <tr key={`${row.mode}-${row.level}`} style={{
                      borderBottom:'1px solid #2e2e2e',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      transition:'all 0.15s'
                    }}>
                      <td style={{padding:'14px 20px'}}>
                        <span style={{
                          background: 'rgba(62,207,142,0.1)',
                          color: '#3ecf8e',
                          padding:'2px 8px',
                          borderRadius:'4px',
                          fontSize:'11px',
                          fontWeight:'bold',
                          border: '1px solid rgba(62,207,142,0.2)'
                        }}>
                          {row.mode === 'low' ? 'low' : 'full'}
                        </span>
                      </td>
                      <td style={{padding:'14px 20px',fontWeight:'bold',color:'white'}}>Level {row.level}</td>
                      <td style={{padding:'14px 20px'}}><span style={{color:'#3ecf8e',fontWeight:'bold'}}>{row.points}</span> points allocated</td>
                      <td style={{padding:'14px 20px'}}>{row.nodesCount} active nodes</td>
                      <td style={{padding:'14px 20px',textAlign:'right'}}>
                        <button onClick={() => { setMode(row.mode); setLevel(row.level); setActiveTab('editor'); }} style={{
                          background:'#171717',
                          color:'white',
                          border:'1px solid #2e2e2e',
                          padding:'4px 12px',
                          borderRadius:'4px',
                          cursor:'pointer',
                          fontWeight:'600',
                          fontSize:'11.5px',
                          marginRight:'8px'
                        }}>Edit</button>
                        <button onClick={() => deleteConfigFromDb(row.mode, row.level)} style={{
                          background:'rgba(234,88,12,0.1)',
                          color:'#ea580c',
                          border:'1px solid rgba(234,88,12,0.2)',
                          padding:'4px 12px',
                          borderRadius:'4px',
                          cursor:'pointer',
                          fontWeight:'600',
                          fontSize:'11.5px'
                        }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {dbRows.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{padding:'40px 0',textAlign:'center',color:'#8a8a8a',fontStyle:'italic'}}>
                        No profiles saved in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ANALYTICS & SCALING DENSITY VIEW */}
        {activeTab === 'analytics' && (
          <div style={{padding:'40px',maxWidth:'1000px'}}>
            <div style={{marginBottom:'32px'}}>
              <h2 style={{color:'white',fontWeight:'700',fontSize:'20px',margin:0}}>Project Analytics & Deployment Density</h2>
              <p style={{color:'#8a8a8a',fontSize:'13px',marginTop:'4px'}}>Inspection of deployment coverage metrics and point scaling density across low vs full HP profiles.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'20px',marginBottom:'30px'}}>
              
              <div style={{background:'#1e1e1e',border:'1px solid #2e2e2e',borderRadius:'8px',padding:'24px'}}>
                <span style={{color:'#8a8a8a',fontSize:'11px',fontWeight:'bold',textTransform:'uppercase',letterSpacing:'1.2px'}}>Database Sync Status</span>
                <div style={{display:'flex',alignItems:'baseline',gap:'10px',marginTop:'12px',marginBottom:'16px'}}>
                  <span style={{fontSize:'36px',fontWeight:'700',color:'white'}}>{dbRows.length} / 40</span>
                  <span style={{color:'#3ecf8e',fontSize:'12px',fontWeight:'bold'}}>({Math.round((dbRows.length/40)*100)}% Complete)</span>
                </div>
                <div style={{height:'6px',background:'#121212',borderRadius:'4px',overflow:'hidden',marginBottom:'12px'}}>
                  <div style={{height:'100%',width:`${(dbRows.length/40)*100}%`,background:'#3ecf8e',borderRadius:'4px'}} />
                </div>
              </div>

              <div style={{background:'#1e1e1e',border:'1px solid #2e2e2e',borderRadius:'8px',padding:'24px'}}>
                <span style={{color:'#8a8a8a',fontSize:'11px',fontWeight:'bold',textTransform:'uppercase',letterSpacing:'1.2px'}}>low_hp coverage</span>
                <div style={{display:'flex',alignItems:'baseline',gap:'10px',marginTop:'12px',marginBottom:'16px'}}>
                  <span style={{fontSize:'36px',fontWeight:'700',color:'white'}}>{lowSavedCount} / 20</span>
                </div>
                <div style={{height:'6px',background:'#121212',borderRadius:'4px',overflow:'hidden',marginBottom:'12px'}}>
                  <div style={{height:'100%',width:`${(lowSavedCount/20)*100}%`,background:'#3ecf8e',borderRadius:'4px'}} />
                </div>
              </div>

              <div style={{background:'#1e1e1e',border:'1px solid #2e2e2e',borderRadius:'8px',padding:'24px'}}>
                <span style={{color:'#8a8a8a',fontSize:'11px',fontWeight:'bold',textTransform:'uppercase',letterSpacing:'1.2px'}}>full_hp coverage</span>
                <div style={{display:'flex',alignItems:'baseline',gap:'10px',marginTop:'12px',marginBottom:'16px'}}>
                  <span style={{fontSize:'36px',fontWeight:'700',color:'white'}}>{fullSavedCount} / 20</span>
                </div>
                <div style={{height:'6px',background:'#121212',borderRadius:'4px',overflow:'hidden',marginBottom:'12px'}}>
                  <div style={{height:'100%',width:`${(fullSavedCount/20)*100}%`,background:'#3ecf8e',borderRadius:'4px'}} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SETTINGS & MAINTENANCE BANNERS */}
        {activeTab === 'settings' && (
          <div style={{padding:'40px',maxWidth:'1000px'}}>
            <div style={{marginBottom:'32px'}}>
              <h2 style={{color:'white',fontWeight:'700',fontSize:'20px',margin:0}}>Settings & Maintenance Control</h2>
              <p style={{color:'#8a8a8a',fontSize:'13px',marginTop:'4px'}}>Manage server banners, maintenance visibility, and system backup presets.</p>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'24px'}}>
              
              <div style={{background:'#1e1e1e',border:'1px solid #2e2e2e',borderRadius:'8px',padding:'24px'}}>
                <h3 style={{color:'white',fontWeight:'700',fontSize:'15px',margin:0,marginBottom:'8px'}}>Live Maintenance Announcement Banner</h3>
                <p style={{color:'#8a8a8a',fontSize:'12.5px',marginBottom:'18px'}}>Change the alert copy displayed on the client-facing website home page.</p>
                
                <div style={{display:'flex',flexDirection:'column',gap:'8px',maxWidth:'500px'}}>
                  <textarea value={maintenanceMessage} onChange={(e) => setMaintenanceMessage(e.target.value)} style={{
                    background:'#121212',
                    border:'1px solid #2e2e2e',
                    borderRadius:'6px',
                    color:'white',
                    padding:'12px',
                    fontSize:'12.5px',
                    minHeight:'80px',
                    resize:'vertical',
                    outline:'none'
                  }} />
                  <button onClick={() => showToast("Maintenance alert updated globally!")} style={{
                    background:'#3ecf8e',
                    color:'#121212',
                    border:'none',
                    borderRadius:'6px',
                    padding:'8px 16px',
                    fontWeight:'bold',
                    cursor:'pointer',
                    alignSelf:'flex-start',
                    marginTop:'8px'
                  }}>Save Announcement Banner</button>
                </div>
              </div>

              <div style={{background:'#1e1e1e',border:'1px solid #2e2e2e',borderRadius:'8px',padding:'24px'}}>
                <h3 style={{color:'white',fontWeight:'700',fontSize:'15px',margin:0,marginBottom:'8px'}}>Database Backup Export</h3>
                <p style={{color:'#8a8a8a',fontSize:'12.5px',marginBottom:'16px'}}>Export all currently synced database talent configurations to a local JSON payload.</p>
                <button onClick={() => {
                  const payload = { low: allConfigsLow, full: allConfigsFull };
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href",     dataStr     );
                  dlAnchorElem.setAttribute("download", `op-retreat-talent-configs-backup.json`);
                  dlAnchorElem.click();
                  showToast("Backup exported successfully!");
                }} style={{
                  background:'transparent',
                  color:'#3ecf8e',
                  border:'1px solid #3ecf8e',
                  borderRadius:'6px',
                  padding:'8px 16px',
                  fontWeight:'bold',
                  cursor:'pointer'
                }}>Export Full Database Backup</button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FLOATING SUCCESS/ERROR TOAST */}
      {toast && (
        <div style={{
          position:'fixed',
          bottom:'28px',
          right:'28px',
          background:'#1e1e1e',
          color:toast.ok?'#3ecf8e':'#ea580c',
          padding:'12px 24px',
          borderRadius:'8px',
          boxShadow:'0 10px 30px rgba(0,0,0,0.5)',
          fontWeight:'700',
          fontSize:'13px',
          zIndex:9999,
          border:`1px solid ${toast.ok?'rgba(62,207,142,0.2)':'rgba(234,88,12,0.2)'}`,
          display:'flex',
          alignItems:'center',
          gap:'10px',
          animation:'slideIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          <span>{toast.ok?'✓':'✕'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .talent__row { display:flex; justify-content:center; gap:60px; margin-bottom:40px; }
      `}</style>
    </div>
  );
}

function subSidebarItemStyle(isActive: boolean) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    background: isActive ? '#232323' : 'transparent',
    color: isActive ? 'white' : '#8a8a8a',
    fontSize: '12px',
    fontWeight: isActive ? '600' : '500',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.1s'
  } as const;
}

function supabaseBtnStyle(bg = '#1e1e1e', color = 'white', border = '1px solid #2e2e2e') {
  return {
    background: bg,
    color,
    border,
    borderRadius: '6px',
    padding: '6px 14px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  } as const;
}
