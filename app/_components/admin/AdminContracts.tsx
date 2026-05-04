'use client';
import React, { useState, useMemo } from 'react';
import { useRecruiters, useOrganizations, useAgencies } from '@/lib/hooks/useAdminData';
import { SectionTitle as BSec, Hairline as BHair, Chip as BChip } from './AdminViews';
import { showToast } from './Toast';
import { Pagination, usePagination } from './Pagination';

function CountersignModal({ contract, onClose, onSign }: any) {
  const [name, setName] = useState('Casey Nguyen');
  const [agreed, setAgreed] = useState(false);
  const c = contract;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(20,10,40,.48)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:560, maxWidth:'100%', background:'var(--paper)', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)' }}>
        <div style={{ padding:'22px 26px', borderBottom:'1px solid var(--hair)', background:'#fff' }}>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-700)' }}>— COUNTERSIGN</div>
          <h2 className="serif" style={{ margin:'8px 0 0', fontSize:28, fontStyle:'italic', letterSpacing:'-0.02em' }}>Approve {c.num}</h2>
        </div>
        <div style={{ padding:'22px 26px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'110px 1fr', gap:'12px 14px', marginBottom:22 }}>
            {[['ORG',c.org],['KIND',c.kind],['FEE',c.fee],['GUARANTEE',c.guarantee],['COUNTERPARTY',c.submittedBy]].map(([l,v]) => (
              <React.Fragment key={l}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{l}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle: l==='ORG'||l==='COUNTERPARTY' ? 'italic' : 'normal' }}>{v}</span>
              </React.Fragment>
            ))}
          </div>
          <div style={{ padding:'12px 14px', background:'var(--plum-50)', borderRadius:8, fontSize:12, color:'var(--plum-700)', lineHeight:1.55, marginBottom:18 }}>
            By countersigning, you confirm you have authority to execute this agreement on behalf of upnest and accept all terms.
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
            <label className="mono" style={{ fontSize:10, letterSpacing:'.2em', color:'var(--t-3)' }}>SIGN AS</label>
            <div style={{ padding:'12px 14px', border:'1px solid var(--hair)', background:'#fff', borderRadius:8, fontFamily:'Caveat, cursive', fontSize:28 }}>
              <input value={name} onChange={e => setName(e.target.value)} style={{ border:0, outline:'none', width:'100%', background:'transparent', font:'inherit' }}/>
            </div>
          </div>
          <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer' }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop:3 }}/>
            <span style={{ fontSize:13, color:'var(--t-2)', lineHeight:1.5 }}>I have reviewed the full agreement and confirm terms are correct.</span>
          </label>
        </div>
        <div style={{ padding:'14px 22px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'flex-end', background:'#fff' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Cancel</button>
          <button onClick={onSign} disabled={!agreed || !name.trim()} className="btn btn-primary" style={{ padding:'10px 18px', opacity: agreed && name.trim() ? 1 : .5 }}>
            ✎ Countersign
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function AdminContracts() {
  const { data: recruitersData, isLoading: recruitersLoading } = useRecruiters();
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies();

  const isLoading = recruitersLoading || orgsLoading || agenciesLoading;

  // Transform recruiters with signed contracts
  const contractsFromRecruiters = useMemo(() => {
    if (!recruitersData) return [];
    return recruitersData
      .filter((r: any) => r.contract_signed_at)
      .map((r: any, i: number) => ({
        id: r.id,
        num: `REC-${String(i + 1).padStart(5, '0')}`,
        org: r.agencies?.name || 'Independent',
        kind: r.contract_type || 'Recruiter Agreement',
        fee: r.bounty_percentage ? `${r.bounty_percentage}%` : '20%',
        guarantee: '—',
        signed: r.contract_signed_at?.split('T')[0] || '',
        status: r.status === 'active' ? 'active' : r.status === 'pending' ? 'pending' : 'dormant',
        name: r.full_name || r.email,
      }));
  }, [recruitersData]);

  // Transform agencies as contracts
  const contractsFromAgencies = useMemo(() => {
    if (!agenciesData) return [];
    return agenciesData.map((a: any, i: number) => ({
      id: a.id,
      num: `AGY-${String(i + 1).padStart(5, '0')}`,
      org: a.name,
      kind: 'Agency MSA',
      fee: a.agency_commission_percentage ? `${a.agency_commission_percentage}%` : '22%',
      guarantee: '90 days',
      signed: a.created_at?.split('T')[0] || '',
      status: a.is_active ? 'active' : 'dormant',
    }));
  }, [agenciesData]);

  // Transform client organizations as contracts
  const contractsFromOrgs = useMemo(() => {
    if (!orgsData) return [];
    return orgsData.map((o: any, i: number) => ({
      id: o.id,
      num: `CLT-${String(i + 1).padStart(5, '0')}`,
      org: o.name,
      kind: `${o.account_type || 'Growth'} MSA`,
      fee: o.agency_commission ? `${o.agency_commission}%` : '22%',
      guarantee: '90 days',
      signed: o.created_at?.split('T')[0] || '',
      status: 'active',
    }));
  }, [orgsData]);

  // Combine all contracts
  const allContractsList = useMemo(() => {
    return [...contractsFromAgencies, ...contractsFromOrgs, ...contractsFromRecruiters]
      .sort((a, b) => (b.signed || '').localeCompare(a.signed || ''));
  }, [contractsFromAgencies, contractsFromOrgs, contractsFromRecruiters]);

  // Pagination
  const { 
    currentPage, 
    setCurrentPage, 
    totalPages, 
    paginatedItems: allContracts, 
    totalItems,
    itemsPerPage 
  } = usePagination(allContractsList, 25);

  // Pending contracts (recruiters awaiting countersign)
  const pending = useMemo(() => {
    if (!recruitersData) return [];
    return recruitersData
      .filter((r: any) => r.contract_signature && !r.contract_countersigned_at)
      .map((r: any, i: number) => ({
        id: r.id,
        num: `PND-${String(i + 1).padStart(5, '0')}`,
        org: r.agencies?.name || 'Independent',
        kind: r.contract_type || 'Recruiter Agreement',
        fee: r.bounty_percentage ? `${r.bounty_percentage}%` : '20%',
        guarantee: '—',
        submitted: formatTimeAgo(r.contract_signed_at || r.created_at),
        submittedBy: r.full_name || r.email,
        status: 'awaiting-counter',
      }));
  }, [recruitersData]);

  const [localPending, setLocalPending] = useState<any[]>([]);
  const [signing, setSigning] = useState<any>(null);

  // Merge DB pending with local state
  const displayPending = [...pending, ...localPending];

  const countersign = (c: any) => {
    // In real app, would update the user_profile in Supabase
    setLocalPending(p => p.filter(x => x.id !== c.id));
    showToast(`Countersigned · ${c.num}`, { kind:'ok' } as any);
    setSigning(null);
  };
  const rejectContract = (c: any) => {
    setLocalPending(p => p.filter(x => x.id !== c.id));
    showToast(`Sent back · ${c.num}`);
    setSigning(null);
  };

  const tierBands = [
    { tier:'Enterprise', fee:'20–25%', guarantee:'90–120d', invoicing:'Net 30' },
    { tier:'Growth',     fee:'22%',    guarantee:'60–90d',  invoicing:'Net 15' },
    { tier:'Agency',     fee:'—',      guarantee:'—',       invoicing:'Self-serve' },
  ];

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · CONTRACTS · BILLING</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          Every agreement,<br/><span style={{ color:'var(--t-4)' }}>countersigned.</span>
        </h1>
      </div>

      {displayPending.length > 0 && (
        <div style={{ marginBottom:36 }}>
          <BSec num="§ 00" title="Awaiting your countersign" sub={`${displayPending.length} PENDING`}/>
          <BHair/>
          <div style={{ border:'1px solid var(--plum-500)', borderRadius:2, background:'var(--plum-50)', overflow:'hidden' }}>
            {displayPending.map((c, i) => (
              <div key={c.id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1.4fr 90px 120px 140px 200px', gap:16, padding:'16px 20px', borderBottom: i < displayPending.length - 1 ? '1px solid rgba(123,92,180,.2)' : 'none', alignItems:'center' }}>
                <span className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--plum-700)' }}>{c.num}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic' }}>{c.org}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:14, color:'var(--t-2)' }}>{c.kind}</span>
                <span className="mono" style={{ fontSize:11 }}>{c.fee}</span>
                <span className="mono" style={{ fontSize:11 }}>{c.guarantee}</span>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>
                  {c.submitted.toUpperCase()}<br/>BY {c.submittedBy.toUpperCase()}
                </div>
                <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                  <button onClick={() => rejectContract(c)} className="btn btn-ghost" style={{ padding:'8px 12px', fontSize:11 }}>Send back</button>
                  <button onClick={() => setSigning(c)} className="btn btn-primary" style={{ padding:'8px 12px', fontSize:11 }}>Countersign</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom:36 }}>
        <BSec num="§ 01" title="Standard tier bands" sub="DEFAULT"/>
        <BHair/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:0, border:'1px solid var(--hair)', borderRight:0 }} className="grid-1-mobile">
          {tierBands.map(t => (
            <div key={t.tier} style={{ padding:'22px 24px', borderRight:'1px solid var(--hair)' }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>TIER</div>
              <div className="serif" style={{ fontSize:28, fontStyle:'italic', letterSpacing:'-0.02em', marginTop:4 }}>{t.tier}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:16, fontFamily:'var(--serif)', fontSize:15 }}>
                <div><span style={{ color:'var(--t-4)' }}>Fee · </span>{t.fee}</div>
                <div><span style={{ color:'var(--t-4)' }}>Guarantee · </span>{t.guarantee}</div>
                <div><span style={{ color:'var(--t-4)' }}>Invoicing · </span>{t.invoicing}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BSec num="§ 02" title="Signed agreements" sub={isLoading ? 'LOADING...' : `${totalItems} TOTAL`}/>
      <BHair/>
      {isLoading ? (
        <div style={{ padding:'40px', textAlign:'center', color:'var(--t-4)' }}>Loading contracts...</div>
      ) : allContracts.length === 0 ? (
        <div style={{ padding:'40px', textAlign:'center', color:'var(--t-4)', border:'1px solid var(--hair)' }}>
          No contracts found. Add agencies, organizations, or recruiters to see contracts here.
        </div>
      ) : (
        <div style={{ border:'1px solid var(--hair)', borderRadius:2, background:'#fff', overflow:'hidden' }}>
          <div className="mono" style={{ display:'grid', gridTemplateColumns:'120px 1fr 1.4fr 90px 120px 110px 110px', gap:16, padding:'12px 20px', borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)', fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>
            <span>NO.</span><span>ORG</span><span>KIND</span><span>FEE</span><span>GUARANTEE</span><span>SIGNED</span><span>STATUS</span>
          </div>
          {allContracts.map((c: any, i: number) => (
            <div key={c.id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1.4fr 90px 120px 110px 110px', gap:16, padding:'16px 20px', borderBottom: i < allContracts.length - 1 ? '1px solid var(--hair)' : 'none', alignItems:'center' }}>
              <span className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--t-3)' }}>{c.num}</span>
              <span style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', letterSpacing:'-0.01em' }}>{c.org}</span>
              <span style={{ fontFamily:'var(--serif)', fontSize:14, color:'var(--t-2)' }}>{c.kind}</span>
              <span className="mono" style={{ fontSize:11 }}>{c.fee}</span>
              <span className="mono" style={{ fontSize:11 }}>{c.guarantee}</span>
              <span className="mono" style={{ fontSize:11, color:'var(--t-3)' }}>{c.signed}</span>
              <span><BChip tone={c.status==='active'?'ok':c.status==='expiring'?'warn':'paper'}>{c.status.toUpperCase()}</BChip></span>
            </div>
          ))}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            itemLabel="contracts"
          />
        </div>
      )}

      {signing && <CountersignModal contract={signing} onClose={() => setSigning(null)} onSign={() => countersign(signing)}/>}
    </div>
  );
}
export default AdminContracts;
