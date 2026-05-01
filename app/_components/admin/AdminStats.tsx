'use client';
import React from 'react';
import { useRecruiters, useApplications, usePlacements, transformRecruitersForUI } from '@/lib/hooks/useAdminData';
import { KpiTile as BKpi, SectionTitle as BSec, Hairline as BHair, Mini as BMini } from './AdminViews';

export function AdminStats() {
  const { data: recruitersData, isLoading: recruitersLoading } = useRecruiters();
  const { data: applicationsData, isLoading: appsLoading } = useApplications();
  const { data: placementsData, isLoading: placementsLoading } = usePlacements();

  const isLoading = recruitersLoading || appsLoading || placementsLoading;

  // Transform recruiters data
  const recruiters = transformRecruitersForUI(recruitersData || [], applicationsData || []);
  
  // Calculate stats from real data
  const totalPlacements = placementsData?.length || 0;
  const totalRevenue = placementsData?.reduce((sum: number, p: any) => sum + (p.total_bounty || 0), 0) || 0;
  const activeRecruiters = recruiters.filter(r => r.status === 'active').length;
  const totalSubmitted = applicationsData?.length || 0;
  const totalHired = applicationsData?.filter((a: any) => a.status === 'hired').length || 0;
  const conversionRate = totalSubmitted > 0 ? ((totalHired / totalSubmitted) * 100).toFixed(1) : '0';

  // Mock weekly data - would need time-series queries for real data
  const weeks = [
    { w:'W-07', submitted:58, hired:4 },{ w:'W-06', submitted:64, hired:6 },
    { w:'W-05', submitted:71, hired:5 },{ w:'W-04', submitted:69, hired:8 },
    { w:'W-03', submitted:82, hired:7 },{ w:'W-02', submitted:78, hired:9 },
    { w:'W-01', submitted:96, hired:11 },{ w:'W-00', submitted: Math.max(totalSubmitted, 10), hired: totalHired },
  ];
  const maxS = Math.max(...weeks.map(w => w.submitted));
  const leaders = [...recruiters].filter((r: any) => r.status === 'active').sort((a: any, b: any) => b.placed - a.placed).slice(0, 5);

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · STATS</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          The platform,<br/><span style={{ color:'var(--t-4)' }}>in long form.</span>
        </h1>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--t-4)' }}>Loading stats...</div>
      ) : (
        <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:40 }}>
          <BKpi big label="GROSS REV." value={`$${(totalRevenue / 1000).toFixed(1)}k`} delta={0} sub="ALL TIME"/>
          <BKpi label="PLACEMENTS" value={String(totalPlacements)} delta={0} sub="TOTAL"/>
          <BKpi label="SUBMITTED" value={String(totalSubmitted)} delta={0} sub="CANDIDATES"/>
          <BKpi label="SUBMIT → HIRE" value={`${conversionRate}%`} delta={0}/>
          <BKpi label="ACTIVE RECRUITERS" value={activeRecruiters}/>
        </div>
      )}

      <BSec num="§ 01" title="Submissions & hires" sub="PAST 8 WEEKS"/>
      <BHair/>
      <div style={{ border:'1px solid var(--hair)', padding:'28px 24px 18px', background:'#fff', marginBottom:44 }}>
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${weeks.length}, 1fr)`, gap:14, alignItems:'end', height:220 }}>
          {weeks.map(w => {
            const h = (w.submitted / maxS) * 180;
            const hh = (w.hired / maxS) * 180;
            return (
              <div key={w.w} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ position:'relative', width:'100%', maxWidth:28, height:180, display:'flex', alignItems:'flex-end' }}>
                  <div style={{ position:'absolute', left:0, right:0, bottom:0, height: h, background:'var(--ink)' }}/>
                  <div style={{ position:'absolute', left:0, right:0, bottom:0, height: hh, background:'var(--ok)' }}/>
                </div>
                <span className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>{w.w}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex', gap:18, marginTop:16, fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>
          <span><span style={{ display:'inline-block', width:10, height:10, background:'var(--ink)', marginRight:6, verticalAlign:'middle' }}/>SUBMITTED</span>
          <span><span style={{ display:'inline-block', width:10, height:10, background:'var(--ok)', marginRight:6, verticalAlign:'middle' }}/>HIRED</span>
        </div>
      </div>

      <BSec num="§ 02" title="Top recruiters" sub="BY PLACEMENTS"/>
      <BHair/>
      <div style={{ border:'1px solid var(--hair)', background:'#fff' }}>
        {leaders.map((r: any, i: number) => (
          <div key={r.id} style={{ display:'grid', gridTemplateColumns:'40px 1.4fr 1fr 90px 100px 120px', gap:14, padding:'16px 20px', borderBottom: i < leaders.length - 1 ? '1px solid var(--hair)' : 'none', alignItems:'center' }}>
            <span className="serif" style={{ fontSize:22, fontStyle:'italic', color:'var(--t-4)' }}>{i + 1}</span>
            <div>
              <div style={{ fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic' }}>{r.name}</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{r.org.toUpperCase()}</div>
            </div>
            <div><BMini value={r.placed} max={leaders[0].placed}/></div>
            <div className="mono" style={{ fontSize:11 }}>{r.placed} PLACED</div>
            <div className="mono" style={{ fontSize:11, color:'var(--t-3)' }}>{r.submitted} SUB.</div>
            <div className="mono" style={{ fontSize:11, color:'var(--t-2)' }}>${(r.rev / 1000).toFixed(0)}k</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default AdminStats;
