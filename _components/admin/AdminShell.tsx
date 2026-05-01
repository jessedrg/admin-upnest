'use client';

import React, { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { key: 'overview',      label: 'Overview' },
  { key: 'roles',         label: 'Roles' },
  { key: 'candidates',    label: 'Candidates' },
  { key: 'organizations', label: 'Organizations' },
  { key: 'recruiters',    label: 'Recruiters' },
  { key: 'contracts',     label: 'Contracts' },
  { key: 'stats',         label: 'Stats' },
  { key: 'activity',      label: 'Activity' },
];

const INK = '#0A0A0B';
const PAPER_DIM = 'rgba(243,230,206,.7)';
const PAPER_ACTIVE = '#F3E6CE';

export function AdminNav({ current, onNavigate, onExitAdmin }: any) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('upnest:admin-nav:collapsed') === '1'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 860);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { if (!isMobile) setMobileOpen(false); }, [isMobile]);

  useEffect(() => {
    try { localStorage.setItem('upnest:admin-nav:collapsed', collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  const navigate = (k: string) => { onNavigate && onNavigate(k); setMobileOpen(false); };
  const width = isMobile ? 260 : (collapsed ? 64 : 210);

  const railContent = (
    <>
      <div style={{ marginBottom:40, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        {!collapsed || isMobile ? (
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <div className="serif" style={{ fontSize:26, letterSpacing:'-0.03em', lineHeight:1, fontStyle:'italic', color: PAPER_ACTIVE }}>upnest</div>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color: PAPER_ACTIVE, opacity:.6 }}>/ADMIN</div>
            </div>
            <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color: PAPER_ACTIVE, opacity:.4, marginTop:6 }}>OPERATOR CONSOLE</div>
          </div>
        ) : (
          <div className="serif" style={{ fontSize:22, fontStyle:'italic', color: PAPER_ACTIVE }}>u</div>
        )}
        {!isMobile && (
          <button onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'Expand' : 'Collapse'}
            style={{ appearance:'none', border:'1px solid rgba(243,230,206,.2)', background:'transparent', width:22, height:22, borderRadius:6, cursor:'pointer', color: PAPER_DIM, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, flexShrink:0 }}>
            {collapsed ? '›' : '‹'}
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} aria-label="Close"
            style={{ appearance:'none', border:0, background:'transparent', width:32, height:32, cursor:'pointer', fontSize:18, color: PAPER_DIM }}>✕</button>
        )}
      </div>

      <nav style={{ flex:1, overflow:'hidden auto', display:'flex', flexDirection:'column', gap:2 }}>
        {NAV_ITEMS.map(item => {
          const active = current === item.key;
          const showLabel = !collapsed || isMobile;
          return (
            <button key={item.key} onClick={() => navigate(item.key)}
              title={!showLabel ? item.label : undefined}
              style={{
                position:'relative', appearance:'none', border:0,
                background:'transparent',
                color: active ? PAPER_ACTIVE : PAPER_DIM,
                padding: showLabel ? '7px 0' : '9px 0',
                textAlign: showLabel ? 'left' : 'center',
                cursor:'pointer',
                fontFamily:'var(--serif)',
                fontSize: showLabel ? 17 : 15,
                letterSpacing:'-0.01em',
                fontStyle: active ? 'italic' : 'normal',
                transition:'color .15s',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = PAPER_ACTIVE; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = PAPER_DIM; }}>
              {active && showLabel && <span style={{ position:'absolute', left:-22, top:'50%', transform:'translateY(-50%)', width:3, height:18, background:'#B88858' }}/>}
              {active && !showLabel && <span style={{ position:'absolute', left:4, top:'50%', transform:'translateY(-50%)', width:3, height:16, background:'#B88858' }}/>}
              {showLabel ? item.label : item.label[0]}
            </button>
          );
        })}
      </nav>

      <div style={{ paddingTop:16, marginTop:16, borderTop:'1px solid rgba(243,230,206,.15)', display:'flex', flexDirection:'column', gap:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 0 12px' }}>
          <div style={{ width:26, height:26, borderRadius:999, background:'linear-gradient(135deg, #F3E6CE, #B88858)', color: INK, fontFamily:'var(--serif)', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>A</div>
          {(!collapsed || isMobile) && (
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:12, color: PAPER_ACTIVE, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Alex Stein</div>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.12em', color: PAPER_DIM, opacity:.7 }}>PLATFORM ADMIN</div>
            </div>
          )}
        </div>
        {(!collapsed || isMobile) && (
          <button onClick={onExitAdmin}
            style={{ appearance:'none', border:0, background:'transparent', color: PAPER_DIM, padding:'6px 0', textAlign:'left', cursor:'pointer', fontFamily:'var(--serif)', fontSize:15, letterSpacing:'-0.01em' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = PAPER_ACTIVE)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = PAPER_DIM)}>
            ← Exit admin
          </button>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div style={{ position:'sticky', top:0, zIndex:80, background: INK, borderBottom:'1px solid rgba(243,230,206,.12)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', color: PAPER_ACTIVE }}>
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
            style={{ appearance:'none', border:'1px solid rgba(243,230,206,.2)', background:'transparent', width:36, height:36, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: PAPER_ACTIVE, padding:0 }}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 1h14M1 6h14M1 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.03em' }}>upnest</div>
            <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', opacity:.6 }}>/ADMIN</div>
          </div>
          <div style={{ width:36 }}/>
        </div>
        {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:90 }}/>}
        <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:260, background: INK, borderRight:'1px solid rgba(243,230,206,.12)', display:'flex', flexDirection:'column', padding:'20px 22px 22px', zIndex:100, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition:'transform .28s var(--ease)' }}>
          {railContent}
        </aside>
      </>
    );
  }

  return (
    <aside style={{ width, flexShrink:0, height:'100vh', background: INK, color: PAPER_ACTIVE, display:'flex', flexDirection:'column', padding: collapsed ? '28px 10px 22px' : '28px 22px 22px', position:'sticky', top:0, borderRight:'1px solid rgba(243,230,206,.12)', transition:'width .22s var(--ease), padding .22s var(--ease)' }}>
      {railContent}
    </aside>
  );
}

export function AdminTopBar({ title, subtitle, right }: any) {
  return (
    <div style={{ padding:'16px 28px', borderBottom:'1px solid var(--hair)', background:'var(--paper)', position:'sticky', top:0, zIndex:10, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
        <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>ADMIN /</span>
        <div style={{ minWidth:0 }}>
          <div className="serif" style={{ fontSize:18, fontStyle:'italic', letterSpacing:'-0.01em', lineHeight:1.1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
          {subtitle && <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>{right}</div>
    </div>
  );
}

export default AdminNav;
