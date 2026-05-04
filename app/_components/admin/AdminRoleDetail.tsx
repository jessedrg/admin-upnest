'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useApplications, useRecruiters, transformCandidatesForUI, PIPELINE_STAGES } from '@/lib/hooks/useAdminData';
import { Chip as AChip, Skeleton } from './AdminViews';
import { showToast } from './Toast';
import { useCandidateStore } from './CandidateStore';
import { createClient } from '@/lib/supabase/client';

// Skeleton for the role detail page
function RoleDetailSkeleton() {
  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      <Skeleton width={120} height={12} style={{ marginBottom: 20 }} />
      <Skeleton width="60%" height={48} style={{ marginBottom: 8 }} />
      <div style={{ display:'flex', gap:16, marginBottom:32 }}>
        <Skeleton width={80} height={14} />
        <Skeleton width={60} height={14} />
        <Skeleton width={120} height={14} />
        <Skeleton width={70} height={14} />
      </div>
      {/* KPI skeleton */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:0, border:'1px solid var(--hair)', marginBottom:32 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding:'20px 24px', borderRight: i < 4 ? '1px solid var(--hair)' : undefined }}>
            <Skeleton width={80} height={10} style={{ marginBottom: 10 }} />
            <Skeleton width={50} height={32} style={{ marginBottom: 6 }} />
            <Skeleton width={60} height={10} />
          </div>
        ))}
      </div>
      {/* Tabs skeleton */}
      <div style={{ display:'flex', gap:28, marginBottom:24, borderBottom:'1px solid var(--hair)', paddingBottom:10 }}>
        <Skeleton width={80} height={20} />
        <Skeleton width={100} height={20} />
        <Skeleton width={70} height={20} />
        <Skeleton width={90} height={20} />
        <Skeleton width={60} height={20} />
        <Skeleton width={80} height={20} />
      </div>
      {/* Pipeline kanban skeleton */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton width={70} height={14} style={{ marginBottom: 12 }} />
            {Array.from({ length: 2 }).map((_, j) => (
              <Skeleton key={j} width="100%" height={100} style={{ marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Candidate avatar with profile image fallback
function CandidateAvatar({ c, size = 36 }: { c: any; size?: number }) {
  if (c.profileImage) {
    return (
      <img 
        src={c.profileImage} 
        alt={c.name} 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: 999, 
          objectFit: 'cover', 
          flexShrink: 0, 
          border: '2px solid var(--hair)' 
        }}
      />
    );
  }
  return (
    <div style={{ 
      width: size, 
      height: size, 
      borderRadius: 999, 
      background: 'var(--ink)', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'var(--serif)', 
      fontSize: size * 0.36, 
      fontStyle: 'italic', 
      flexShrink: 0 
    }}>
      {c.initials}
    </div>
  );
}

// KPI Tile component
function KpiTile({ label, value, sub, trend }: { label: string; value: string | number; sub?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div style={{ padding: '20px 24px', borderRight: '1px solid var(--hair)' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)', marginBottom: 8 }}>{label}</div>
      <div className="serif" style={{ fontSize: 32, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <div className="mono" style={{ fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// Kanban Card component with drag support
function KanbanCard({ c, onClick, onDragStart }: { c: any; onClick?: () => void; onDragStart?: (e: React.DragEvent) => void }) {
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ 
        border: '1px solid var(--hair)', 
        borderRadius: 8, 
        padding: '14px 16px', 
        background: '#fff', 
        marginBottom: 8,
        cursor: 'grab',
        transition: 'box-shadow .15s, border-color .15s, opacity .15s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--hair-strong)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--hair)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <CandidateAvatar c={c} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', letterSpacing: '-0.01em' }}>{c.name}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--t-4)', marginTop: 2 }}>
            {c.current ? c.current.toUpperCase() : ''} {c.years > 0 && `· ${c.years}Y`}
          </div>
        </div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--t-5)' }}>⋯</span>
      </div>
      {c.headline && (
        <div className="serif" style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--t-3)', marginTop: 10, lineHeight: 1.4 }}>
          &quot;{c.headline.length > 60 ? c.headline.substring(0, 60) + '...' : c.headline}&quot;
        </div>
      )}
    </div>
  );
}

// Map UI stage names back to DB interview_status values
function stageToInterviewStatus(stage: string): string {
  const mapping: Record<string, string> = {
    'New': 'new',
    'Screening': 'screening',
    'Phone': 'phone_interview',
    'Sent to Client': 'sent_to_client',
    'Final Interview': 'final_interview',
    'Hired': 'hired',
    'Rejected': 'rejected',
  };
  return mapping[stage] || 'new';
}

// Pipeline Kanban Board with drag & drop
function PipelineBoard({ candidates, onCandidate, onStageChange }: { 
  candidates: any[]; 
  onCandidate?: (c: any) => void;
  onStageChange?: (candidateId: string, newStage: string) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  
  // Exclude Rejected from kanban view
  const visibleStages = PIPELINE_STAGES.filter(s => s !== 'Rejected');
  
  const byStage = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    visibleStages.forEach(s => { grouped[s] = []; });
    candidates.forEach(c => {
      if (c.stage && grouped[c.stage]) {
        grouped[c.stage].push(c);
      }
    });
    return grouped;
  }, [candidates]);

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    setDraggedId(candidateId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', candidateId);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDropTarget(stage);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('text/plain');
    if (candidateId && onStageChange) {
      onStageChange(candidateId, stage);
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleStages.length}, minmax(180px, 1fr))`, gap: 16, overflowX: 'auto', paddingBottom: 20 }}>
      {visibleStages.map(stage => {
        const isClientVisible = ['Sent to Client', 'Final Interview', 'Hired'].includes(stage);
        const stageCount = byStage[stage]?.length || 0;
        const isDropping = dropTarget === stage;
        return (
          <div 
            key={stage} 
            style={{ minWidth: 180 }}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="serif" style={{ 
              fontSize: 16, 
              fontStyle: 'italic', 
              marginBottom: 12, 
              color: isClientVisible ? 'var(--plum-700)' : 'var(--t-2)'
            }}>
              {stage}
            </div>
            <div style={{ 
              minHeight: 100, 
              padding: 4,
              borderRadius: 8,
              border: isDropping ? '2px dashed var(--plum-400)' : '2px dashed transparent',
              background: isDropping ? 'var(--plum-50)' : 'transparent',
              transition: 'all .15s ease'
            }}>
              {stageCount === 0 ? (
                <div className="mono" style={{ fontSize: 10, color: 'var(--t-5)', textAlign: 'center', padding: 20 }}>—</div>
              ) : (
                byStage[stage].map(c => (
                  <KanbanCard 
                    key={c.id} 
                    c={c} 
                    onClick={() => onCandidate?.(c)}
                    onDragStart={(e) => handleDragStart(e, c.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminRoleDetail({ role, onBack, onCandidate }: any) {
  const { data: applicationsData, isLoading: appsLoading, mutate: mutateApps } = useApplications();
  const { data: recruitersData, isLoading: recruitersLoading } = useRecruiters();
  
  const recruitersMap = useMemo(() => {
    const map = new Map<string, any>();
    (recruitersData || []).forEach((r: any) => map.set(r.id, r));
    return map;
  }, [recruitersData]);
  
  const allCandidates = useMemo(() => 
    transformCandidatesForUI(applicationsData || [], recruitersMap),
    [applicationsData, recruitersMap]
  );
  
  const isLoading = appsLoading || recruitersLoading;
  
  const r = role;
  const [tab, setTab] = useState<'pipeline'|'candidates'|'activity'|'comments'|'emails'|'brief'>('pipeline');
  const { setStage: storeSetStage, STAGES } = useCandidateStore();
  const [stageMenuFor, setStageMenuFor] = useState<string | null>(null);

  // Handler to update candidate stage in Supabase
  const handleStageChange = useCallback(async (candidateId: string, newStage: string) => {
    const supabase = createClient();
    const newInterviewStatus = stageToInterviewStatus(newStage);
    
    // Optimistic update
    const candidate = allCandidates.find((c: any) => c.id === candidateId);
    if (candidate) {
      showToast(`Moving ${candidate.name} to ${newStage}...`);
    }
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          interview_status: newInterviewStatus,
          status_entered_at: new Date().toISOString()
        })
        .eq('id', candidateId);
      
      if (error) throw error;
      
      // Refresh data
      mutateApps();
      showToast(`Moved to ${newStage}`);
    } catch (err) {
      console.error('[v0] Error updating stage:', err);
      showToast('Failed to update stage');
    }
  }, [allCandidates, mutateApps]);

  const roleCandidates = allCandidates.filter((c: any) => c.roleId === r?.id || c.role === r?.title);
  
  // Calculate KPIs
  const inPipeline = roleCandidates.filter((c: any) => !['Hired', 'Rejected'].includes(c.stage)).length;
  const hired = roleCandidates.filter((c: any) => c.stage === 'Hired').length;
  const rejected = roleCandidates.filter((c: any) => c.stage === 'Rejected').length;
  const conversion = roleCandidates.length > 0 ? Math.round((hired / roleCandidates.length) * 100) : 0;
  
  // Calculate age (days since oldest candidate)
  const oldestDate = roleCandidates.reduce((oldest: Date | null, c: any) => {
    const date = c.submittedAt ? new Date(c.submittedAt) : null;
    if (!date) return oldest;
    if (!oldest) return date;
    return date < oldest ? date : oldest;
  }, null);
  const ageDays = oldestDate ? Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Generate activity
  const activity = roleCandidates.slice(0, 12).map((c: any) => ({
    id: c.id,
    actor: c.name,
    verb: `moved to ${c.stage}`,
    target: r?.title || '',
    at: c.submitted
  }));

  if (isLoading) return <RoleDetailSkeleton />;

  if (!r) return (
    <div style={{ padding:40, fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--t-4)' }}>
      Role not found. <button onClick={onBack} style={{ all:'unset', cursor:'pointer', textDecoration:'underline' }}>Back to roles</button>
    </div>
  );

  const tabs = [
    { k: 'pipeline', l: 'Pipeline', n: inPipeline },
    { k: 'candidates', l: 'Candidates', n: roleCandidates.length },
    { k: 'activity', l: 'Activity', n: activity.length },
    { k: 'comments', l: 'Comments', n: 0 },
    { k: 'emails', l: 'Emails', n: 0 },
    { k: 'brief', l: 'Role brief', n: null },
  ];

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      {/* Back + header */}
      <div style={{ marginBottom:32 }}>
        <button onClick={onBack} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
          ← BACK TO ROLES
        </button>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:20, flexWrap:'wrap' }}>
          <div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>{r.num} · {r.org?.toUpperCase()}</div>
            <h1 className="serif" style={{ fontSize:'clamp(36px, 4.5vw, 52px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:8 }}>{r.title}</h1>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <button className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:11 }}>Edit role</button>
          </div>
        </div>
        {/* Tags row */}
        <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
          <span style={{ padding:'6px 14px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em' }}>{r.status?.toUpperCase() || 'OPEN'}</span>
          <span style={{ padding:'6px 14px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em' }}>{r.workMode?.toUpperCase() || 'REMOTE'}</span>
          <span style={{ padding:'6px 14px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em' }}>{r.location?.toUpperCase() || 'REMOTE'}</span>
          {r.salary && <span style={{ padding:'6px 14px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em' }}>{r.salary}</span>}
          {r.fee && <span style={{ padding:'6px 14px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em' }}>FEE {r.fee}</span>}
          <span style={{ padding:'6px 14px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.12em' }}>{r.recruiters || 0} RECRUITERS</span>
        </div>
      </div>

      {/* KPI Tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', border:'1px solid var(--hair)', borderRight:0, marginBottom:32 }}>
        <KpiTile label="CANDIDATES" value={roleCandidates.length} sub={`${hired} hired · ${rejected} rej.`} />
        <KpiTile label="IN PIPELINE" value={inPipeline} sub="" />
        <KpiTile label="AGE" value={ageDays > 0 ? `${ageDays}d` : '—'} sub={ageDays < 30 ? 'ON TRACK' : 'AGING'} />
        <KpiTile label="TIME TO ADD" value="—" sub="AVG" />
        <div style={{ padding: '20px 24px' }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)', marginBottom: 8 }}>CONVERSION</div>
          <div className="serif" style={{ fontSize: 32, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1 }}>{conversion}%</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)', marginTop: 6 }}>TO HIRE</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--hair)', display:'flex', gap:28, marginBottom:24 }}>
        {tabs.map(t => {
          const A = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k as any)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'10px 0', position:'relative', color: A ? 'var(--ink)' : 'var(--t-3)', fontFamily:'var(--serif)', fontSize:18, fontStyle: A ? 'italic' : 'normal', letterSpacing:'-0.01em' }}>
              {t.l}
              {t.n !== null && <span className="mono" style={{ marginLeft:8, fontSize:10, color:'var(--t-4)', letterSpacing:'.14em' }}>{t.n}</span>}
              {A && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
            </button>
          );
        })}
      </div>

      {/* Pipeline tab - Kanban Board */}
      {tab === 'pipeline' && (
        <PipelineBoard candidates={roleCandidates} onCandidate={onCandidate} onStageChange={handleStageChange} />
      )}

      {/* Candidates tab - Table View */}
      {tab === 'candidates' && (
        <div style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
          <div className="mono" style={{ display:'grid', gridTemplateColumns:'60px 1.4fr 130px 1fr 110px 110px 32px', gap:16, padding:'12px 20px', borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)', fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>
            <span>NO.</span><span>CANDIDATE</span><span>STAGE</span><span>RECRUITER</span><span>SUBMITTED</span><span>ACTION</span><span/>
          </div>
          {roleCandidates.length === 0 && (
            <div style={{ padding:'48px 20px', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--t-4)' }}>No candidates on this role yet.</div>
          )}
          {roleCandidates.map((c: any, i: number) => {
            const visible = ['Sent to Client','Final Interview','Hired'].includes(c.stage);
            const menuOpen = stageMenuFor === c.id;
            return (
              <div key={c.id} style={{ display:'grid', gridTemplateColumns:'60px 1.4fr 130px 1fr 110px 110px 32px', gap:16, padding:'16px 20px', borderBottom: i < roleCandidates.length - 1 ? '1px solid var(--hair)' : 'none', alignItems:'center', transition:'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in oklch, var(--ink) 2%, transparent)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{c.num}</span>
                <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                  <CandidateAvatar c={c} size={36} />
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', letterSpacing:'-0.01em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8 }}>
                      {c.name}
                      {visible && (
                        <span className="mono" style={{ fontSize:8, color:'var(--plum-700)', letterSpacing:'.14em', padding:'2px 6px', border:'1px solid var(--plum-200)', borderRadius:4, background:'var(--plum-50)' }}>CLIENT</span>
                      )}
                    </div>
                    <div className="mono" style={{ fontSize:9, letterSpacing:'.12em', color:'var(--t-4)', marginTop:2 }}>
                      {c.current ? c.current.toUpperCase() : ''} {c.years > 0 && `· ${c.years}Y`}
                    </div>
                  </div>
                </button>
                <div style={{ position:'relative' }}>
                  <button onClick={() => setStageMenuFor(menuOpen ? null : c.id)} style={{ appearance:'none', cursor:'pointer', border:'1px solid var(--hair)', background:'#fff', padding:'5px 10px', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.14em', color: c.stage==='Hired' ? 'var(--ok)' : c.stage==='Rejected' ? 'var(--err)' : visible ? 'var(--plum-700)' : 'var(--t-2)', display:'inline-flex', alignItems:'center', gap:5 }}>
                    {c.stage.toUpperCase()} <span style={{ fontSize:9, opacity:.6 }}>▾</span>
                  </button>
                  {menuOpen && (
                    <>
                      <div onClick={() => setStageMenuFor(null)} style={{ position:'fixed', inset:0, zIndex:50 }}/>
                      <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:51, background:'#fff', border:'1px solid var(--hair-strong)', borderRadius:8, boxShadow:'0 12px 32px rgba(0,0,0,.12)', padding:'6px 0', minWidth:200 }}>
                        <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)', padding:'6px 14px 8px' }}>MOVE TO STAGE</div>
                        {STAGES.map((s: string) => {
                          const isActive = s === c.stage;
                          const isVisible = ['Sent to Client', 'Final Interview', 'Hired'].includes(s);
                          return (
                            <button key={s} onClick={() => { handleStageChange(c.id, s); setStageMenuFor(null); }} style={{ appearance:'none', border:0, background: isActive ? 'var(--paper-2)' : 'transparent', width:'100%', textAlign:'left', cursor:'pointer', padding:'8px 14px', display:'flex', alignItems:'center', gap:10, fontFamily:'var(--serif)', fontSize:14, color: isActive ? 'var(--t-1)' : 'var(--t-2)', fontStyle: isActive ? 'italic' : 'normal' }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--paper-2)'; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                              <span style={{ width:6, height:6, borderRadius:999, background: isActive ? 'var(--ink)' : isVisible ? 'var(--plum-600)' : 'var(--hair-strong)' }}/>
                              <span style={{ flex:1 }}>{s}</span>
                              {isVisible && <span className="mono" style={{ fontSize:8, color:'var(--plum-700)', letterSpacing:'.14em' }}>CLIENT</span>}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                <span style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'var(--t-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.recruiterName || '—'}</span>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{c.submitted?.toUpperCase()}</span>
                <div>
                  {!visible && c.stage !== 'Rejected' ? (
                    <button onClick={() => handleStageChange(c.id, 'Sent to Client')} style={{ appearance:'none', cursor:'pointer', border:'1px solid var(--plum-700)', background:'var(--plum-700)', color:'var(--paper)', padding:'5px 10px', borderRadius:999, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:11, whiteSpace:'nowrap' }}>→ Send</button>
                  ) : <span className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>—</span>}
                </div>
                <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', fontFamily:'var(--mono)', fontSize:12, color:'var(--t-4)', textAlign:'right' }}>→</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <div style={{ maxWidth:700 }}>
          {activity.length === 0 ? (
            <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--t-4)' }}>No activity yet.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {activity.map((a: any, i: number) => (
                <div key={a.id} style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:16, padding:'14px 0', borderBottom: i < activity.length-1 ? '1px solid var(--hair)' : undefined }}>
                  <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{a.at?.toUpperCase()}</span>
                  <span style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic' }}>
                    <strong>{a.actor}</strong> {a.verb}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments tab */}
      {tab === 'comments' && (
        <div style={{ maxWidth:700 }}>
          <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--t-4)' }}>No comments yet.</div>
        </div>
      )}

      {/* Emails tab */}
      {tab === 'emails' && (
        <div style={{ maxWidth:700 }}>
          <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--t-4)' }}>No emails sent yet.</div>
        </div>
      )}

      {/* Brief tab */}
      {tab === 'brief' && (
        <div style={{ maxWidth:760 }}>
          <div style={{ border:'1px solid var(--hair)', borderRadius:2, marginBottom:24 }}>
            {[
              ['ROLE', r.title],
              ['ORGANIZATION', r.org],
              ['LOCATION', r.location],
              ['WORK MODE', r.workMode],
              ['SALARY', r.salary],
              ['RECRUITERS', (r.recruiters || 0) + ' assigned'],
              ['PRIORITY', r.priority?.toUpperCase() || 'MEDIUM'],
              ['OPENED', r.opened?.toUpperCase() || 'RECENTLY']
            ].map(([l, v], i, arr) => (
              <div key={l} style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:14, padding:'12px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--hair)' : undefined, alignItems:'baseline' }}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{l}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
          {r.skills && r.skills.length > 0 && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:8 }}>§ SKILLS</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                {r.skills.map((s: string) => (
                  <span key={s} style={{ padding:'5px 12px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.08em' }}>{s}</span>
                ))}
              </div>
            </>
          )}
          {r.description && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:8 }}>§ DESCRIPTION</div>
              <p className="serif" style={{ fontSize:15, lineHeight:1.7, color:'var(--t-2)', fontStyle:'italic', textWrap:'pretty' }}>{r.description}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
