'use client';

import React from 'react';
import ADMIN_DATA from './AdminData';

/* ========================= shared pieces ========================= */

export function KpiTile({ label, value, delta, sub, big = false }: any) {
  return (
    <div style={{ padding:'18px 22px', borderRight:'1px solid var(--hair)', flex:1, minWidth: big ? 200 : 140 }}>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>{label}</div>
      <div className="serif" style={{ fontSize: big ? 44 : 34, lineHeight:1, marginTop:8, fontStyle:'italic', letterSpacing:'-0.02em' }}>{value}</div>
      {(delta != null || sub) && (
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:8 }}>
          {delta != null && (
            <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color: delta >= 0 ? 'var(--ok)' : 'var(--err)' }}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
            </span>
          )}
          {sub && <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ num, title, sub, right }: any) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, minWidth:0 }}>
        {num && <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{num}</span>}
        <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.01em' }}>{title}</div>
        {sub && <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

export function Hairline() {
  return <div style={{ height:1, background:'var(--hair)', margin:'0 0 20px' }}/>;
}

export function Chip({ tone = 'ink', children, italic = false }: any) {
  const tones: Record<string, any> = {
    ink:   { bg:'#0A0A0B',     fg:'#F3E6CE',             bd:'transparent' },
    paper: { bg:'transparent', fg:'var(--t-2)',           bd:'var(--hair)' },
    ok:    { bg:'transparent', fg:'var(--ok)',            bd:'color-mix(in oklch, var(--ok) 35%, transparent)' },
    warn:  { bg:'transparent', fg:'#9B6700',              bd:'color-mix(in oklch, #9B6700 35%, transparent)' },
    err:   { bg:'transparent', fg:'var(--err)',           bd:'color-mix(in oklch, var(--err) 35%, transparent)' },
    plum:  { bg:'transparent', fg:'var(--plum-600)',      bd:'color-mix(in oklch, var(--plum-600) 35%, transparent)' },
    gold:  { bg:'#B88858',     fg:'#fff',                 bd:'transparent' },
  };
  const t = tones[tone] || tones.ink;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'3px 8px', borderRadius:999,
      background:t.bg, color:t.fg, border:`1px solid ${t.bd}`,
      fontFamily: italic ? 'var(--serif)' : 'var(--mono)', fontSize:10,
      fontStyle: italic ? 'italic' : 'normal',
      letterSpacing: italic ? '-0.01em' : '.1em',
      textTransform: italic ? 'none' : 'uppercase',
      whiteSpace:'nowrap',
    }}>{children}</span>
  );
}

export function HealthDot({ v }: any) {
  const c = v==='healthy' ? 'var(--ok)' : v==='at-risk' ? '#D99C1E' : v==='dormant' ? 'var(--t-4)' : 'var(--err)';
  return <span style={{ display:'inline-block', width:7, height:7, borderRadius:999, background:c, boxShadow:`0 0 0 3px color-mix(in oklch, ${c} 18%, transparent)` }}/>;
}

export function Mini({ value, max, accent = 'var(--ink)' }: any) {
  const w = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height:3, background:'var(--hair)', borderRadius:2, overflow:'hidden', minWidth:60 }}>
      <div style={{ width: w + '%', height:'100%', background: accent }}/>
    </div>
  );
}

export const AdminShared = { KpiTile, SectionTitle, Hairline, Chip, HealthDot, Mini };

/* ========================= Overview ========================= */

export function AdminOverview({ onNavigate }: any) {
  const d = ADMIN_DATA;
  const totalMrr = d.orgs.reduce((s: number, o: any) => s + o.mrr, 0);
  const totalCands = d.candidates.length;
  const openRoles = d.roles.filter((r: any) => r.status === 'open').length;
  const pendingRecruiters = d.recruiters.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom:36 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>VOL. 04 · OPERATOR CONSOLE</div>
        <h1 className="serif" style={{ fontSize:'clamp(48px, 6vw, 68px)', fontStyle:'italic', lineHeight:1, letterSpacing:'-0.03em', marginTop:10, maxWidth:900 }}>
          The whole platform,<br/><span style={{ color:'var(--t-4)' }}>one page.</span>
        </h1>
        <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:14 }}>
          LAST SYNC · 2 MIN AGO · {d.orgs.length} ORGS · {d.recruiters.length} RECRUITERS · {d.roles.length} ROLES
        </div>
      </div>

      <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:40 }}>
        <KpiTile label="MRR"          value={'$' + (totalMrr/1000).toFixed(1) + 'K'} delta={+12} sub="vs last mo"/>
        <KpiTile label="ORGS"         value={d.orgs.length} delta={+2} sub="2 new this mo"/>
        <KpiTile label="OPEN ROLES"   value={openRoles} delta={+4} sub="across 5 orgs"/>
        <KpiTile label="CANDIDATES"   value={totalCands} delta={+18} sub="this month"/>
        <KpiTile label="PENDING REC." value={pendingRecruiters} sub="awaiting approval"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:48 }} className="stack-mobile">
        <div>
          <SectionTitle num="§ 01" title="Pipeline health" sub="BY STAGE"/>
          <Hairline/>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {d.stages.map((s: string, i: number) => {
              const total = d.candidates.filter((c: any) => c.stage === s).length;
              const pct = (total / d.candidates.length) * 100;
              return (
                <div key={s} style={{ display:'grid', gridTemplateColumns:'160px 1fr 60px', gap:16, alignItems:'center', padding:'8px 0', borderBottom: i < d.stages.length-1 ? '1px solid var(--hair)' : 'none' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic' }}>{s}</div>
                  <div style={{ height:4, background:'var(--hair)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width: pct+'%', height:'100%', background: s==='Hired' ? 'var(--ok)' : s==='Rejected' ? 'var(--err)' : 'var(--ink)' }}/>
                  </div>
                  <div className="mono" style={{ fontSize:11, letterSpacing:'.1em', color:'var(--t-3)', textAlign:'right' }}>{total}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:40 }}>
            <SectionTitle num="§ 02" title="Organizations at a glance"/>
            <Hairline/>
            <div style={{ display:'flex', flexDirection:'column' }}>
              {d.orgs.slice(0,6).map((o: any, i: number) => (
                <button key={o.id} onClick={() => onNavigate && onNavigate('organizations')}
                  style={{
                    appearance:'none', textAlign:'left', width:'100%', border:0, background:'transparent', cursor:'pointer',
                    display:'grid', gridTemplateColumns:'40px 1fr auto auto auto', gap:18, alignItems:'center',
                    padding:'14px 0', borderBottom:'1px solid var(--hair)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in oklch, var(--ink) 2%, transparent)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width:36, height:36, borderRadius:8, border:'1px solid var(--hair)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:17 }}>{o.logo}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', letterSpacing:'-0.01em' }}>{o.name}</div>
                    <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{o.type.toUpperCase()} · {o.tier.toUpperCase()} · {o.seats} SEATS</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <HealthDot v={o.health}/>
                    <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-3)' }}>{o.health.toUpperCase()}</span>
                  </div>
                  <div className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--t-2)' }}>${(o.mrr/1000).toFixed(1)}k<span style={{ color:'var(--t-4)' }}>/mo</span></div>
                  <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)' }}>→</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle num="§ 03" title="Live activity"/>
          <Hairline/>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {d.activity.map((a: any) => (
              <div key={a.id} style={{ padding:'14px 0', borderBottom:'1px solid var(--hair)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:12 }}>
                  <div style={{ minWidth:0 }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize:15, letterSpacing:'-0.01em' }}>{a.actor}</span>
                    <span style={{ color:'var(--t-4)', margin:'0 6px' }}>·</span>
                    <span style={{ color:'var(--t-3)', fontSize:14 }}>{a.verb}</span>
                  </div>
                  <span className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', whiteSpace:'nowrap' }}>{a.at.toUpperCase()}</span>
                </div>
                <div style={{ marginTop:4, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, color:'var(--t-1)' }}>{a.target}</div>
                {a.to && <div className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)', marginTop:3 }}>{a.to}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
