'use client';
import React, { useState } from 'react';
import { useApplications, transformCandidatesForUI } from '@/lib/hooks/useAdminData';
import { Chip as AChip } from './AdminViews';
import { showToast } from './Toast';
import { useCandidateStore } from './CandidateStore';

function PipelineBar({ pipeline }: any) {
  const entries = Object.entries(pipeline || {}) as [string, number][];
  const total = entries.reduce((s, [, n]) => s + n, 0);
  if (!total) return null;
  return (
    <div style={{ display:'flex', gap:2, height:6, overflow:'hidden', borderRadius:3 }}>
      {entries.map(([stage, n]) => (
        <div key={stage} title={`${stage}: ${n}`} style={{ flex: n, background: stage==='Hired'?'var(--ok)':stage==='Rejected'?'var(--err)':n===0?'transparent':'var(--ink)', minWidth: n > 0 ? 4 : 0 }}/>
      ))}
    </div>
  );
}

export function AdminRoleDetail({ role, onBack, onCandidate }: any) {
  const { data: applicationsData } = useApplications();
  const allCandidates = transformCandidatesForUI(applicationsData || []);
  
  const r = role;
  const [tab, setTab] = useState<'candidates'|'brief'|'activity'>('candidates');
  const { setStage: storeSetStage, STAGES } = useCandidateStore();
  const [stageMenuFor, setStageMenuFor] = useState<string | null>(null);

  const roleCandidates = allCandidates.filter((c: any) => c.roleId === r?.id || c.role === r?.title);
  
  // Generate activity from candidates
  const activity = roleCandidates.slice(0, 8).map((c: any) => ({
    id: c.id,
    actor: c.name,
    verb: `is at ${c.stage} stage`,
    target: r?.title || '',
    at: c.submitted
  }));

  if (!r) return (
    <div style={{ padding:40, fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--t-4)' }}>
      Role not found. <button onClick={onBack} style={{ all:'unset', cursor:'pointer', textDecoration:'underline' }}>Back to roles</button>
    </div>
  );

  const pipelineEntries = Object.entries(r.pipeline || {}) as [string, number][];
  const total = pipelineEntries.reduce((s, [, n]) => s + n, 0);

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
            <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:8, display:'flex', gap:16, flexWrap:'wrap' }}>
              <span>{r.location?.toUpperCase()}</span>
              <span>{r.workMode?.toUpperCase()}</span>
              <span>{r.salary}</span>
              <span>{r.age}D OPEN</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'flex-start' }}>
            {r.status === 'open'   && <AChip tone="ok">OPEN</AChip>}
            {r.status === 'paused' && <AChip tone="paper">PAUSED</AChip>}
            {r.status === 'hold'   && <AChip tone="paper">ON HOLD</AChip>}
            {r.focused && <AChip tone="gold">FOCUS</AChip>}
            {r.confidential && <AChip tone="plum">CONF.</AChip>}
            <button onClick={() => showToast('Paused role')} className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:11 }}>Pause</button>
            <button onClick={() => showToast('Action complete', { kind:'ok' } as any)} className="btn btn-primary" style={{ padding:'8px 14px', fontSize:11 }}>Edit role</button>
          </div>
        </div>
      </div>

      {/* Pipeline summary */}
      <div style={{ border:'1px solid var(--hair)', marginBottom:32 }}>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${pipelineEntries.length}, 1fr)` }}>
          {pipelineEntries.map(([stage, n], i) => (
            <div key={stage} style={{ padding:'16px 18px', borderRight: i < pipelineEntries.length - 1 ? '1px solid var(--hair)' : undefined }}>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color: stage==='Hired'?'var(--ok)':stage==='Rejected'?'var(--err)':'var(--t-4)', marginBottom:4 }}>{stage.toUpperCase()}</div>
              <div className="serif" style={{ fontSize:28, fontStyle:'italic', letterSpacing:'-0.02em', color: n > 0 ? 'var(--ink)' : 'var(--t-4)' }}>{n}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 18px', borderTop:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)' }}>
          <PipelineBar pipeline={r.pipeline}/>
          <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', marginTop:6 }}>{total} TOTAL · {r.recruiters} RECRUITER{r.recruiters !== 1 ? 'S' : ''} ASSIGNED · TTA {r.tta}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom:'1px solid var(--hair)', display:'flex', gap:28, marginBottom:24 }}>
        {([['candidates','Candidates'],['brief','Role Brief'],['activity','Activity']] as const).map(([k, l]) => {
          const A = tab === k;
          return (
            <button key={k} onClick={() => setTab(k as any)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'10px 0', position:'relative', color: A ? 'var(--ink)' : 'var(--t-3)', fontFamily:'var(--serif)', fontSize:18, fontStyle: A ? 'italic' : 'normal' }}>
              {l}{k==='candidates' && <span className="mono" style={{ marginLeft:8, fontSize:10, color:'var(--t-4)', letterSpacing:'.14em' }}>{roleCandidates.length}</span>}
              {A && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
            </button>
          );
        })}
      </div>

      {/* Candidates tab */}
      {tab === 'candidates' && (
        <div style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
          <div className="mono" style={{ display:'grid', gridTemplateColumns:'60px 1.4fr 130px 1fr 110px 110px 32px', gap:16, padding:'12px 20px', borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)', fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>
            <span>NO.</span><span>CANDIDATE</span><span>STAGE</span><span>RECRUITER</span><span>SUBMITTED</span><span>ACTION</span><span/>
          </div>
          {roleCandidates.length === 0 && (
            <div style={{ padding:'48px 20px', textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--t-4)' }}>No candidates on this role yet.</div>
          )}
          {roleCandidates.map((c: any, i: number) => {
            const visible = ['Sent to Client','On-site','Offer','Hired'].includes(c.stage);
            const menuOpen = stageMenuFor === c.id;
            return (
              <div key={c.id} style={{ display:'grid', gridTemplateColumns:'60px 1.4fr 130px 1fr 110px 110px 32px', gap:16, padding:'16px 20px', borderBottom: i < roleCandidates.length - 1 ? '1px solid var(--hair)' : 'none', alignItems:'center' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in oklch, var(--ink) 2%, transparent)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{c.num}</span>
                <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                  <div style={{ width:32, height:32, borderRadius:999, background:'var(--ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:12, fontStyle:'italic', flexShrink:0 }}>{c.initials}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', letterSpacing:'-0.01em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.name}{c.flagged && <span className="mono" style={{ fontSize:9, color:'var(--err)', marginLeft:8 }}>⚑</span>}
                    </div>
                    <div className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)', marginTop:2 }}>{c.current?.toUpperCase()} · {c.years}Y</div>
                  </div>
                </button>
                <div style={{ position:'relative' }}>
                  <button onClick={() => setStageMenuFor(menuOpen ? null : c.id)} style={{ appearance:'none', cursor:'pointer', border:'1px solid var(--hair)', background:'#fff', padding:'5px 10px', borderRadius:999, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.14em', color: c.stage==='Hired'?'var(--ok)':c.stage==='Rejected'?'var(--err)':'var(--t-2)', display:'inline-flex', alignItems:'center', gap:5 }}>
                    {c.stage.toUpperCase()} <span style={{ fontSize:9, opacity:.6 }}>▾</span>
                  </button>
                  {menuOpen && (
                    <>
                      <div onClick={() => setStageMenuFor(null)} style={{ position:'fixed', inset:0, zIndex:50 }}/>
                      <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:51, background:'#fff', border:'1px solid var(--hair-strong)', borderRadius:8, boxShadow:'0 12px 32px rgba(0,0,0,.12)', padding:'6px 0', minWidth:180 }}>
                        {STAGES.map((s: string) => (
                          <button key={s} onClick={() => { storeSetStage(c.id, s); setStageMenuFor(null); }} style={{ appearance:'none', border:0, background: s===c.stage?'var(--paper-2)':'transparent', width:'100%', textAlign:'left', cursor:'pointer', padding:'8px 14px', fontFamily:'var(--serif)', fontSize:14, color: s===c.stage?'var(--t-1)':'var(--t-2)', fontStyle: s===c.stage?'italic':'normal' }}>{s}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <span style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'var(--t-2)' }}>{c.recruiter}</span>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{c.submitted?.toUpperCase()}</span>
                <div>
                  {!visible && c.stage !== 'Rejected' ? (
                    <button onClick={() => storeSetStage(c.id, 'Sent to Client')} style={{ appearance:'none', cursor:'pointer', border:'1px solid var(--plum-700)', background:'var(--plum-700)', color:'var(--paper)', padding:'5px 10px', borderRadius:999, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:11, whiteSpace:'nowrap' }}>→ Send</button>
                  ) : <span className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>—</span>}
                </div>
                <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', fontFamily:'var(--mono)', fontSize:12, color:'var(--t-4)', textAlign:'right' }}>→</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Brief tab */}
      {tab === 'brief' && (
        <div style={{ maxWidth:760 }}>
          <div style={{ border:'1px solid var(--hair)', borderRadius:2, marginBottom:24 }}>
            {[['ROLE',r.title],['ORGANIZATION',r.org],['LOCATION',r.location],['WORK MODE',r.workMode],['SALARY',r.salary],['RECRUITERS',r.recruiters+' assigned'],['PRIORITY',r.priority?.toUpperCase()],['AGE',r.age+'d open']].map(([l,v],i,arr) => (
              <div key={l} style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:14, padding:'12px 16px', borderBottom: i<arr.length-1 ? '1px solid var(--hair)' : undefined, alignItems:'baseline' }}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{l}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>{v}</span>
              </div>
            ))}
          </div>
          {r.skills && r.skills.length > 0 && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:8 }}>§ SKILLS</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {r.skills.map((s: string) => <AChip key={s} tone="paper">{s}</AChip>)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Activity tab */}
      {tab === 'activity' && (
        <div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:14 }}>§ RECENT ACTIVITY</div>
          <div style={{ borderTop:'1px solid var(--hair)' }}>
            {activity.length === 0 && <div style={{ padding:'20px 0', color:'var(--t-4)', fontStyle:'italic' }}>No activity yet for this role.</div>}
            {activity.map((a: any) => (
              <div key={a.id} style={{ padding:'16px 0', borderBottom:'1px solid var(--hair)', display:'grid', gridTemplateColumns:'100px 1fr', gap:16, alignItems:'baseline' }}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{a.at?.toUpperCase()}</span>
                <div>
                  <span style={{ fontFamily:'var(--serif)', fontSize:16 }}>{a.actor}</span>
                  <span style={{ color:'var(--t-4)', margin:'0 8px' }}>·</span>
                  <span style={{ color:'var(--t-3)', fontSize:14 }}>{a.verb}</span>
                  <span style={{ color:'var(--t-4)', margin:'0 8px' }}>—</span>
                  <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:16 }}>{a.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoleDetail;
