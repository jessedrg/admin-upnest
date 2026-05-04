'use client';
import React, { useState } from 'react';
import { useOrganizations, useAgencies, useRoles, useApplications, transformOrgsForUI, transformRolesForUI, transformCandidatesForUI } from '@/lib/hooks/useAdminData';
import { KpiTile as BKpi, SectionTitle as BSec, Hairline as BHair, Chip as BChip, HealthDot as BHD, SkeletonStats, SkeletonTable } from './AdminViews';
import { showToast } from './Toast';

// Logo component that handles both URL images and letter fallbacks
function OrgLogo({ org, size = 56 }: { org: any, size?: number }) {
  if (org.logoUrl) {
    return (
      <img 
        src={org.logoUrl} 
        alt={org.name} 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: size > 40 ? 12 : 8, 
          objectFit: 'cover', 
          border: '1px solid var(--hair)',
          flexShrink: 0
        }} 
      />
    );
  }
  return (
    <div style={{ 
      width: size, 
      height: size, 
      borderRadius: size > 40 ? 12 : 8, 
      border: '1px solid var(--hair)', 
      background: 'var(--paper)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'var(--serif)', 
      fontStyle: 'italic', 
      fontSize: size * 0.45,
      color: 'var(--t-2)',
      flexShrink: 0
    }}>
      {(org.name || 'O')[0].toUpperCase()}
    </div>
  );
}

function OrgDrawer({ org, onClose, roles = [], candidates = [], onDelete }: any) {
  const [showDangerZone, setShowDangerZone] = useState(false);
  const orgRoles = roles.filter((r: any) => r.org === org.name);
  const orgCandidates = candidates.filter((c: any) => c.org === org.name);

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(10,10,11,.4)', zIndex:100 }}/>
      <div style={{ position:'fixed', right:0, top:0, bottom:0, width:'min(640px, 100vw)', background:'var(--paper)', zIndex:101, boxShadow:'-20px 0 60px rgba(0,0,0,.08)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--hair)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div style={{ display:'flex', gap:16, minWidth:0 }}>
            <OrgLogo org={org} size={56} />
            <div style={{ minWidth:0 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{org.type?.toUpperCase()} · {org.tier?.toUpperCase()}</div>
              <div className="serif" style={{ fontSize:32, fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.1, marginTop:4 }}>{org.name}</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:4 }}>{org.domain?.toUpperCase()} · JOINED {org.joined?.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22 }}>×</button>
        </div>
        <div style={{ padding:'24px 32px', flex:1, overflow:'auto' }}>
          <div style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:28 }}>
            <BKpi label="MRR" value={'$' + ((org.mrr || 0) / 1000).toFixed(1) + 'k'}/>
            <BKpi label="SEATS" value={org.seats || 0}/>
            <BKpi label={org.type === 'company' ? 'OPEN ROLES' : 'SUBMITTED'} value={org.type === 'company' ? org.roles : org.candidates}/>
            <BKpi label="STATUS" value={<BChip tone={org.status === 'approved' ? 'ok' : 'warn'}>{org.status?.toUpperCase()}</BChip>}/>
          </div>

          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:10 }}>§ CONTACT</div>
          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic' }}>{org.primary || '—'}</div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{org.contactEmail || '—'}</div>
            {org.contactPhone && <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{org.contactPhone}</div>}
            {org.website && <a href={org.website} target="_blank" rel="noopener noreferrer" className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--ink)', marginTop:4, display:'block' }}>{org.domain}</a>}
          </div>

          {org.description && (
            <>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:10 }}>§ DESCRIPTION</div>
              <p style={{ fontFamily:'var(--serif)', fontSize:14, lineHeight:1.6, color:'var(--t-2)', marginBottom:24 }}>{org.description}</p>
            </>
          )}

          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:10 }}>§ DETAILS</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
            {org.industry && <div><div className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>INDUSTRY</div><div style={{ fontSize:14, marginTop:2 }}>{org.industry}</div></div>}
            {org.companySize && <div><div className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>SIZE</div><div style={{ fontSize:14, marginTop:2 }}>{org.companySize}</div></div>}
            {org.agencyCommission && <div><div className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>COMMISSION</div><div style={{ fontSize:14, marginTop:2 }}>{org.agencyCommission}%</div></div>}
          </div>

          {org.type === 'company' && orgRoles.length > 0 && (
            <div style={{ marginTop:20 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:14 }}>§ ACTIVE ROLES · {orgRoles.length}</div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                {orgRoles.slice(0, 8).map((r: any, i: number) => (
                  <div key={r.id} style={{ padding:'14px 0', borderTop: i === 0 ? '1px solid var(--hair)' : undefined, borderBottom:'1px solid var(--hair)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10 }}>
                      <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic' }}>{r.title}</div>
                      <BChip tone={r.status === 'open' ? 'ok' : 'paper'}>{r.status?.toUpperCase()}</BChip>
                    </div>
                    <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>{r.location} · {r.candidates} candidates</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {org.type === 'agency' && orgCandidates.length > 0 && (
            <div style={{ marginTop:20 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:14 }}>§ SUBMISSIONS · {orgCandidates.length}</div>
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

          {/* Danger Zone */}
          <div style={{ marginTop:32, borderTop:'1px solid var(--hair)', paddingTop:24 }}>
            <button
              onClick={() => setShowDangerZone(!showDangerZone)}
              className="mono"
              style={{ 
                appearance:'none', border:0, background:'transparent', cursor:'pointer',
                fontSize:10, letterSpacing:'.14em', color:'var(--err)', 
                display:'flex', alignItems:'center', gap:6
              }}
            >
              <span style={{ transform: showDangerZone ? 'rotate(90deg)' : 'rotate(0deg)', transition:'transform .15s' }}>&#9654;</span>
              DANGER ZONE
            </button>
            {showDangerZone && (
              <div style={{ marginTop:16, padding:16, background:'rgba(220,53,69,.04)', border:'1px solid rgba(220,53,69,.15)', borderRadius:8 }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', marginBottom:8 }}>Delete this organization</div>
                <div style={{ fontSize:13, color:'var(--t-3)', marginBottom:12, lineHeight:1.5 }}>
                  Once deleted, all data associated with {org.name} will be permanently removed. This action cannot be undone.
                </div>
                <button
                  onClick={() => onDelete && onDelete(org)}
                  className="btn"
                  style={{ 
                    padding:'10px 16px', background:'var(--err)', color:'#fff', 
                    border:0, borderRadius:6, cursor:'pointer',
                    fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.06em'
                  }}
                >
                  Delete organization
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ padding:'16px 32px', borderTop:'1px solid var(--hair)', display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Close</button>
        </div>
      </div>
    </>
  );
}

function DeleteConfirmModal({ org, onClose, onDelete }: { org: any, onClose: () => void, onDelete: (org: any) => void }) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const canDelete = confirmText === org.name;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    await onDelete(org);
    setIsDeleting(false);
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(20,10,10,.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:480, maxWidth:'100%', background:'var(--paper)', borderRadius:12, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.35)' }}>
        {/* Header */}
        <div style={{ padding:'24px 28px', background:'#fff', borderBottom:'1px solid var(--hair)' }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--err)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <div>
              <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.02em', color:'var(--err)' }}>Delete Organization</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>DANGER ZONE</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'24px 28px' }}>
          <div style={{ padding:16, background:'rgba(220,53,69,.08)', border:'1px solid rgba(220,53,69,.2)', borderRadius:8, marginBottom:20 }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', color:'var(--err)', marginBottom:8 }}>
              This action cannot be undone.
            </div>
            <div style={{ fontSize:13, color:'var(--t-2)', lineHeight:1.5 }}>
              Deleting <strong>{org.name}</strong> will permanently remove all associated data including roles, applications, and history from the platform.
            </div>
          </div>

          <div style={{ marginBottom:8 }}>
            <label className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', display:'block', marginBottom:8 }}>
              TYPE <strong style={{ color:'var(--ink)' }}>{org.name}</strong> TO CONFIRM
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={org.name}
              style={{
                width:'100%', padding:'12px 14px', fontSize:14,
                border: confirmText && !canDelete ? '1px solid var(--err)' : '1px solid var(--hair)',
                borderRadius:6, background:'#fff',
                fontFamily:'var(--mono)', letterSpacing:'.02em'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--hair)', display:'flex', gap:10, justifyContent:'flex-end', background:'#fff' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 16px' }}>Cancel</button>
          <button
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            style={{
              padding:'10px 20px', borderRadius:6, border:0,
              background: canDelete ? 'var(--err)' : 'var(--t-5)',
              color:'#fff', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'.08em',
              cursor: canDelete ? 'pointer' : 'not-allowed',
              opacity: isDeleting ? 0.7 : 1,
              transition:'all .15s ease'
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ApproveModal({ org, onClose, onApprove, onReject }: any) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(20,10,40,.48)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:500, maxWidth:'100%', background:'var(--paper)', borderRadius:12, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)' }}>
        <div style={{ padding:'24px 28px', borderBottom:'1px solid var(--hair)', background:'#fff' }}>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-700)', marginBottom:8 }}>REVIEW APPLICATION</div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <OrgLogo org={org} size={52} />
            <div>
              <div className="serif" style={{ fontSize:26, fontStyle:'italic', letterSpacing:'-0.02em' }}>{org.name}</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{org.type?.toUpperCase()} · {org.domain?.toUpperCase()}</div>
            </div>
          </div>
        </div>
        <div style={{ padding:'24px 28px' }}>
          <div style={{ marginBottom:16 }}>
            <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', marginBottom:4 }}>CONTACT</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:15 }}>{org.primary}</div>
            <div style={{ fontSize:13, color:'var(--t-3)' }}>{org.contactEmail}</div>
          </div>
          {org.description && (
            <div style={{ marginBottom:16 }}>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', marginBottom:4 }}>DESCRIPTION</div>
              <div style={{ fontSize:14, color:'var(--t-2)', lineHeight:1.5 }}>{org.description}</div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {org.industry && <div><div className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>INDUSTRY</div><div style={{ fontSize:14, marginTop:2 }}>{org.industry}</div></div>}
            {org.companySize && <div><div className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>SIZE</div><div style={{ fontSize:14, marginTop:2 }}>{org.companySize}</div></div>}
          </div>
        </div>
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--hair)', display:'flex', gap:10, justifyContent:'space-between', background:'#fff' }}>
          <button onClick={() => onReject(org)} className="btn btn-ghost" style={{ padding:'10px 14px', color:'var(--err)' }}>Reject</button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Cancel</button>
            <button onClick={() => onApprove(org)} className="btn btn-primary" style={{ padding:'10px 18px' }}>Approve</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOrgs() {
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: applicationsData, isLoading: appsLoading } = useApplications();
  
  const [tab, setTab] = useState('all');
  const [open, setOpen] = useState<any>(null);
  const [approving, setApproving] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);

  // Transform data from Supabase
  const allOrgs = transformOrgsForUI(orgsData || [], agenciesData || []);
  const roles = transformRolesForUI(rolesData || [], applicationsData || []);
  const candidates = transformCandidatesForUI(applicationsData || []);
  const isLoading = orgsLoading || agenciesLoading || rolesLoading || appsLoading;

  // Handle approve/reject - TODO: implement Supabase update
  const handleApprove = async (org: any) => {
    showToast(`Approved · ${org.name}`, { kind: 'ok' } as any);
    setApproving(null);
  };

  const handleReject = async (org: any) => {
    showToast(`Rejected · ${org.name}`);
    setApproving(null);
  };

  const handleDeleteClick = (org: any) => {
    setOpen(null);
    setDeleting(org);
  };

  const handleDelete = async (org: any) => {
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { error } = await supabase
        .from('client_organizations')
        .delete()
        .eq('id', org.id);
      
      if (error) throw error;
      
      showToast(`Deleted · ${org.name}`, { kind: 'ok' } as any);
      setDeleting(null);
      // Trigger SWR revalidation
      window.location.reload();
    } catch (err) {
      console.error('[v0] Error deleting org:', err);
      showToast(`Failed to delete ${org.name}`);
    }
  };

  // Filter organizations by status
  const pendingOrgs = allOrgs.filter((o: any) => o.status === 'pending');
  const approvedOrgs = allOrgs.filter((o: any) => o.status === 'approved');
  const suspendedOrgs = allOrgs.filter((o: any) => o.status === 'suspended' || o.status === 'rejected');

  const tabs = [
    { k: 'all', l: 'All', n: approvedOrgs.length },
    { k: 'pending', l: 'Pending', n: pendingOrgs.length, highlight: pendingOrgs.length > 0 },
    { k: 'company', l: 'Companies', n: approvedOrgs.filter((o: any) => o.type === 'company').length },
    { k: 'agency', l: 'Agencies', n: approvedOrgs.filter((o: any) => o.type === 'agency').length },
    { k: 'suspended', l: 'Suspended', n: suspendedOrgs.length },
  ];

  const getFilteredOrgs = () => {
    if (tab === 'pending') return pendingOrgs;
    if (tab === 'suspended') return suspendedOrgs;
    if (tab === 'company') return approvedOrgs.filter((o: any) => o.type === 'company');
    if (tab === 'agency') return approvedOrgs.filter((o: any) => o.type === 'agency');
    return approvedOrgs;
  };

  const filteredOrgs = getFilteredOrgs();

  return (
    <div className="pad-mobile" style={{ padding: '40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom: 28 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)' }}>COMPANIES · AGENCIES</div>
        <h1 className="serif" style={{ fontSize: 'clamp(44px, 5.2vw, 60px)', fontStyle: 'italic', lineHeight: 1.02, letterSpacing: '-0.03em', marginTop: 10 }}>
          Companies and agencies,<br/><span style={{ color: 'var(--t-4)' }}>and who they are to each other.</span>
        </h1>
      </div>

      {isLoading ? (
        <>
          <SkeletonStats count={4} />
          <SkeletonTable rows={6} cols={5} />
        </>
      ) : (
        <>
          {/* Pending alert banner */}
          {pendingOrgs.length > 0 && tab !== 'pending' && (
            <div style={{ marginBottom: 24, padding: '16px 20px', background: 'var(--plum-50)', border: '1px solid var(--plum-300)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="serif" style={{ fontSize: 18, fontStyle: 'italic' }}>
                  {pendingOrgs.length} organization{pendingOrgs.length > 1 ? 's' : ''} awaiting approval
                </div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--plum-700)', marginTop: 4 }}>
                  Review and approve to give them access to the platform
                </div>
              </div>
              <button onClick={() => setTab('pending')} className="btn btn-primary" style={{ padding: '10px 16px' }}>
                Review pending
              </button>
            </div>
          )}

          <BSec num="§ 01" title="Organizations" sub={`${filteredOrgs.length} ${tab.toUpperCase()}`} />
          <BHair />

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid var(--hair)', display: 'flex', gap: 28, alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap' }}>
            {tabs.map(t => {
              const isActive = tab === t.k;
              return (
                <button
                  key={t.k}
                  onClick={() => setTab(t.k)}
                  style={{
                    appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                    padding: '10px 0', position: 'relative',
                    color: isActive ? 'var(--ink)' : 'var(--t-3)',
                    fontFamily: 'var(--serif)', fontSize: 18, fontStyle: isActive ? 'italic' : 'normal',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {t.l}
                  <span className="mono" style={{ marginLeft: 8, fontSize: 10, color: (t as any).highlight ? 'var(--err)' : 'var(--t-4)', letterSpacing: '.14em' }}>
                    {t.n}
                  </span>
                  {isActive && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: 'var(--ink)' }} />}
                </button>
              );
            })}
          </div>

          {/* Organizations Grid */}
          {filteredOrgs.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--t-4)', fontStyle: 'italic', fontFamily: 'var(--serif)', border: '1px solid var(--hair)', borderRadius: 4 }}>
              No organizations in this view.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filteredOrgs.map((org: any) => (
                <div
                  key={org.id}
                  onClick={() => tab === 'pending' ? setApproving(org) : setOpen(org)}
                  style={{
                    border: '1px solid var(--hair)', borderRadius: 4, padding: 24, cursor: 'pointer',
                    background: '#fff', transition: 'box-shadow 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Header with logo and health */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <OrgLogo org={org} size={52} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BHD status={org.health} />
                      <span className="mono" style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--t-4)' }}>
                        {org.status === 'pending' ? 'PENDING' : org.health?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Name and domain */}
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    {org.name}
                  </div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--t-4)', marginBottom: 16 }}>
                    {org.domain?.toUpperCase() || '—'} · {org.type?.toUpperCase()}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--t-4)' }}>MRR</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic' }}>${((org.mrr || 0) / 1000).toFixed(0)}k</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--t-4)' }}>SEATS</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic' }}>{org.seats || 0}</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--t-4)' }}>{org.type === 'agency' ? 'SUBMIT.' : 'ROLES'}</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic' }}>{org.roles || 0}</div>
                    </div>
                  </div>

                  {/* Contact footer */}
                  <div style={{ borderTop: '1px solid var(--hair)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: '.12em', color: 'var(--t-3)', textTransform: 'uppercase' }}>
                      {org.primary || '—'}
                    </span>
                    <span style={{ color: 'var(--t-3)' }}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {open && <OrgDrawer org={open} onClose={() => setOpen(null)} roles={roles} candidates={candidates} onDelete={handleDeleteClick} />}
      {approving && <ApproveModal org={approving} onClose={() => setApproving(null)} onApprove={handleApprove} onReject={handleReject} />}
      {deleting && <DeleteConfirmModal org={deleting} onClose={() => setDeleting(null)} onDelete={handleDelete} />}
    </div>
  );
}

export default AdminOrgs;
