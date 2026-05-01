'use client';
import React, { useState } from 'react';
import ADMIN_DATA from './AdminData';
import { KpiTile as BKpi, SectionTitle as BSec, Hairline as BHair, Chip as BChip, HealthDot as BHD } from './AdminViews';
import { showToast } from './Toast';

function synthesizeRoleDetail(title: string, p: any) {
  const seed = (title + (p?.name || '')).split('').reduce((a: number, c: string) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const rnd = (n: number) => Math.abs(seed >> n) % 100;
  const t = title.toLowerCase();
  let salary = '$160–210k', seniority = 'Senior', skills: string[] = ['TypeScript','React'];
  let descTemplate = '';
  if (/staff|principal|head|lead/.test(t)) { seniority = /head|lead/.test(t) ? 'Lead / Head of' : 'Staff / Principal'; salary = '$240–320k'; }
  else if (/junior|associate/.test(t)) { seniority = 'Junior'; salary = '$110–140k'; }
  if (/compiler|llvm|rust/.test(t)) skills = ['Rust','LLVM','Compilers','Systems'];
  else if (/ml|ai|machine|learning|research/.test(t)) skills = ['Python','PyTorch','Distributed Training','Research'];
  else if (/security|risk|fraud|safety/.test(t)) skills = ['Security','SecOps','Threat Modeling','Cryptography'];
  else if (/embedded|firmware|robotics/.test(t)) skills = ['C++','Embedded','RTOS','Sensor Fusion'];
  else if (/sre|infra|platform|devops/.test(t)) skills = ['Kubernetes','Terraform','Observability','Go'];
  else if (/ios|swift|mobile/.test(t)) skills = ['Swift','SwiftUI','iOS','Combine'];
  else if (/design|ux|product/.test(t)) skills = ['Figma','Design Systems','Prototyping','User Research'];
  if (/compiler/.test(t)) descTemplate = `Rebuild ${p.name}'s internal expression engine. Rust + LLVM required.`;
  else if (/safety|alignment/.test(t)) descTemplate = `Lead the safety eng org at ${p.name}. Manage 8–12 engineers.`;
  else if (/sre|infra|platform/.test(t)) descTemplate = `Own ${p.name}'s production infrastructure. Define the platform roadmap.`;
  else descTemplate = `Senior contributor on ${p.name}'s core team. Owns delivery end-to-end.`;
  const locations = ['New York','San Francisco','Remote (US)','London','Berlin','Hybrid · NYC','Onsite · ' + (p.hq || 'HQ')];
  const workModes = ['Hybrid','Remote','Onsite'];
  const priorities = ['high','med','med','low'];
  const fees = ['20%','22%','22%','25%'];
  const guarantees = ['60 days','90 days','90 days','120 days'];
  return { title, salary, seniority, headcount: 1 + (rnd(3) % 3), priority: priorities[rnd(5) % priorities.length], location: locations[rnd(7) % locations.length], workMode: workModes[rnd(11) % workModes.length], fee: fees[rnd(13) % fees.length], guarantee: guarantees[rnd(17) % guarantees.length], description: descTemplate, skills };
}

const apInput: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid var(--hair)', background:'#fff', borderRadius:2, fontFamily:'var(--serif)', fontSize:15, outline:'none' };

function ApField({ label, children }: any) {
  return (
    <div>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function RoleField({ label, value }: any) {
  return (
    <div>
      <div className="mono" style={{ fontSize:9, letterSpacing:'.16em', color:'var(--t-4)' }}>{label}</div>
      <div style={{ fontFamily:'var(--serif)', fontSize:13, fontStyle:'italic', marginTop:2 }}>{value}</div>
    </div>
  );
}

function ApproveClientModal({ org, onClose, onApprove, onReject }: any) {
  const p = org;
  const isAgency = p.type === 'agency';
  const [tier, setTier] = useState(p.tier || 'Growth');
  const [fee, setFee] = useState(isAgency ? '20%' : '22%');
  const [guarantee, setGuarantee] = useState(isAgency ? '60 days' : '90 days');
  const [mrr, setMrr] = useState(isAgency ? 1500 : 9000);
  const [seats, setSeats] = useState(isAgency ? (p.recruiterCount || 4) : 12);
  const [invite, setInvite] = useState(true);

  const rows: [string, string, string | null][] = [
    ['PRIMARY', p.primary + ' · ' + (p.primaryTitle || ''), null],
    ['EMAIL', p.email, 'mailto:' + p.email],
    ['PHONE', p.phone, 'tel:' + (p.phone || '').replace(/\s/g, '')],
    ['LINKEDIN', p.linkedin, 'https://' + p.linkedin],
    ['WEBSITE', p.website, 'https://' + p.website],
    ['SIZE', p.size, null],
    ['HQ', p.hq, null],
    isAgency ? ['SPECIALTIES', (p.specialties || []).join(' · '), null] : ['FUNDING', p.funding, null],
    isAgency ? ['YRS ACTIVE', p.yearsActive + ' yrs', null] : ['HEADCOUNT', p.expectedHires + ' hires planned', null],
  ];

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(20,10,40,.48)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:720, maxWidth:'100%', maxHeight:'92vh', background:'var(--paper)', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'22px 28px', borderBottom:'1px solid var(--hair)', background:'#fff', display:'flex', gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:10, border:'1px solid var(--hair)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, flexShrink:0 }}>{p.logo}</div>
          <div style={{ minWidth:0, flex:1 }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-700)' }}>— APPROVE {isAgency ? 'AGENCY' : 'CLIENT'}</div>
            <h2 className="serif" style={{ margin:'4px 0', fontSize:32, fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.05 }}>{p.name}</h2>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)' }}>{p.domain?.toUpperCase()} · {p.hq?.toUpperCase()} · APPLIED {p.appliedAt?.toUpperCase()}</div>
          </div>
          <button onClick={onClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22, alignSelf:'flex-start' }}>✕</button>
        </div>
        <div style={{ padding:'24px 28px', overflow:'auto', flex:1 }}>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ DETAILS</div>
          <div style={{ border:'1px solid var(--hair)', borderRadius:2, marginBottom:24 }}>
            {rows.filter(([, v]) => v).map(([l, v, href], i, arr) => (
              <div key={l} style={{ display:'grid', gridTemplateColumns:'130px 1fr', gap:14, padding:'12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--hair)' : undefined, alignItems:'baseline' }}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{l}</span>
                {href ? <a href={href} target="_blank" rel="noreferrer" style={{ fontFamily:'var(--serif)', fontSize:15, color:'var(--ink)' }}>{v}</a> : <span style={{ fontFamily:'var(--serif)', fontSize:15 }}>{v}</span>}
              </div>
            ))}
          </div>

          {!isAgency && (p.expectedRoles || []).length > 0 && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ EXPECTED ROLES · {(p.expectedRoles || []).length}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                {(p.expectedRoles || []).map((rt: string) => {
                  const detail = synthesizeRoleDetail(rt, p);
                  return (
                    <div key={rt} style={{ border:'1px solid var(--hair)', borderRadius:6, padding:'14px 16px', background:'#fff' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10, marginBottom:10 }}>
                        <div>
                          <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', letterSpacing:'-0.01em' }}>{rt}</div>
                          <div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)', marginTop:3 }}>{detail.seniority?.toUpperCase()} · {detail.headcount} HIRE{detail.headcount > 1 ? 'S' : ''} · PRIORITY {detail.priority?.toUpperCase()}</div>
                        </div>
                        <BChip tone="paper">{detail.salary}</BChip>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
                        <RoleField label="LOCATION" value={detail.location}/>
                        <RoleField label="WORK MODE" value={detail.workMode}/>
                        <RoleField label="FEE" value={detail.fee + ' · ' + detail.guarantee}/>
                      </div>
                      <p style={{ fontFamily:'var(--serif)', fontSize:13, lineHeight:1.55, color:'var(--t-2)', margin:'0 0 10px' }}>{detail.description}</p>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {detail.skills.map((s: string) => <BChip key={s} tone="paper">{s}</BChip>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ ONBOARDING TERMS</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
            <ApField label="Tier">
              <select value={tier} onChange={e => setTier(e.target.value)} style={apInput}>
                <option>Enterprise</option><option>Growth</option><option>Agency</option>
              </select>
            </ApField>
            <ApField label={isAgency ? 'Split %' : 'Fee %'}>
              <select value={fee} onChange={e => setFee(e.target.value)} style={apInput}>
                <option>20%</option><option>22%</option><option>25%</option>
              </select>
            </ApField>
            <ApField label="Guarantee">
              <select value={guarantee} onChange={e => setGuarantee(e.target.value)} style={apInput}>
                <option>60 days</option><option>90 days</option><option>120 days</option>
              </select>
            </ApField>
            <ApField label={isAgency ? 'Starting recruiters' : 'MRR estimate ($)'}>
              <input type="number" value={isAgency ? seats : mrr} onChange={e => isAgency ? setSeats(+e.target.value) : setMrr(+e.target.value)} style={apInput}/>
            </ApField>
          </div>
          <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer', marginBottom:4 }}>
            <input type="checkbox" checked={invite} onChange={e => setInvite(e.target.checked)} style={{ marginTop:3 }}/>
            <span style={{ fontSize:13, color:'var(--t-2)', lineHeight:1.5 }}>Send welcome email to <strong>{p.email}</strong> with platform credentials.</span>
          </label>
        </div>
        <div style={{ padding:'14px 24px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'space-between', background:'#fff' }}>
          <button onClick={onReject} className="btn btn-ghost" style={{ padding:'10px 14px', color:'var(--err)' }}>Reject application</button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Save for later</button>
            <button onClick={() => onApprove(p, { tier, mrr, seats, fee, guarantee })} className="btn btn-primary" style={{ padding:'10px 18px' }}>✓ Approve & activate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgDrawer({ org, onClose }: any) {
  const d = ADMIN_DATA;
  const orgRoles = d.roles.filter((r: any) => r.org === org.name);
  const orgCandidates = d.candidates.filter((c: any) => c.org === org.name);

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(10,10,11,.4)', zIndex:100 }}/>
      <div style={{ position:'fixed', right:0, top:0, bottom:0, width:'min(640px, 100vw)', background:'var(--paper)', zIndex:101, boxShadow:'-20px 0 60px rgba(0,0,0,.08)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--hair)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div style={{ display:'flex', gap:16, minWidth:0 }}>
            <div style={{ width:56, height:56, borderRadius:10, border:'1px solid var(--hair)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, flexShrink:0 }}>{org.logo}</div>
            <div style={{ minWidth:0 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{org.type?.toUpperCase()} · {org.tier?.toUpperCase()}</div>
              <div className="serif" style={{ fontSize:32, fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.1, marginTop:4 }}>{org.name}</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:4 }}>{org.domain?.toUpperCase()} · JOINED {org.joined?.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22 }}>✕</button>
        </div>
        <div style={{ padding:'24px 32px', flex:1, overflow:'auto' }}>
          <div style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:28 }}>
            <BKpi label="MRR"    value={'$' + (org.mrr / 1000).toFixed(1) + 'k'}/>
            <BKpi label="SEATS"  value={org.seats}/>
            <BKpi label={org.type === 'company' ? 'OPEN ROLES' : 'SUBMITTED'} value={org.type === 'company' ? org.roles : org.candidates}/>
            <BKpi label="HEALTH" value={<BHD v={org.health}/>}/>
          </div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:10 }}>§ PRIMARY CONTACT</div>
          <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic' }}>{org.primary}</div>
          <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{org.primary?.toLowerCase().replace(' ', '.')}@{org.domain}</div>
          {org.type === 'company' && orgRoles.length > 0 && (
            <div style={{ marginTop:30 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:14 }}>§ ACTIVE ROLES</div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                {orgRoles.map((r: any, i: number) => (
                  <div key={r.id} style={{ padding:'14px 0', borderTop: i === 0 ? '1px solid var(--hair)' : undefined, borderBottom:'1px solid var(--hair)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10 }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', letterSpacing:'-0.01em' }}>{r.title}</div>
                      <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color: r.age >= 30 ? 'var(--err)' : 'var(--t-4)' }}>{r.age}d · {r.candidates} cand.</span>
                    </div>
                    <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>{r.num} · {r.salary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {org.type === 'agency' && (
            <div style={{ marginTop:30 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:14 }}>§ RECENT SUBMISSIONS</div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                {orgCandidates.slice(0, 8).map((c: any, i: number) => (
                  <div key={c.id} style={{ padding:'12px 0', borderTop: i === 0 ? '1px solid var(--hair)' : undefined, borderBottom:'1px solid var(--hair)', display:'grid', gridTemplateColumns:'1fr auto', gap:10 }}>
                    <div>
                      <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>{c.name}</div>
                      <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>→ {c.role?.toUpperCase()}</div>
                    </div>
                    <BChip tone={c.stage === 'Hired' ? 'ok' : c.stage === 'Rejected' ? 'err' : 'paper'}>{c.stage?.toUpperCase()}</BChip>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:'16px 32px', borderTop:'1px solid var(--hair)', display:'flex', justifyContent:'space-between', gap:10 }}>
          <button className="btn btn-ghost" style={{ padding:'10px 14px' }}>View contracts</button>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost" style={{ padding:'10px 14px' }}>Suspend</button>
            <button className="btn btn-primary" style={{ padding:'10px 16px' }}>Impersonate</button>
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminOrgs() {
  const d = ADMIN_DATA;
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState<any>(null);
  const [pendingOrgs, setPendingOrgs] = useState<any[]>([...(d.pendingOrgs || []), ...(d.pendingAgencies || [])]);
  const [approving, setApproving] = useState<any>(null);

  const approvePending = (p: any, _terms: any) => {
    setPendingOrgs(list => list.filter((x: any) => x.id !== p.id));
    showToast(`Approved · ${p.name}`, { kind:'ok' } as any);
    setApproving(null);
  };
  const rejectPending = (p: any) => {
    setPendingOrgs(list => list.filter((x: any) => x.id !== p.id));
    showToast(`Rejected · ${p.name}`);
    setApproving(null);
  };

  const tabs = [
    { k:'all',     l:'All',       n: d.orgs.length },
    { k:'company', l:'Companies', n: d.orgs.filter((o: any) => o.type === 'company').length },
    { k:'agency',  l:'Agencies',  n: d.orgs.filter((o: any) => o.type === 'agency').length },
    { k:'at-risk', l:'At risk',   n: d.orgs.filter((o: any) => o.health === 'at-risk').length },
    { k:'dormant', l:'Dormant',   n: d.orgs.filter((o: any) => o.health === 'dormant').length },
  ];

  const orgs = d.orgs.filter((o: any) => {
    if (tab === 'company' && o.type !== 'company') return false;
    if (tab === 'agency'  && o.type !== 'agency')  return false;
    if (tab === 'at-risk' && o.health !== 'at-risk') return false;
    if (tab === 'dormant' && o.health !== 'dormant') return false;
    return true;
  });

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · ORGANIZATIONS</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          Companies and agencies,<br/><span style={{ color:'var(--t-4)' }}>and who they are to each other.</span>
        </h1>
      </div>

      {pendingOrgs.length > 0 && (
        <div style={{ marginBottom:40 }}>
          <BSec num="§ 00" title="Awaiting approval" sub={`${pendingOrgs.length} PENDING`}/>
          <BHair/>
          <div style={{ border:'1px solid var(--plum-500)', borderRadius:2, background:'var(--plum-50)', overflow:'hidden' }}>
            {pendingOrgs.map((p: any, i: number) => (
              <div key={p.id} onClick={() => setApproving(p)}
                style={{ display:'grid', gridTemplateColumns:'56px 1fr 1fr 140px 180px', gap:18, padding:'18px 22px', borderBottom: i < pendingOrgs.length - 1 ? '1px solid rgba(123,92,180,.2)' : 'none', alignItems:'center', cursor:'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(123,92,180,.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ width:44, height:44, borderRadius:8, border:'1px solid rgba(123,92,180,.3)', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22 }}>{p.logo}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'baseline', flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize:22, fontStyle:'italic', letterSpacing:'-0.02em' }}>{p.name}</span>
                    <BChip tone="paper">{p.type?.toUpperCase()}</BChip>
                  </div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--plum-700)', marginTop:4 }}>{p.domain?.toUpperCase()} · {p.size} · {p.hq?.toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>{p.primary}</div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>{p.primaryTitle?.toUpperCase()}</div>
                </div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>
                  APPLIED {p.appliedAt?.toUpperCase()}
                </div>
                <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => rejectPending(p)} className="btn btn-ghost" style={{ padding:'8px 12px', fontSize:11 }}>Reject</button>
                  <button onClick={() => setApproving(p)} className="btn btn-primary" style={{ padding:'8px 12px', fontSize:11 }}>Review & approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BSec num="§ 01" title="Active organizations" sub={`${d.orgs.length} TOTAL`}/>
      <BHair/>
      <div style={{ borderBottom:'1px solid var(--hair)', display:'flex', gap:28, alignItems:'flex-end', marginBottom:24, flexWrap:'wrap' }}>
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

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:0, border:'1px solid var(--hair)', borderRight:0, borderBottom:0 }} className="grid-1-mobile">
        {orgs.map((o: any) => (
          <button key={o.id} onClick={() => setOpen(o)}
            style={{ appearance:'none', textAlign:'left', border:0, background:'#fff', cursor:'pointer', borderRight:'1px solid var(--hair)', borderBottom:'1px solid var(--hair)', padding:'24px', display:'flex', flexDirection:'column', gap:14, transition:'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in oklch, var(--ink) 2%, #fff)')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ width:46, height:46, borderRadius:8, border:'1px solid var(--hair)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22 }}>{o.logo}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <BHD v={o.health}/><span className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>{o.health?.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'var(--serif)', fontSize:24, fontStyle:'italic', letterSpacing:'-0.02em', lineHeight:1 }}>{o.name}</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:5 }}>{o.domain?.toUpperCase()} · {o.tier?.toUpperCase()}</div>
            </div>
            <div style={{ display:'flex', gap:24, marginTop:6 }}>
              {[['MRR','$'+(o.mrr/1000).toFixed(1)+'k'],['SEATS',String(o.seats)],[o.type==='company'?'ROLES':'SUBMIT.',String(o.type==='company'?o.roles:o.candidates)]].map(([l,v]) => (
                <div key={l}><div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>{l}</div><div className="serif" style={{ fontSize:20, fontStyle:'italic', marginTop:2 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid var(--hair)', paddingTop:10, marginTop:4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{o.primary?.toUpperCase()}</span>
              <span className="mono" style={{ fontSize:12, color:'var(--t-4)' }}>→</span>
            </div>
          </button>
        ))}
      </div>

      {open && <OrgDrawer org={open} onClose={() => setOpen(null)}/>}
      {approving && <ApproveClientModal org={approving} onClose={() => setApproving(null)} onApprove={approvePending} onReject={() => rejectPending(approving)}/>}
    </div>
  );
}
export default AdminOrgs;
