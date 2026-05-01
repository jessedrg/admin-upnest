'use client';
import React, { useState } from 'react';
import { useApplications, transformCandidatesForUI } from '@/lib/hooks/useAdminData';
import Icons from './Icons';
import { KpiTile as BKpi, SkeletonStats, SkeletonTable } from './AdminViews';
import { useCandidateStore } from './CandidateStore';

const STAGES = ['New', 'Screening', 'Phone', 'Technical', 'Sent to Client', 'On-site', 'Offer', 'Hired', 'Rejected'];

export function AdminCandidates({ onCandidate }: any) {
  const { data: applicationsData, isLoading } = useApplications();
  const allCandidates = transformCandidatesForUI(applicationsData || []);
  
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('all');
  const [orgSel, setOrgSel] = useState('all');
  const [stageMenuFor, setStageMenuFor] = useState<string | null>(null);
  const { setStage: storeSetStage, STAGES: storeStages } = useCandidateStore();

  const candidates = allCandidates.filter((c: any) => {
    if (stage !== 'all' && c.stage !== stage) return false;
    if (orgSel !== 'all' && c.org !== orgSel) return false;
    if (q && !(c.name + ' ' + c.role + ' ' + c.org + ' ' + (c.current || '')).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const orgs = ['all', ...new Set(allCandidates.map((c: any) => c.org as string).filter(Boolean))];

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · CANDIDATES</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          Every candidate,<br/><span style={{ color:'var(--t-4)' }}>across every role.</span>
        </h1>
      </div>

      {isLoading ? (
        <>
          <SkeletonStats count={5} />
          <SkeletonTable rows={8} cols={7} />
        </>
      ) : (
        <>
          <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:32, flexWrap:'wrap' }}>
            <BKpi label="TOTAL"   value={allCandidates.length}/>
            <BKpi label="HIRED"   value={allCandidates.filter((c: any) => c.stage === 'Hired').length}/>
            <BKpi label="IN PIPE" value={allCandidates.filter((c: any) => c.stage !== 'Hired' && c.stage !== 'Rejected').length}/>
            <BKpi label="SAVED"   value={allCandidates.filter((c: any) => c.saved).length}/>
            <BKpi label="FLAGGED" value={allCandidates.filter((c: any) => c.flagged).length}/>
          </div>

      <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:22, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', minWidth:260 }}>
          <Icons.Search size={14}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search candidate, role, company…"
            style={{ border:0, outline:'none', background:'transparent', fontSize:13, width:'100%', fontFamily:'var(--sans)' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>STAGE</span>
          <select value={stage} onChange={e => setStage(e.target.value)} style={{ border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', fontSize:12, background:'#fff', fontFamily:'var(--sans)' }}>
            <option value="all">All</option>
            {STAGES.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>ORG</span>
          <select value={orgSel} onChange={e => setOrgSel(e.target.value)} style={{ border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', fontSize:12, background:'#fff', fontFamily:'var(--sans)' }}>
            {orgs.map(o => <option key={o} value={o}>{o === 'all' ? 'All orgs' : o}</option>)}
          </select>
        </div>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginLeft:'auto' }}>{candidates.length} RESULTS</div>
      </div>

      <div style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
        <div className="mono" style={{ display:'grid', gridTemplateColumns:'70px 1.4fr 1fr 150px 1fr 110px 110px 32px', gap:16, padding:'12px 20px', borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)', fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>
          <span>NO.</span><span>CANDIDATE</span><span>ROLE · ORG</span><span>STAGE</span><span>RECRUITER</span><span>SUBMITTED</span><span>ACTION</span><span/>
        </div>
        {candidates.map((c: any, i: number) => {
          const stageMenuOpen = stageMenuFor === c.id;
          const visible = ['Sent to Client','On-site','Offer','Hired'].includes(c.stage);
          return (
            <div key={c.id} style={{ display:'grid', gridTemplateColumns:'70px 1.4fr 1fr 150px 1fr 110px 110px 32px', gap:16, padding:'16px 20px', borderBottom: i < candidates.length - 1 ? '1px solid var(--hair)' : 'none', alignItems:'center', position:'relative' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in oklch, var(--ink) 2%, transparent)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)', cursor:'pointer' }} onClick={() => onCandidate && onCandidate(c)}>{c.num}</span>
              <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                <div style={{ width:32, height:32, borderRadius:999, background:'var(--ink)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:12, fontStyle:'italic', flexShrink:0 }}>{c.initials}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {c.name}
                    {c.flagged && <span className="mono" style={{ fontSize:9, color:'var(--err)', marginLeft:8, letterSpacing:'.14em' }}>⚑</span>}
                    {visible && <span className="mono" style={{ fontSize:8, color:'var(--plum-700)', marginLeft:8, letterSpacing:'.16em', padding:'2px 6px', border:'1px solid var(--plum-200)', borderRadius:4 }}>CLIENT</span>}
                  </div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)', marginTop:2 }}>{c.current.toUpperCase()} · {c.years}Y</div>
                </div>
              </button>
              <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', minWidth:0 }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:15, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.role}</div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)', marginTop:2 }}>{c.org.toUpperCase()}</div>
              </button>
              <div style={{ position:'relative' }}>
                <button onClick={() => setStageMenuFor(stageMenuOpen ? null : c.id)} style={{ appearance:'none', cursor:'pointer', border:'1px solid var(--hair)', background:'#fff', padding:'5px 10px', borderRadius:999, display:'inline-flex', alignItems:'center', gap:6, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.14em', color: c.stage==='Hired'?'var(--ok)':c.stage==='Rejected'?'var(--err)':'var(--t-2)' }}>
                  {c.stage.toUpperCase()} <span style={{ fontSize:9, opacity:.6 }}>▾</span>
                </button>
                {stageMenuOpen && (
                  <>
                    <div onClick={() => setStageMenuFor(null)} style={{ position:'fixed', inset:0, zIndex:50 }}/>
                    <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:51, background:'#fff', border:'1px solid var(--hair-strong)', borderRadius:8, boxShadow:'0 12px 32px rgba(0,0,0,.12)', padding:'6px 0', minWidth:200 }}>
                      <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)', padding:'6px 14px 8px' }}>MOVE TO STAGE</div>
                      {STAGES.map((s: string) => (
                        <button key={s} onClick={() => { storeSetStage(c.id, s); setStageMenuFor(null); }} style={{ appearance:'none', border:0, background: s===c.stage ? 'var(--paper-2)' : 'transparent', width:'100%', textAlign:'left', cursor:'pointer', padding:'8px 14px', fontFamily:'var(--serif)', fontSize:14, color: s===c.stage ? 'var(--t-1)' : 'var(--t-2)', fontStyle: s===c.stage ? 'italic' : 'normal' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'var(--t-2)' }}>{c.recruiter}</button>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{c.submitted.toUpperCase()}</span>
              <div>
                {!visible && c.stage !== 'Rejected' ? (
                  <button onClick={() => storeSetStage(c.id, 'Sent to Client')} style={{ appearance:'none', cursor:'pointer', border:'1px solid var(--plum-700)', background:'var(--plum-700)', color:'var(--paper)', padding:'5px 10px', borderRadius:999, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:11, whiteSpace:'nowrap' }}>→ Send</button>
                ) : <span className="mono" style={{ fontSize:9, letterSpacing:'.16em', color:'var(--t-4)' }}>—</span>}
              </div>
              <button onClick={() => onCandidate && onCandidate(c)} style={{ all:'unset', cursor:'pointer', fontFamily:'var(--mono)', fontSize:12, color:'var(--t-4)', textAlign:'right' }}>→</button>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}
export default AdminCandidates;
