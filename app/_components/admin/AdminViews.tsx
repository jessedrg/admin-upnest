'use client';

import React from 'react';
import { useOrganizations, useAgencies, useRoles, useApplications, useRecruiters, transformOrgsForUI, transformRolesForUI, transformCandidatesForUI, transformRecruitersForUI } from '@/lib/hooks/useAdminData';

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

// Skeleton loading components
export function Skeleton({ width = '100%', height = 20, style = {} }: { width?: string | number, height?: number, style?: React.CSSProperties }) {
  return (
    <div 
      className="skeleton-pulse"
      style={{ 
        width, 
        height, 
        background: 'linear-gradient(90deg, var(--hair) 25%, color-mix(in oklch, var(--hair) 60%, #fff) 50%, var(--hair) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        borderRadius: 4,
        ...style
      }}
    />
  );
}

export function SkeletonRow({ cols = 5, height = 16 }: { cols?: number, height?: number }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--hair)', alignItems: 'center' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={height} width={i === 0 ? '15%' : i === 1 ? '25%' : '12%'} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number, cols?: number }) {
  return (
    <div style={{ border: '1px solid var(--hair)', background: '#fff', borderRadius: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--hair)', borderRight: 0, marginBottom: 32 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ padding: '18px 22px', borderRight: '1px solid var(--hair)', flex: 1, minWidth: 140 }}>
          <Skeleton width="60%" height={10} style={{ marginBottom: 12 }} />
          <Skeleton width="50%" height={34} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={10} />
        </div>
      ))}
    </div>
  );
}

export const AdminShared = { KpiTile, SectionTitle, Hairline, Chip, HealthDot, Mini, Skeleton, SkeletonRow, SkeletonTable, SkeletonStats };

/* ========================= Overview ========================= */

const STAGES = ['New', 'Screening', 'Phone', 'Technical', 'Sent to Client', 'On-site', 'Offer', 'Hired', 'Rejected'];

export function AdminOverview({ onNavigate }: any) {
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const { data: agenciesData, isLoading: agenciesLoading } = useAgencies();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: applicationsData, isLoading: appsLoading } = useApplications();
  const { data: recruitersData, isLoading: recruitersLoading } = useRecruiters();

  // Transform data
  const orgs = transformOrgsForUI(orgsData || [], agenciesData || []);
  const roles = transformRolesForUI(rolesData || [], applicationsData || []);
  const candidates = transformCandidatesForUI(applicationsData || []);
  const recruiters = transformRecruitersForUI(recruitersData || [], applicationsData || []);
  const isLoading = orgsLoading || agenciesLoading || rolesLoading || appsLoading || recruitersLoading;

  const totalMrr = orgs.reduce((s: number, o: any) => s + (o.mrr || 0), 0);
  const totalCands = candidates.length;
  const openRoles = roles.filter((r: any) => r.status === 'open').length;
  const pendingRecruiters = recruiters.filter((r: any) => r.status === 'pending').length;

  // Generate activity from recent applications
  const activity = applicationsData?.slice(0, 10).map((app: any) => ({
    id: app.id,
    actor: app.candidate_name || 'Unknown',
    verb: getStatusVerb(app.status),
    target: app.roles?.title || 'Unknown Role',
    to: app.roles?.company_name || '',
    at: formatTimeAgo(app.updated_at || app.created_at),
  })) || [];

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom:36 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>VOL. 04 · OPERATOR CONSOLE</div>
        <h1 className="serif" style={{ fontSize:'clamp(48px, 6vw, 68px)', fontStyle:'italic', lineHeight:1, letterSpacing:'-0.03em', marginTop:10, maxWidth:900 }}>
          The whole platform,<br/><span style={{ color:'var(--t-4)' }}>one page.</span>
        </h1>
        <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:14 }}>
          {isLoading ? 'LOADING...' : `LIVE DATA · ${orgs.length} ORGS · ${recruiters.length} RECRUITERS · ${roles.length} ROLES`}
        </div>
      </div>

      <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:40 }}>
        <KpiTile label="MRR"          value={'$' + (totalMrr/1000).toFixed(1) + 'K'} delta={0} sub="from DB"/>
        <KpiTile label="ORGS"         value={orgs.length} delta={0} sub="total"/>
        <KpiTile label="OPEN ROLES"   value={openRoles} delta={0} sub={`of ${roles.length}`}/>
        <KpiTile label="CANDIDATES"   value={totalCands} delta={0} sub="total"/>
        <KpiTile label="PENDING REC." value={pendingRecruiters} sub="awaiting approval"/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:48 }} className="stack-mobile">
        <div>
          <SectionTitle num="§ 01" title="Pipeline health" sub="BY STAGE"/>
          <Hairline/>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {STAGES.map((s: string, i: number) => {
              const total = candidates.filter((c: any) => c.stage === s).length;
              const pct = candidates.length > 0 ? (total / candidates.length) * 100 : 0;
              return (
                <div key={s} style={{ display:'grid', gridTemplateColumns:'160px 1fr 60px', gap:16, alignItems:'center', padding:'8px 0', borderBottom: i < STAGES.length-1 ? '1px solid var(--hair)' : 'none' }}>
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
              {orgs.slice(0,6).map((o: any, i: number) => (
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
            {activity.length === 0 && <div style={{ color:'var(--t-4)', fontStyle:'italic', padding:'20px 0' }}>No activity yet</div>}
            {activity.map((a: any) => (
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

function getStatusVerb(status: string): string {
  const verbs: Record<string, string> = {
    'new': 'applied to',
    'screening': 'moved to screening for',
    'phone': 'scheduled phone screen for',
    'technical': 'in technical review for',
    'sent_to_client': 'sent to client for',
    'onsite': 'scheduled onsite for',
    'offer': 'received offer for',
    'hired': 'was hired for',
    'rejected': 'was rejected for'
  }
  return verbs[status] || `status changed to ${status} for`
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default AdminOverview;
