'use client';
import React, { useState } from 'react';
import { useRecruiters, useApplications, useRoles, transformRecruitersForUI, transformRolesForUI } from '@/lib/hooks/useAdminData';
import { KpiTile as BKpi, Chip as BChip, SkeletonStats, SkeletonTable } from './AdminViews';
import { showToast } from './Toast';
import { Pagination, usePagination } from './Pagination';

function RecruiterDrawer({ recruiter, onClose, onApprove, onReject, onRevoke, onRestore, roles = [] }: any) {
  const r = recruiter;
  const conv = r.submitted > 0 ? Math.round((r.placed / r.submitted) * 100) : 0;
  const weeks = [3, 5, 7, 4, 6, 8, 5, 4];
  const max = Math.max(...weeks, 1);

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(10,10,11,.4)', zIndex:100 }}/>
      <div style={{ position:'fixed', right:0, top:0, bottom:0, width:'min(640px, 100vw)', background:'var(--paper)', zIndex:101, boxShadow:'-20px 0 60px rgba(0,0,0,.08)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--hair)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div style={{ display:'flex', gap:16, minWidth:0 }}>
            <div style={{ width:56, height:56, borderRadius:999, background:'var(--ink)', color:'#F3E6CE', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, flexShrink:0 }}>
              {r.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
            </div>
            <div style={{ minWidth:0 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>RECRUITER · {r.tier?.toUpperCase() || '—'}</div>
              <div className="serif" style={{ fontSize:32, fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.1, marginTop:4 }}>{r.name}</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:4 }}>{r.org?.toUpperCase()} · {r.email?.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22 }}>✕</button>
        </div>

        <div style={{ padding:'24px 32px', flex:1, overflow:'auto' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
            <BChip tone={r.status === 'active' ? 'ok' : r.status === 'pending' ? 'warn' : r.status === 'dormant' ? 'paper' : 'err'}>{r.status?.toUpperCase()}</BChip>
            <BChip tone="paper">JOINED {r.joined?.toUpperCase()}</BChip>
            <BChip tone="paper">FEE {r.fee}</BChip>
          </div>

          {r.status === 'pending' && (
            <>
              <div style={{ padding:'16px 18px', background:'#FFF6D6', border:'1px solid #E8C766', borderRadius:10, marginBottom:24, display:'flex', gap:14, alignItems:'flex-start' }}>
                <span style={{ fontSize:18 }}>⚠</span>
                <div style={{ fontSize:13, color:'#6B5300', lineHeight:1.5 }}>
                  <strong>Application received {r.appliedAt || '—'}.</strong> Review contact info, experience, and references below. Approve to grant access to open roles.
                </div>
              </div>
              {r.bio && <div style={{ marginBottom:22, fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', lineHeight:1.55, color:'var(--t-2)' }}>"{r.bio}"</div>}
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ CONTACT</div>
              <div style={{ border:'1px solid var(--hair)', borderRadius:2, marginBottom:24 }}>
                {([['EMAIL',r.email,'mailto:'+r.email],['PHONE',r.phone,'tel:'+(r.phone||'').replace(/\s/g,'')],['LINKEDIN',r.linkedin,'https://'+(r.linkedin||'')],['LOCATION',r.location+(r.timezone?' · '+r.timezone:''),null]] as [string,string,string|null][]).filter(([,v])=>v).map(([l,v,href],i,arr) => (
                  <div key={l} style={{ display:'grid', gridTemplateColumns:'110px 1fr', gap:14, padding:'12px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--hair)' : undefined, alignItems:'center' }}>
                    <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{l}</span>
                    {href ? <a href={href} target="_blank" rel="noreferrer" style={{ fontFamily:'var(--serif)', fontSize:15, color:'var(--ink)', textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v}</a> : <span style={{ fontFamily:'var(--serif)', fontSize:15 }}>{v}</span>}
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22, marginBottom:24 }}>
                <div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)' }}>§ EXPERIENCE</div>
                  <div className="serif" style={{ fontSize:36, fontStyle:'italic', letterSpacing:'-0.02em', marginTop:4 }}>{r.yearsExp || '—'}<span style={{ color:'var(--t-4)', fontSize:20 }}> yrs</span></div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)' }}>§ SPECIALTIES</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                    {(r.specialties || []).map((s: string) => <BChip key={s} tone="paper">{s}</BChip>)}
                  </div>
                </div>
              </div>
              {r.prevClients?.length > 0 && (
                <div style={{ marginBottom:24 }}>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ PREVIOUS CLIENTS</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {r.prevClients.map((c: string) => <span key={c} style={{ padding:'6px 10px', border:'1px solid var(--hair)', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14 }}>{c}</span>)}
                  </div>
                </div>
              )}
              {r.references?.length > 0 && (
                <div style={{ marginBottom:24 }}>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ REFERENCES · {r.references.length}</div>
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    {r.references.map((ref: any, i: number) => (
                      <div key={ref.email} style={{ padding:'12px 0', borderTop: i === 0 ? '1px solid var(--hair)' : undefined, borderBottom:'1px solid var(--hair)' }}>
                        <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic' }}>{ref.name}</div>
                        <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>{ref.role?.toUpperCase()}</div>
                        <a href={'mailto:' + ref.email} style={{ fontSize:12, color:'var(--ink)', marginTop:4, display:'inline-block', textDecoration:'underline' }}>{ref.email}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {r.notes && (
                <div style={{ padding:'14px 16px', background:'var(--paper)', border:'1px dashed var(--hair)', borderRadius:2, marginBottom:10 }}>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>ADMIN NOTE</div>
                  <div style={{ fontSize:13, color:'var(--t-2)', lineHeight:1.55, fontFamily:'var(--serif)' }}>{r.notes}</div>
                </div>
              )}
            </>
          )}

          {r.status !== 'pending' && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', border:'1px solid var(--hair)', marginBottom:24 }}>
                {[['ROLES',r.roles,''],['SUBMITTED',r.submitted,'CANDIDATES'],['PLACED',r.placed,'HIRES'],['CONV.',conv+'%','SUB→HIRE']].map(([l,v,s],i) => (
                  <div key={i} style={{ padding:'16px 14px', borderRight: i < 3 ? '1px solid var(--hair)' : undefined, display:'flex', flexDirection:'column', gap:4 }}>
                    <span className="mono" style={{ fontSize:9, letterSpacing:'.2em', color:'var(--t-4)' }}>{l}</span>
                    <span className="serif" style={{ fontSize:28, fontStyle:'italic', letterSpacing:'-0.02em' }}>{v}</span>
                    {s && <span className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>{s}</span>}
                  </div>
                ))}
              </div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ SUBMISSIONS · 8W</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:100, padding:'8px 0 14px', borderBottom:'1px solid var(--hair)', marginBottom:24 }}>
                {weeks.map((w, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', height: Math.max(4, (w / max) * 82), background:'var(--ink)' }}/>
                    <span className="mono" style={{ fontSize:9, letterSpacing:'.1em', color:'var(--t-4)' }}>W-{8-i}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                <div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)' }}>§ REVENUE</div>
                  <div className="serif" style={{ fontSize:36, fontStyle:'italic', letterSpacing:'-0.02em', marginTop:4 }}>${(r.rev / 1000).toFixed(0)}<span style={{ color:'var(--t-4)', fontSize:22 }}>k</span></div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>LIFETIME</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)' }}>§ QUALITY</div>
                  <div className="serif" style={{ fontSize:36, fontStyle:'italic', letterSpacing:'-0.02em', marginTop:4 }}>{conv >= 20 ? 'A' : conv >= 10 ? 'B' : conv >= 5 ? 'C' : '—'}</div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{conv}% CONVERSION</div>
                </div>
              </div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-4)', marginBottom:10 }}>§ ACTIVE ROLES</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {roles.slice(0, Math.min(r.roles || 3, 3)).map((role: any) => (
                  <div key={role.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', border:'1px solid var(--hair)', borderRadius:2 }}>
                    <div>
                      <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', letterSpacing:'-0.01em' }}>{role.title}</div>
                      <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{role.org?.toUpperCase()} · {role.num}</div>
                    </div>
                    <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', alignSelf:'center' }}>{role.candidates} CANDS</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ padding:'16px 32px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'flex-end' }}>
          {r.status === 'pending' && (<><button onClick={() => { onReject(r); onClose(); }} className="btn btn-ghost" style={{ padding:'10px 16px' }}>Reject</button><button onClick={() => { onApprove(r); onClose(); }} className="btn btn-primary" style={{ padding:'10px 18px' }}>Approve recruiter</button></>)}
          {r.status === 'active' && (<><button onClick={() => { onRevoke(r); onClose(); }} className="btn btn-ghost" style={{ padding:'10px 16px', color:'var(--err)' }}>Revoke access</button><button onClick={() => showToast('Message sent')} className="btn btn-primary" style={{ padding:'10px 18px' }}>Send message</button></>)}
          {r.status === 'revoked' && <button onClick={() => { onRestore(r); onClose(); }} className="btn btn-primary" style={{ padding:'10px 18px' }}>Restore access</button>}
        </div>
      </div>
    </>
  );
}

export function AdminRecruiters() {
  const { data: recruitersData, isLoading: recruitersLoading } = useRecruiters();
  const { data: applicationsData, isLoading: appsLoading } = useApplications();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  
  const [tab, setTab] = useState('all');
  const [drawer, setDrawer] = useState<any>(null);
  const [overrides, setOverrides] = useState<Record<string, any>>({});

  const recruiters = transformRecruitersForUI(recruitersData || [], applicationsData || []);
  const roles = transformRolesForUI(rolesData || [], applicationsData || []);
  const isLoading = recruitersLoading || appsLoading || rolesLoading;

  const patch = (id: string, p: any) => setOverrides(o => ({ ...o, [id]: { ...o[id], ...p } }));
  const view = recruiters.map((r: any) => ({ ...r, ...(overrides[r.id] || {}) }));

  const tabs = [
    { k:'all',     l:'All',     n: view.length },
    { k:'pending', l:'Pending', n: view.filter((r: any) => r.status === 'pending').length },
    { k:'active',  l:'Active',  n: view.filter((r: any) => r.status === 'active').length },
    { k:'dormant', l:'Dormant', n: view.filter((r: any) => r.status === 'dormant').length },
    { k:'revoked', l:'Revoked', n: view.filter((r: any) => r.status === 'revoked').length },
  ];

  const filteredItems = view.filter((r: any) => tab === 'all' ? true : r.status === tab);
  
  // Pagination
  const { 
    currentPage, 
    setCurrentPage, 
    totalPages, 
    paginatedItems: items, 
    totalItems,
    itemsPerPage 
  } = usePagination(filteredItems, 25);

  const approve = (r: any) => { patch(r.id, { status:'active' }); showToast(`Approved · ${r.name}`, { kind:'ok' } as any); };
  const reject  = (r: any) => { patch(r.id, { status:'revoked' }); showToast(`Rejected · ${r.name}`); };
  const revoke  = (r: any) => { patch(r.id, { status:'revoked' }); showToast(`Revoked · ${r.name}`, { kind:'warn' } as any); };
  const restore = (r: any) => { patch(r.id, { status:'active' }); showToast(`Restored · ${r.name}`, { kind:'ok' } as any); };

  return (
    <div className="recruiters-page">
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · RECRUITERS</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          The people who place<br/><span style={{ color:'var(--t-4)' }}>our people.</span>
        </h1>
      </div>
      {isLoading ? (
        <>
          <SkeletonStats count={4} />
          <SkeletonTable rows={8} cols={7} />
        </>
      ) : (
        <>
          <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:32, flexWrap:'wrap' }}>
            <BKpi label="TOTAL"   value={view.length}/>
            <BKpi label="ACTIVE"  value={view.filter((r: any) => r.status === 'active').length}/>
            <BKpi label="PENDING" value={view.filter((r: any) => r.status === 'pending').length} sub="AWAITING REVIEW"/>
            <BKpi label="REVENUE" value={'$' + (view.reduce((s: number, r: any) => s + (r.rev || 0), 0) / 1000).toFixed(0) + 'k'} sub="ALL TIME"/>
          </div>
          <div style={{ borderBottom:'1px solid var(--hair)', display:'flex', gap:28, alignItems:'flex-end', marginBottom:20, flexWrap:'wrap' }}>
            {tabs.map(t => {
              const A = tab === t.k;
              return (
                <button key={t.k} onClick={() => setTab(t.k)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'10px 0', position:'relative', color: A ? 'var(--ink)' : 'var(--t-3)', fontFamily:'var(--serif)', fontSize:18, fontStyle: A ? 'italic' : 'normal', letterSpacing:'-0.01em' }}>
                  {t.l}<span className="mono" style={{ marginLeft:8, fontSize:10, color: t.k === 'pending' && t.n > 0 ? 'var(--err)' : 'var(--t-4)', letterSpacing:'.14em' }}>{t.n}</span>
                  {A && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
                </button>
              );
            })}
          </div>
          <div className="recruiters-table" style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
            <div className="recruiters-header mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>
              <span>RECRUITER</span><span>AGENCY</span><span>ROLES</span><span>PLACED</span><span>REVENUE</span><span>STATUS</span><span style={{ textAlign:'right' }}>ACTIONS</span>
            </div>
            {items.map((r: any, i: number) => (
              <div key={r.id} className="recruiters-row" style={{ borderBottom: i < items.length - 1 ? '1px solid var(--hair)' : 'none' }}>
            <button onClick={() => setDrawer(r)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', textAlign:'left', padding:0, display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
              <div style={{ width:36, height:36, borderRadius:999, background:'var(--ink)', color:'#F3E6CE', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:13, fontStyle:'italic', flexShrink:0 }}>
                {r.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', letterSpacing:'-0.01em' }}>{r.name}</div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)', marginTop:2 }}>{r.email?.toUpperCase()}</div>
              </div>
            </button>
            <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'var(--t-2)' }}>{r.org}</div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.1em' }}>{r.roles}</div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.1em' }}>{r.placed}<span style={{ color:'var(--t-4)' }}>/{r.submitted}</span></div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.1em' }}>${(r.rev / 1000).toFixed(0)}k</div>
            <div><BChip tone={r.status==='active'?'ok':r.status==='pending'?'warn':r.status==='dormant'?'paper':'err'}>{r.status?.toUpperCase()}</BChip></div>
            <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
              {r.status === 'pending' && (<><button onClick={() => reject(r)} className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:11 }}>Reject</button><button onClick={() => approve(r)} className="btn btn-primary" style={{ padding:'6px 12px', fontSize:11 }}>Approve</button></>)}
              {r.status === 'active' && (<><button onClick={() => setDrawer(r)} className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:11 }}>Performance</button><button onClick={() => revoke(r)} className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:11, color:'var(--err)' }}>Revoke</button></>)}
              {r.status === 'dormant' && <button onClick={() => setDrawer(r)} className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:11 }}>Open</button>}
              {r.status === 'revoked' && <button onClick={() => restore(r)} className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:11 }}>Restore</button>}
            </div>
          </div>
        ))}
        {!items.length && (
              <div style={{ padding:'60px 20px', textAlign:'center', color:'var(--t-4)', fontStyle:'italic', fontFamily:'var(--serif)' }}>
                <div>No recruiters in this view.</div>
                <div className="mono" style={{ fontSize:10, marginTop:12, fontStyle:'normal', color:'var(--t-4)' }}>
                  Total in database: {recruitersData?.length || 0} user profiles
                </div>
              </div>
            )}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              itemLabel="recruiters"
            />
          </div>
        </>
      )}
      {drawer && <RecruiterDrawer recruiter={drawer} onClose={() => setDrawer(null)} onApprove={approve} onReject={reject} onRevoke={revoke} onRestore={restore} roles={roles}/>}
    </div>
  );
}
export default AdminRecruiters;
