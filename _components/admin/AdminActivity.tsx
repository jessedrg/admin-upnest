'use client';
import React from 'react';
import ADMIN_DATA from './AdminData';

export function AdminActivity() {
  const d = ADMIN_DATA;
  const days = [
    { day:'Today',      items: d.activity.slice(0, 6) },
    { day:'Yesterday',  items: d.activity.slice(6, 8) },
    { day:'2 days ago', items: d.activity.slice(8) },
  ];

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · ACTIVITY · AUDIT</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          Everything that happened,<br/><span style={{ color:'var(--t-4)' }}>in order.</span>
        </h1>
      </div>

      {days.map(group => (
        <div key={group.day} style={{ marginBottom:36 }}>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:10 }}>§ {group.day.toUpperCase()}</div>
          <div style={{ borderTop:'1px solid var(--hair)' }}>
            {group.items.map((a: any) => (
              <div key={a.id} style={{ padding:'18px 0', borderBottom:'1px solid var(--hair)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'100px 1fr', gap:18, alignItems:'baseline' }}>
                  <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{a.at.toUpperCase()}</span>
                  <div>
                    <div>
                      <span style={{ fontFamily:'var(--serif)', fontSize:17 }}>{a.actor}</span>
                      <span style={{ color:'var(--t-4)', margin:'0 8px' }}>·</span>
                      <span style={{ color:'var(--t-3)', fontSize:15 }}>{a.verb}</span>
                      <span style={{ color:'var(--t-4)', margin:'0 8px' }}>—</span>
                      <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:17 }}>{a.target}</span>
                    </div>
                    {a.to && <div style={{ marginTop:4, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'var(--t-3)' }}>{a.to}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export default AdminActivity;
