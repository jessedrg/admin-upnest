'use client';
import React, { useState } from 'react';
import { SectionTitle as BSec, Hairline as BHair, Chip as BChip } from './AdminViews';
import { showToast } from './Toast';

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

export function AdminContracts() {
  const [pending, setPending] = useState([
    { id:'ct-p1', num:'MSA-01301', org:'Parabol Partners', kind:'Agency MSA',       fee:'22%', guarantee:'90 days', submitted:'2d ago', submittedBy:'Rowan Tao',  status:'awaiting-counter' },
    { id:'ct-p2', num:'MSA-01299', org:'Cedar & Finch',    kind:'Agency MSA',       fee:'20%', guarantee:'60 days', submitted:'4d ago', submittedBy:'Mina Osei',  status:'awaiting-counter' },
    { id:'ct-p3', num:'AMD-00042', org:'Stripe',           kind:'Fee amendment v2', fee:'21%', guarantee:'—',       submitted:'1w ago', submittedBy:'Mel Patel',  status:'awaiting-counter' },
  ]);
  const [signed, setSigned] = useState([
    { id:'ct-01', num:'MSA-01284', org:'Ramp',             kind:'Agency MSA',       fee:'22%', guarantee:'90 days',  signed:'2024-03-12', status:'active' },
    { id:'ct-02', num:'MSA-01277', org:'Anthropic',        kind:'Agency MSA + NDA', fee:'25%', guarantee:'120 days', signed:'2024-01-04', status:'active' },
    { id:'ct-03', num:'MSA-01272', org:'Stripe',           kind:'Agency MSA',       fee:'22%', guarantee:'90 days',  signed:'2023-11-18', status:'active' },
    { id:'ct-04', num:'MSA-01268', org:'Linear',           kind:'Growth MSA',       fee:'22%', guarantee:'60 days',  signed:'2024-05-20', status:'expiring' },
    { id:'ct-05', num:'MSA-01265', org:'Vercel',           kind:'Agency MSA',       fee:'22%', guarantee:'90 days',  signed:'2024-04-04', status:'active' },
    { id:'ct-06', num:'MSA-01251', org:'Northfield Talent',kind:'Recruiter T&Cs',  fee:'—',   guarantee:'—',        signed:'2024-06-08', status:'dormant' },
  ]);
  const [signing, setSigning] = useState<any>(null);

  const countersign = (c: any) => {
    const today = new Date().toISOString().slice(0, 10);
    setPending(p => p.filter(x => x.id !== c.id));
    setSigned(s => [{ ...c, signed: today, status:'active' }, ...s]);
    showToast(`Countersigned · ${c.num}`, { kind:'ok' } as any);
    setSigning(null);
  };
  const rejectContract = (c: any) => {
    setPending(p => p.filter(x => x.id !== c.id));
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

      {pending.length > 0 && (
        <div style={{ marginBottom:36 }}>
          <BSec num="§ 00" title="Awaiting your countersign" sub={`${pending.length} PENDING`}/>
          <BHair/>
          <div style={{ border:'1px solid var(--plum-500)', borderRadius:2, background:'var(--plum-50)', overflow:'hidden' }}>
            {pending.map((c, i) => (
              <div key={c.id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1.4fr 90px 120px 140px 200px', gap:16, padding:'16px 20px', borderBottom: i < pending.length - 1 ? '1px solid rgba(123,92,180,.2)' : 'none', alignItems:'center' }}>
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

      <BSec num="§ 02" title="Signed agreements"/>
      <BHair/>
      <div style={{ border:'1px solid var(--hair)', borderRadius:2, background:'#fff', overflow:'hidden' }}>
        <div className="mono" style={{ display:'grid', gridTemplateColumns:'120px 1fr 1.4fr 90px 120px 110px 110px', gap:16, padding:'12px 20px', borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)', fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>
          <span>NO.</span><span>ORG</span><span>KIND</span><span>FEE</span><span>GUARANTEE</span><span>SIGNED</span><span>STATUS</span>
        </div>
        {signed.map((c, i) => (
          <div key={c.id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1.4fr 90px 120px 110px 110px', gap:16, padding:'16px 20px', borderBottom: i < signed.length - 1 ? '1px solid var(--hair)' : 'none', alignItems:'center' }}>
            <span className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--t-3)' }}>{c.num}</span>
            <span style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', letterSpacing:'-0.01em' }}>{c.org}</span>
            <span style={{ fontFamily:'var(--serif)', fontSize:14, color:'var(--t-2)' }}>{c.kind}</span>
            <span className="mono" style={{ fontSize:11 }}>{c.fee}</span>
            <span className="mono" style={{ fontSize:11 }}>{c.guarantee}</span>
            <span className="mono" style={{ fontSize:11, color:'var(--t-3)' }}>{c.signed}</span>
            <span><BChip tone={c.status==='active'?'ok':c.status==='expiring'?'warn':'paper'}>{c.status.toUpperCase()}</BChip></span>
          </div>
        ))}
      </div>

      {signing && <CountersignModal contract={signing} onClose={() => setSigning(null)} onSign={() => countersign(signing)}/>}
    </div>
  );
}
export default AdminContracts;
