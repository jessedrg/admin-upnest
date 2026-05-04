'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoles, useApplications, useFocusedRoles, transformRolesForUI } from '@/lib/hooks/useAdminData';
import Icons from './Icons';
import { KpiTile as AKpi, SectionTitle as ASec, Hairline as AHair, Chip as AChip, SkeletonStats, SkeletonTable } from './AdminViews';
import { showToast } from './Toast';

// Helper to get initials from company name
function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// Color palette for company logos
const LOGO_COLORS = ['#1B1A2E','#3C8B72','#A65535','#7B5CB4','#C44A4A','#D8A33C','#2D5A87','#8B4513'];
function getLogoColor(name: string): string {
  const hash = Math.abs((name || '').split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0));
  return LOGO_COLORS[hash % LOGO_COLORS.length];
}

const apInput: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid var(--hair)', background:'#fff', borderRadius:2, fontFamily:'var(--serif)', fontSize:14, outline:'none' };

function ApField({ label, children }: any) {
  return (
    <div>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function RoleActionMenu({ role, onClose, onAction }: any) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50 }}/>
      <div style={{ position:'absolute', right:0, top:'100%', zIndex:51, background:'#fff', border:'1px solid var(--hair-strong)', borderRadius:8, boxShadow:'0 12px 32px rgba(0,0,0,.12)', padding:'6px 0', minWidth:180 }}>
        {role.status === 'draft'  && <MenuItem onClick={() => onAction('publish')}>Publish role</MenuItem>}
        {role.status === 'open'   && <MenuItem onClick={() => onAction('unpublish')}>Unpublish</MenuItem>}
        {role.status === 'open'   && <MenuItem onClick={() => onAction('pause')}>Pause</MenuItem>}
        {role.status !== 'hold'   && <MenuItem onClick={() => onAction('hold')}>Put on hold</MenuItem>}
        {(role.status === 'paused' || role.status === 'hold') && <MenuItem onClick={() => onAction('resume')}>Resume</MenuItem>}
        <div style={{ height:1, background:'var(--hair)', margin:'4px 0' }}/>
        <MenuItem onClick={() => onAction('focus')}>{role.focused ? 'Unmark focus' : 'Mark as focus'}</MenuItem>
        <MenuItem onClick={() => onAction('high')}>Priority: high</MenuItem>
        <MenuItem onClick={() => onAction('med')}>Priority: medium</MenuItem>
        <MenuItem onClick={() => onAction('low')}>Priority: low</MenuItem>
        <div style={{ height:1, background:'var(--hair)', margin:'4px 0' }}/>
        <MenuItem onClick={() => onAction('dup')}>Duplicate</MenuItem>
        <MenuItem onClick={() => onAction('archive')} style={{ color:'var(--err)' }}>Archive</MenuItem>
      </div>
    </>
  );
}

function MenuItem({ onClick, children, style = {} }: any) {
  return (
    <button onClick={onClick} style={{ appearance:'none', border:0, background:'transparent', width:'100%', textAlign:'left', cursor:'pointer', padding:'8px 14px', fontFamily:'var(--serif)', fontSize:14, color:'var(--t-2)', display:'block', ...style }}>
      {children}
    </button>
  );
}

function BenchmarkCard({ b }: any) {
  const [expanded, setExpanded] = useState(false);
  const exp = b.experience || [];
  const initials = b.name?.split(' ').map((p: string) => p[0]).slice(0, 2).join('') || '';
  const COLORS = ['#1B1A2E','#3C8B72','#A65535','#7B5CB4','#C44A4A','#D8A33C'];
  const col = COLORS[Math.abs(b.name?.split('').reduce((h: number, c: string) => (h*31 + c.charCodeAt(0))|0, 0) || 0) % COLORS.length];

  return (
    <div style={{ border:'1px solid var(--hair)', borderRadius:10, background:'#fff', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background: col, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:13, flexShrink:0 }}>{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', letterSpacing:'-0.01em' }}>{b.name}</div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{b.title?.toUpperCase()} · {b.company?.toUpperCase()}</div>
          {b.why && <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--t-3)', marginTop:4 }}>"{b.why}"</div>}
        </div>
        <button onClick={() => setExpanded(e => !e)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:12, fontFamily:'var(--mono)', letterSpacing:'.12em' }}>
          {expanded ? 'LESS' : 'MORE'}
        </button>
      </div>
      {expanded && exp.length > 0 && (
        <div style={{ padding:'0 16px 14px', borderTop:'1px solid var(--hair)' }}>
          <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)', padding:'10px 0 6px' }}>EXPERIENCE</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {exp.slice(0, 4).map((e: any, i: number) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:8, fontSize:13 }}>
                <div>
                  <span style={{ fontFamily:'var(--serif)', fontStyle:'italic' }}>{e.title}</span>
                  <span style={{ color:'var(--t-4)', margin:'0 6px' }}>at</span>
                  <span style={{ fontFamily:'var(--serif)' }}>{e.company}</span>
                </div>
                <span className="mono" style={{ fontSize:10, color:'var(--t-4)', whiteSpace:'nowrap' }}>{e.years}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoleSubmittalModal({ s, onClose, onApprove, onReject }: any) {
  const [bounty, setBounty] = useState(s.bounty);
  const [fee, setFee] = useState(s.feePct);
  const [guarantee, setGuarantee] = useState(s.guarantee);
  const [priority, setPriority] = useState(s.priority);
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('basic');

  const tabs = [
    { k:'basic', l:'Basic' },{ k:'details', l:'Details' },
    { k:'skills', l:'Skills' },{ k:'calibration', l:'Calibration' },
    { k:'recommended', l:'Recommended' },{ k:'comp', l:'Comp & overrides' },
  ];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(20,10,40,.48)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:920, maxWidth:'100%', maxHeight:'94vh', background:'var(--paper)', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'22px 28px', borderBottom:'1px solid var(--hair)', background:'#fff' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
            <div style={{ minWidth:0 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-700)' }}>— ROLE SUBMITTAL · {s.num}</div>
              <h2 className="serif" style={{ margin:'6px 0 4px', fontSize:32, fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.05 }}>{s.title}</h2>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)' }}>{s.org?.toUpperCase()} · {s.location?.toUpperCase()} · {s.workMode?.toUpperCase()} · {s.seniority?.toUpperCase()}</div>
            </div>
            <button onClick={onClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22, alignSelf:'flex-start' }}>✕</button>
          </div>
          <div style={{ display:'flex', gap:6, marginTop:14, flexWrap:'wrap' }}>
            {s.confidential && <AChip tone="paper">CONFIDENTIAL</AChip>}
            <AChip tone="paper">{s.headcount} HEADCOUNT</AChip>
            <AChip tone={s.priority === 'high' ? 'err' : 'paper'}>{s.priority?.toUpperCase()} PRIORITY</AChip>
            {s.visaSponsor && <AChip tone="paper">VISA OK</AChip>}
          </div>
          <div style={{ display:'flex', gap:22, marginTop:18 }}>
            {tabs.map(t => {
              const A = tab === t.k;
              return (
                <button key={t.k} onClick={() => setTab(t.k)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'8px 0', position:'relative', color: A ? 'var(--ink)' : 'var(--t-3)', fontFamily:'var(--serif)', fontSize:14, fontStyle: A ? 'italic' : 'normal' }}>
                  {t.l}
                  {A && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding:'22px 28px', overflow:'auto', flex:1 }}>
          {tab === 'basic' && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:8 }}>§ DESCRIPTION</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:16, lineHeight:1.6, color:'var(--t-1)', marginBottom:22 }}>{s.description}</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ ROLE BRIEF</div>
              <div style={{ border:'1px solid var(--hair)', borderRadius:2, marginBottom:24 }}>
                {([['SUBMITTED BY', s.submittedBy + ' · ' + s.submittedAt],['ORG',s.org],['DEPARTMENT',s.department],['LOCATION',s.location],['WORK MODE',s.workMode],['SENIORITY',s.seniority],['HEADCOUNT',s.headcount + ' hire' + (s.headcount > 1 ? 's' : '')],['SALARY',s.salary],['PRIORITY',s.priority?.toUpperCase()]] as [string,string][]).filter(([,v]) => v).map(([l, v], i, arr) => (
                  <div key={l} style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:14, padding:'10px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--hair)' : undefined, alignItems:'baseline' }}>
                    <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{l}</span>
                    <span style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic' }}>{v}</span>
                  </div>
                ))}
              </div>
              {s.aiInsight && (
                <div style={{ padding:'14px 16px', background:'var(--plum-50)', border:'1px solid rgba(123,92,180,.3)', borderRadius:10 }}>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--plum-700)', marginBottom:6 }}>AI INSIGHT</div>
                  <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, lineHeight:1.55, color:'var(--t-2)' }}>{s.aiInsight}</div>
                </div>
              )}
            </>
          )}
          {tab === 'details' && (
            <>
              {s.about && <><div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:8 }}>§ ABOUT THE TEAM</div><div style={{ fontFamily:'var(--serif)', fontSize:15, lineHeight:1.6, color:'var(--t-1)', marginBottom:22 }}>{s.about}</div></>}
              {s.requirements && <><div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:8 }}>§ REQUIREMENTS</div><pre style={{ fontFamily:'var(--serif)', fontSize:14, lineHeight:1.65, color:'var(--t-1)', marginBottom:22, whiteSpace:'pre-wrap', background:'transparent', border:0, padding:0 }}>{s.requirements}</pre></>}
              {s.hiringManager?.name && <><div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:8 }}>§ HIRING MANAGER</div><div style={{ border:'1px solid var(--hair)', borderRadius:8, padding:14, background:'#fff' }}><div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic' }}>{s.hiringManager.name}</div><div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)', marginTop:3 }}>{s.hiringManager.title?.toUpperCase()}</div></div></>}
            </>
          )}
          {tab === 'skills' && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:8 }}>§ MUST-HAVE SKILLS</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:22 }}>
                {(s.requiredSkills || s.skills || []).map((k: string) => <AChip key={k} tone="paper">{k}</AChip>)}
              </div>
              {(s.niceToHave || []).length > 0 && (<><div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:8 }}>§ NICE TO HAVE</div><div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:22 }}>{s.niceToHave.map((k: string) => <AChip key={k} tone="paper">{k}</AChip>)}</div></>)}
              {(s.screeningQs || []).length > 0 && (<><div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:8 }}>§ SCREENING QUESTIONS</div><ol style={{ margin:0, paddingLeft:18 }}>{s.screeningQs.map((q: string, i: number) => <li key={i} style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, lineHeight:1.6, marginBottom:6 }}>{q}</li>)}</ol></>)}
            </>
          )}
          {tab === 'calibration' && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--plum-700)', marginBottom:6 }}>§ AI BENCHMARK · CALIBRATION</div>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:12 }}>
                {(s.calibrationBenchmarks || []).map((b: any, i: number) => <BenchmarkCard key={i} b={b}/>)}
                {!(s.calibrationBenchmarks || []).length && <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--t-4)' }}>No calibration benchmarks submitted.</div>}
              </div>
            </>
          )}
          {tab === 'recommended' && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--plum-700)', marginBottom:6 }}>§ RECOMMENDED CANDIDATES</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:12 }}>
                {(s.recommendedCandidates || []).map((c: any, i: number) => (
                  <div key={i} style={{ border:'1px solid var(--hair)', borderRadius:8, padding:'14px 16px', background:'#fff', display:'grid', gridTemplateColumns:'42px 1fr auto', gap:14, alignItems:'center' }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background: c.color || '#333', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:13 }}>{c.init}</div>
                    <div>
                      <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic' }}>{c.name}</div>
                      <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>{c.title?.toUpperCase()} · {c.location?.toUpperCase()}</div>
                      <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:12, color:'var(--t-3)', marginTop:4 }}>↳ {c.match}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div className="mono" style={{ fontSize:9, letterSpacing:'.16em', color:'var(--t-4)' }}>FIT</div>
                      <div className="serif" style={{ fontSize:24, fontStyle:'italic', color: c.fit >= 90 ? 'var(--plum-700)' : 'var(--ink)' }}>{c.fit}</div>
                    </div>
                  </div>
                ))}
                {!(s.recommendedCandidates || []).length && <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--t-4)' }}>No recommendations yet — will be generated on approval.</div>}
              </div>
            </>
          )}
          {tab === 'comp' && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ COMPENSATION (as submitted)</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:0, border:'1px solid var(--hair)', marginBottom:24 }}>
                {[['SALARY',s.salary],['BOUNTY',s.bounty],['FEE %',s.feePct],['GUARANTEE',s.guarantee]].map(([l,v],i) => (
                  <div key={l} style={{ padding:'14px 16px', borderRight: i<3 ? '1px solid var(--hair)' : undefined }}>
                    <div className="mono" style={{ fontSize:9, letterSpacing:'.2em', color:'var(--t-4)' }}>{l}</div>
                    <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.02em', marginTop:4 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ OVERRIDES (optional)</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:18 }}>
                <ApField label="Bounty"><input value={bounty} onChange={e => setBounty(e.target.value)} style={apInput}/></ApField>
                <ApField label="Fee %"><input value={fee} onChange={e => setFee(e.target.value)} style={apInput}/></ApField>
                <ApField label="Guarantee"><input value={guarantee} onChange={e => setGuarantee(e.target.value)} style={apInput}/></ApField>
                <ApField label="Priority">
                  <select value={priority} onChange={e => setPriority(e.target.value)} style={apInput}>
                    <option value="high">high</option><option value="med">med</option><option value="low">low</option>
                  </select>
                </ApField>
              </div>
              <ApField label="Note to client (optional)">
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="e.g. Approved — opening role to network in 15 minutes." style={{ ...apInput, resize:'vertical', fontFamily:'var(--serif)' } as React.CSSProperties}/>
              </ApField>
            </>
          )}
        </div>

        <div style={{ padding:'14px 24px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'space-between', background:'#fff' }}>
          <button onClick={onReject} className="btn btn-ghost" style={{ padding:'10px 14px', color:'var(--err)' }}>Decline</button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Request info</button>
            <button onClick={() => onApprove(s, { bounty, fee, guarantee, priority, note })} className="btn btn-primary" style={{ padding:'10px 18px' }}>✓ Approve & publish</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminRoles({ onCreateRole }: any) {
  const router = useRouter();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: applicationsData, isLoading: appsLoading } = useApplications();
  const { data: focusedRolesData, isLoading: focusedLoading } = useFocusedRoles();
  
  const [tab, setTab] = useState('all');
  const [org, setOrg] = useState('all');
  const [q, setQ] = useState('');
  const [overrides, setOverrides] = useState<Record<string, any>>({});
  const [reorder, setReorder] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [submittals, setSubmittals] = useState<any[]>([]);
  const [submittalView, setSubmittalView] = useState<any>(null);

  // Transform data from Supabase - now includes focused recruiters
  const roles = transformRolesForUI(rolesData || [], applicationsData || [], focusedRolesData || []);
  const isLoading = rolesLoading || appsLoading || focusedLoading;
  
  // Navigate to role detail
  const openRole = (role: any) => {
    router.push(`/roles/${role.id}`);
  };

  const patchRole = (id: string, patch: any) => setOverrides(o => ({ ...o, [id]: { ...o[id], ...patch } }));
  const getRole = (r: any) => ({ ...r, ...(overrides[r.id] || {}) });

  const approveSubmittal = (s: any, _patch: any) => {
    setSubmittals(list => list.filter((x: any) => x.id !== s.id));
    showToast(`Approved · ${s.title}`, { kind:'ok' } as any);
    setSubmittalView(null);
  };
  const rejectSubmittal = (s: any) => {
    setSubmittals(list => list.filter((x: any) => x.id !== s.id));
    showToast(`Declined · ${s.title}`);
    setSubmittalView(null);
  };

  const tabs = [
    { k:'all',    l:'All roles',    n: roles.length },
    { k:'open',   l:'Open',         n: roles.filter((r: any) => r.status === 'open').length },
    { k:'paused', l:'Paused',       n: roles.filter((r: any) => r.status === 'paused').length },
    { k:'focus',  l:'Focused',      n: roles.filter((r: any) => r.focused).length },
    { k:'stuck',  l:'Stuck · 30d+', n: roles.filter((r: any) => r.age >= 30).length },
  ];

  const priOrder: Record<string, number> = { high:0, med:1, low:2 };
  const filtered = roles.map(getRole).filter((r: any) => {
    if (tab === 'open'   && r.status !== 'open')  return false;
    if (tab === 'paused' && r.status !== 'paused') return false;
    if (tab === 'focus'  && !r.focused) return false;
    if (tab === 'stuck'  && r.age < 30) return false;
    if (org !== 'all' && r.org !== org) return false;
    if (q && !(r.title + ' ' + r.org + ' ' + r.num).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a: any, b: any) => (priOrder[a.priority] ?? 9) - (priOrder[b.priority] ?? 9));

  const orgs = ['all', ...new Set(roles.map((r: any) => r.org as string).filter(Boolean))];
  // Updated columns: added space for logo next to NO.
  const cols = reorder 
    ? '36px 110px 1.2fr 1fr 80px 90px 80px 80px' 
    : '110px 1.5fr minmax(120px, 1fr) 70px 100px 80px 80px 40px';

  return (
    <div className="pad-mobile roles-page" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:24 }} className="stack-mobile">
          <div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · ROLES</div>
            <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10, maxWidth:780 }}>
              Every open role,<br/><span style={{ color:'var(--t-4)' }}>every org.</span>
            </h1>
          </div>
          <button onClick={onCreateRole} className="btn btn-primary" style={{ padding:'12px 18px', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:8 }}>
            <Icons.Plus size={13}/> Create role
          </button>
        </div>
      </div>

      {submittals.length > 0 && (
        <div style={{ marginBottom:40 }}>
          <ASec num="§ 00" title="Role submittals from clients" sub={`${submittals.length} AWAITING REVIEW`}/>
          <AHair/>
          <div style={{ border:'1px solid var(--plum-500)', borderRadius:2, background:'var(--plum-50)', overflow:'hidden' }}>
            {submittals.map((s: any, i: number) => (
              <div key={s.id} onClick={() => setSubmittalView(s)}
                style={{ display:'grid', gridTemplateColumns:'110px 1.6fr 1fr 130px 120px 220px', gap:18, padding:'18px 22px', borderBottom: i < submittals.length - 1 ? '1px solid rgba(123,92,180,.2)' : 'none', alignItems:'center', cursor:'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(123,92,180,.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--plum-700)' }}>{s.num}</span>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'baseline', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize:20, fontStyle:'italic', letterSpacing:'-0.02em' }}>{s.title}</span>
                    {s.confidential && <AChip tone="paper">CONFIDENTIAL</AChip>}
                    {s.status === 'needs-info' && <AChip tone="warn">NEEDS INFO</AChip>}
                  </div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--plum-700)', marginTop:4 }}>{s.org?.toUpperCase()} · {s.location?.toUpperCase()}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>BOUNTY</div>
                  <div className="serif" style={{ fontSize:20, fontStyle:'italic', marginTop:2 }}>{s.bounty}</div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{s.feePct} · {s.guarantee}</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>SALARY</div>
                  <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, marginTop:2 }}>{s.salary}</div>
                </div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{s.submittedAt?.toUpperCase()}<br/>BY {s.submittedBy?.toUpperCase()}</div>
                <div style={{ display:'flex', gap:6, justifyContent:'flex-end', flexWrap:'wrap' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => rejectSubmittal(s)} className="btn btn-ghost" style={{ padding:'8px 12px', fontSize:11 }}>Decline</button>
                  <button onClick={() => setSubmittalView(s)} className="btn btn-primary" style={{ padding:'8px 12px', fontSize:11 }}>Review & approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <>
          <SkeletonStats count={4} />
          <SkeletonTable rows={8} cols={7} />
        </>
      ) : (
        <>
          <div style={{ borderBottom:'1px solid var(--hair)', display:'flex', gap:28, alignItems:'flex-end', marginBottom:20, flexWrap:'wrap' }}>
            {tabs.map(t => {
              const A = tab === t.k;
              return (
                <button key={t.k} onClick={() => setTab(t.k)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'10px 0', position:'relative', color: A ? 'var(--ink)' : 'var(--t-3)', fontFamily:'var(--serif)', fontSize:18, fontStyle: A ? 'italic' : 'normal', letterSpacing:'-0.01em' }}>
                  {t.l}<span className="mono" style={{ marginLeft:8, fontSize:10, color:'var(--t-4)', letterSpacing:'.14em' }}>{t.n}</span>
                  {A && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
                </button>
              );
            })}
          </div>

      <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:22, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', minWidth:240 }}>
          <Icons.Search size={14}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search role, org, code…"
            style={{ border:0, outline:'none', background:'transparent', fontSize:13, width:'100%', fontFamily:'var(--sans)' }}/>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>ORG</span>
          <select value={org} onChange={e => setOrg(e.target.value)} style={{ border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', fontSize:12, background:'#fff', fontFamily:'var(--sans)' }}>
            {orgs.map(o => <option key={o} value={o}>{o === 'all' ? 'All orgs' : o}</option>)}
          </select>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => setReorder(r => !r)} className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:11, letterSpacing:'.08em', background: reorder ? 'var(--ink)' : 'transparent', color: reorder ? 'var(--paper)' : 'var(--t-2)' }}>
            {reorder ? '✓ REORDER ON' : '↕ REORDER PRIORITY'}
          </button>
          <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{filtered.length} RESULTS</span>
        </div>
      </div>

      <div style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
        <div className="mono roles-header" style={{ display:'grid', gridTemplateColumns: cols, gap:16, padding:'12px 20px', borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)', fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>
          {reorder && <span>↕</span>}
          <span>NO.</span><span>ROLE</span><span className="hide-mobile">PIPELINE</span><span className="hide-mobile">AGE</span><span className="hide-tablet">RECRUITERS</span><span>STATUS</span>
          <span>{reorder ? 'PRIORITY' : ''}</span>{!reorder && <span/>}
        </div>
        {filtered.map((r: any, i: number) => {
          const totalPipe = Object.values(r.pipeline || {}).reduce((s: any, n: any) => s + n, 0) as number;
          const held = r.status === 'hold';
          const priLabel = r.priority === 'high' ? 'HIGH' : r.priority === 'med' ? 'MED' : 'LOW';
          const priTone  = r.priority === 'high' ? 'gold' : 'paper';
          const logoColor = getLogoColor(r.org || '');
          return (
            <div key={r.id}
              className="role-row"
              style={{ display:'grid', gridTemplateColumns: cols, gap:16, padding:'18px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--hair)' : 'none', alignItems:'center', cursor: reorder ? 'default' : 'pointer', opacity: held ? .55 : 1 }}
              onClick={() => !reorder && openRole(r)}
              onMouseEnter={e => !reorder && (e.currentTarget.style.background = 'color-mix(in oklch, var(--ink) 2.5%, transparent)')}
              onMouseLeave={e => !reorder && (e.currentTarget.style.background = 'transparent')}>
              {reorder && (
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  <button type="button" onClick={e => { e.stopPropagation(); if (i > 0) { patchRole(r.id, { priority: filtered[i-1].priority }); patchRole(filtered[i-1].id, { priority: r.priority }); showToast(`Moved ${r.num} up`); } }}
                    disabled={i === 0} style={{ appearance:'none', border:0, background: i===0 ? 'transparent' : 'var(--paper-2)', cursor: i===0 ? 'not-allowed' : 'pointer', width:22, height:16, borderRadius:3, fontSize:10, color:'var(--t-2)', opacity: i===0 ? .3 : 1 }}>▲</button>
                  <button type="button" onClick={e => { e.stopPropagation(); if (i < filtered.length-1) { patchRole(r.id, { priority: filtered[i+1].priority }); patchRole(filtered[i+1].id, { priority: r.priority }); showToast(`Moved ${r.num} down`); } }}
                    disabled={i === filtered.length-1} style={{ appearance:'none', border:0, background: i===filtered.length-1 ? 'transparent' : 'var(--paper-2)', cursor: i===filtered.length-1 ? 'not-allowed' : 'pointer', width:22, height:16, borderRadius:3, fontSize:10, color:'var(--t-2)', opacity: i===filtered.length-1 ? .3 : 1 }}>▼</button>
                </div>
              )}
              {/* Logo + Number */}
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {r.companyLogo ? (
                  <img src={r.companyLogo} alt={r.org} style={{ width:32, height:32, borderRadius:6, objectFit:'cover', flexShrink:0 }}/>
                ) : (
                  <div style={{ width:32, height:32, borderRadius:6, background: logoColor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:11, fontWeight:600, flexShrink:0 }}>
                    {getInitials(r.org)}
                  </div>
                )}
                <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{r.num}</span>
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', letterSpacing:'-0.01em', wordBreak:'break-word' }}>{r.title}</span>
                  {r.confidential && <AChip tone="plum">CONF.</AChip>}
                  {r.focused && <AChip tone="gold">FOCUS</AChip>}
                  {held && <AChip tone="paper">HOLD</AChip>}
                </div>
                <div className="mono" style={{ fontSize:9, letterSpacing:'.12em', color:'var(--t-4)', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.org?.toUpperCase()} · {r.location?.toUpperCase()} · {r.salary}</div>
              </div>
              <div className="hide-mobile" style={{ display:'flex', gap:2, alignItems:'flex-end', height:28 }}>
                {Object.entries(r.pipeline || {}).map(([stage, n]: [string, any]) => {
                  const max = Math.max(...(Object.values(r.pipeline || {}) as number[]));
                  const h = max ? Math.max(3, ((n as number) / max) * 28) : 3;
                  return <div key={stage} title={`${stage}: ${n}`} style={{ width:8, height: h, background: stage==='Hired'?'var(--ok)':stage==='Rejected'?'var(--err)':n===0?'var(--hair)':'var(--ink)' }}/>;
                })}
                <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-3)', marginLeft:8 }}>{totalPipe}</span>
              </div>
              <div className="hide-mobile">
                <div className="mono" style={{ fontSize:11, letterSpacing:'.1em', color: r.age >= 30 ? 'var(--err)' : 'var(--t-3)' }}>{r.age}d</div>
                {r.tta !== '—' && <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>TTA {r.tta}</div>}
              </div>
              <div className="hide-tablet" style={{ display:'flex', flexDirection:'column', gap:2 }}>
                <div className="mono" style={{ fontSize:11, letterSpacing:'.1em', color: r.recruiters > 0 ? 'var(--t-2)' : 'var(--t-4)' }}>
                  {r.recruiters} FOCUSED
                </div>
                {r.recruitersLast24h > 0 && (
                  <div className="mono" style={{ fontSize:9, letterSpacing:'.1em', color:'var(--ok)' }}>
                    +{r.recruitersLast24h} last 24h
                  </div>
                )}
                {r.focusedRecruiters?.length > 0 && (
                  <div style={{ display:'flex', marginTop:4 }}>
                    {r.focusedRecruiters.slice(0, 3).map((rec: any, i: number) => (
                      <div key={rec.id} title={rec.name} style={{ 
                        width:22, height:22, borderRadius:'50%', 
                        background: rec.avatar ? `url(${rec.avatar}) center/cover` : 'var(--ink)',
                        color:'#fff', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center',
                        marginLeft: i > 0 ? -6 : 0, border:'2px solid var(--paper)',
                        fontFamily:'var(--mono)', letterSpacing:'.05em'
                      }}>
                        {!rec.avatar && (rec.name?.substring(0,2).toUpperCase() || '?')}
                      </div>
                    ))}
                    {r.focusedRecruiters.length > 3 && (
                      <div style={{ 
                        width:22, height:22, borderRadius:'50%', 
                        background:'var(--paper-2)', color:'var(--t-3)',
                        fontSize:9, display:'flex', alignItems:'center', justifyContent:'center',
                        marginLeft:-6, border:'2px solid var(--paper)',
                        fontFamily:'var(--mono)'
                      }}>
                        +{r.focusedRecruiters.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                {r.status === 'open'   && <AChip tone="ok">OPEN</AChip>}
                {r.status === 'paused' && <AChip tone="paper">PAUSED</AChip>}
                {r.status === 'hold'   && <AChip tone="paper">ON HOLD</AChip>}
                {r.status === 'draft'  && <AChip tone="paper">DRAFT</AChip>}
              </div>
              {reorder ? (
                <AChip tone={priTone}>{priLabel}</AChip>
              ) : (
                <div style={{ textAlign:'right', position:'relative' }} onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={() => setMenuFor(menuFor === r.id ? null : r.id)}
                    style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'4px 8px', fontSize:18, color:'var(--t-3)', lineHeight:1 }}>⋯</button>
                  {menuFor === r.id && (
                    <RoleActionMenu role={r} onClose={() => setMenuFor(null)} onAction={(action: string) => {
                      if (action === 'publish')   { patchRole(r.id, { status:'open' }); showToast('Role published', { kind:'ok' } as any); }
                      if (action === 'unpublish') { patchRole(r.id, { status:'draft' }); showToast('Role unpublished'); }
                      if (action === 'pause')     { patchRole(r.id, { status:'paused' }); showToast('Role paused'); }
                      if (action === 'hold')      { patchRole(r.id, { status:'hold' }); showToast('Role put on hold', { kind:'warn' } as any); }
                      if (action === 'resume')    { patchRole(r.id, { status:'open' }); showToast('Role resumed', { kind:'ok' } as any); }
                      if (action === 'high')      { patchRole(r.id, { priority:'high' }); showToast('Priority: high'); }
                      if (action === 'med')       { patchRole(r.id, { priority:'med' }); showToast('Priority: medium'); }
                      if (action === 'low')       { patchRole(r.id, { priority:'low' }); showToast('Priority: low'); }
                      if (action === 'focus')     { patchRole(r.id, { focused: !r.focused }); showToast(r.focused ? 'Unfocused' : 'Focused'); }
                      if (action === 'dup')       { showToast('Role duplicated'); }
                      if (action === 'archive')   { showToast('Role archived'); }
                      setMenuFor(null);
                    }}/>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {!filtered.length && <div style={{ padding:'60px 20px', textAlign:'center', color:'var(--t-4)', fontStyle:'italic', fontFamily:'var(--serif)' }}>No roles match these filters. Create a role to get started.</div>}
      </div>
        </>
      )}

      {submittalView && <RoleSubmittalModal s={submittalView} onClose={() => setSubmittalView(null)} onApprove={approveSubmittal} onReject={() => rejectSubmittal(submittalView)}/>}
    </div>
  );
}

export default AdminRoles;
