'use client';

import React, { useState } from 'react';

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'14px 16px',
  border:'1px solid var(--hair)',
  background:'var(--paper)',
  fontFamily:'var(--sans)', fontSize:14, color:'var(--ink)',
  outline:'none',
};

const adminInputStyle: React.CSSProperties = {
  width:'100%', padding:'12px 14px',
  border:'1px solid rgba(184,136,88,.4)',
  background:'rgba(10,10,11,.6)',
  fontFamily:'var(--mono)', fontSize:13, color:'#F3E6CE',
  outline:'none', letterSpacing:'.04em',
};

export function AdminLogin({ onEnter }: any) {
  const [op, setOp]     = useState('alex.stein');
  const [code, setCode] = useState('······');

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0B', color:'#F3E6CE', display:'grid', placeItems:'center', fontFamily:'var(--mono)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg, transparent 0 2px, rgba(184,136,88,.025) 2px 3px)', pointerEvents:'none' }}/>
      <div className="login-admin-card" style={{ width:460, maxWidth:'calc(100vw - 32px)', border:'1px solid rgba(184,136,88,.3)', background:'rgba(10,10,11,.7)', padding:'40px 44px', position:'relative' }}>
        <div style={{ position:'absolute', top:-1, left:-1, width:10, height:10, borderTop:'1px solid #B88858', borderLeft:'1px solid #B88858' }}/>
        <div style={{ position:'absolute', top:-1, right:-1, width:10, height:10, borderTop:'1px solid #B88858', borderRight:'1px solid #B88858' }}/>
        <div style={{ position:'absolute', bottom:-1, left:-1, width:10, height:10, borderBottom:'1px solid #B88858', borderLeft:'1px solid #B88858' }}/>
        <div style={{ position:'absolute', bottom:-1, right:-1, width:10, height:10, borderBottom:'1px solid #B88858', borderRight:'1px solid #B88858' }}/>

        <div style={{ fontSize:10, letterSpacing:'.28em', color:'#B88858' }}>§ UPNEST / OPERATOR ACCESS</div>
        <div style={{ fontFamily:'var(--serif)', fontSize:36, fontStyle:'italic', letterSpacing:'-0.02em', lineHeight:1.05, marginTop:14, color:'#F3E6CE' }}>Control room.</div>
        <div style={{ fontSize:11, letterSpacing:'.1em', color:'rgba(243,230,206,.55)', marginTop:8 }}>RESTRICTED — AUTHORIZED OPERATORS ONLY.</div>

        <form onSubmit={e => { e.preventDefault(); onEnter && onEnter(); }} style={{ marginTop:28, display:'flex', flexDirection:'column', gap:14 }}>
          <label>
            <div style={{ fontSize:9, letterSpacing:'.22em', color:'rgba(243,230,206,.5)', marginBottom:6 }}>OPERATOR ID</div>
            <input value={op} onChange={e => setOp(e.target.value)} style={adminInputStyle}/>
          </label>
          <label>
            <div style={{ fontSize:9, letterSpacing:'.22em', color:'rgba(243,230,206,.5)', marginBottom:6 }}>2FA CODE</div>
            <input value={code} onChange={e => setCode(e.target.value)} style={{ ...adminInputStyle, letterSpacing:'.5em' }}/>
          </label>
          <button type="submit" style={{
            appearance:'none', cursor:'pointer',
            background:'#B88858', color:'#0A0A0B',
            border:0, padding:'14px 18px',
            fontSize:11, fontWeight:700, letterSpacing:'.2em',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            marginTop:10,
          }}>
            <span>AUTHENTICATE</span>
            <span>▸</span>
          </button>
          <div style={{ fontSize:9, letterSpacing:'.18em', color:'rgba(243,230,206,.35)', marginTop:8, display:'flex', justifyContent:'space-between' }}>
            <span>SESSION EXPIRES IN 8H</span>
            <span>v3.2.1</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClientLogin({ onEnter, onSignup }: any) {
  const [email, setEmail] = useState('catherine@ramp.com');
  const [pw, setPw]       = useState('••••••••••••');

  return (
    <div className="login-split" style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--paper)' }}>
      <div className="login-brand" style={{ background:'var(--ink)', color:'#F3E6CE', padding:'48px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.24em', color:'rgba(243,230,206,.55)' }}>UPNEST · COMPANIES</div>
        <div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'#B88858' }}>§ 01 — ACCESS</div>
          <div className="serif" style={{ fontSize:'clamp(42px, 5vw, 68px)', fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.02, marginTop:20 }}>
            The hiring layer<br/><span style={{ color:'#B88858' }}>for companies</span><br/>that ship.
          </div>
          <div style={{ fontSize:16, color:'rgba(243,230,206,.7)', fontStyle:'italic', fontFamily:'var(--serif)', marginTop:22, maxWidth:440, lineHeight:1.5 }}>
            "We've placed 847 senior operators since 2022, at a median of 34 days from brief to offer."
          </div>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'rgba(243,230,206,.4)', marginTop:10 }}>— FROM THE LEDGER</div>
        </div>
        <div style={{ display:'flex', gap:24, paddingTop:24, borderTop:'1px solid rgba(243,230,206,.1)' }}>
          {[['847','ROLES CLOSED'],['34d','MEDIAN'],['92%','RETENTION @ 12MO']].map(([v,l]) => (
            <div key={l}>
              <div className="serif" style={{ fontSize:28, fontStyle:'italic' }}>{v}</div>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'rgba(243,230,206,.5)', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="login-form" style={{ padding:'64px 72px', display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:560 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SIGN IN · CLIENT CONSOLE</div>
        <div className="serif login-hero" style={{ fontSize:46, fontStyle:'italic', letterSpacing:'-0.02em', lineHeight:1.05, marginTop:12 }}>Welcome back.</div>
        <div style={{ fontSize:15, color:'var(--t-3)', marginTop:8, fontStyle:'italic', fontFamily:'var(--serif)' }}>Pick up where your pipeline left off.</div>
        <form onSubmit={e => { e.preventDefault(); onEnter && onEnter(); }} style={{ marginTop:40, display:'flex', flexDirection:'column', gap:16 }}>
          <label>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>COMPANY EMAIL</div>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}/>
          </label>
          <label>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>PASSWORD</div>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} style={inputStyle}/>
          </label>
          <button type="submit" className="btn btn-plum" style={{ marginTop:12, padding:'14px 18px', fontSize:14, justifyContent:'space-between' }}>
            <span>Enter the console</span><span style={{ fontFamily:'var(--serif)', fontStyle:'italic' }}>→</span>
          </button>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', textAlign:'center', marginTop:8 }}>
            NEW HERE? — <a href="#" onClick={e => { e.preventDefault(); onSignup && onSignup(); }} style={{ color:'var(--plum-600)' }}>REQUEST ACCESS</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RecruiterLogin({ onEnter, onSignup }: any) {
  const [email, setEmail] = useState('jesse@parabol.co');
  const [pw, setPw]       = useState('••••••••••••');

  return (
    <div className="login-split" style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1.1fr 1fr', background:'var(--paper)' }}>
      <div className="login-form" style={{ padding:'64px 72px', display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:620 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SIGN IN · RECRUITER CONSOLE</div>
        <div className="serif" style={{ fontSize:'clamp(46px, 5vw, 64px)', fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1, marginTop:16 }}>
          Back to<br/><span style={{ color:'var(--plum-600)' }}>the hunt.</span>
        </div>
        <div style={{ fontSize:16, color:'var(--t-3)', marginTop:14, fontStyle:'italic', fontFamily:'var(--serif)', maxWidth:460 }}>
          Your roles are waiting. 12 active, 3 with candidates to submit this week.
        </div>
        <form onSubmit={e => { e.preventDefault(); onEnter && onEnter(); }} style={{ marginTop:40, display:'flex', flexDirection:'column', gap:16, maxWidth:440 }}>
          <label>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>EMAIL</div>
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}/>
          </label>
          <label>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>PASSWORD</div>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} style={inputStyle}/>
          </label>
          <button type="submit" className="btn btn-primary" style={{ marginTop:12, padding:'14px 18px', fontSize:14, justifyContent:'space-between' }}>
            <span>Enter the console</span><span style={{ fontFamily:'var(--serif)', fontStyle:'italic' }}>→</span>
          </button>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', textAlign:'center', marginTop:8 }}>
            NEW HERE? — <a href="#" onClick={e => { e.preventDefault(); onSignup && onSignup(); }} style={{ color:'var(--plum-600)' }}>APPLY TO JOIN</a>
          </div>
        </form>
      </div>
      <div className="login-stats" style={{ background:'color-mix(in oklch, var(--plum-600) 6%, var(--paper))', borderLeft:'1px solid var(--hair)', padding:'64px 56px', display:'flex', flexDirection:'column', justifyContent:'center', gap:24 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-600)' }}>§ THIS WEEK ON UPNEST</div>
        {[
          { k:'Fresh roles', v:'27', s:'new since monday' },
          { k:'Avg bounty',  v:'$18.4k', s:'across active roles' },
          { k:'Top closer',  v:'Priya K.', s:'6 hires this quarter' },
          { k:'Your rank',   v:'#14', s:'of 284 recruiters' },
        ].map(row => (
          <div key={row.k} style={{ borderBottom:'1px solid var(--hair)', paddingBottom:16 }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{row.k.toUpperCase()}</div>
            <div className="serif" style={{ fontSize:36, fontStyle:'italic', letterSpacing:'-0.02em', marginTop:2 }}>{row.v}</div>
            <div style={{ fontSize:12, color:'var(--t-3)', fontStyle:'italic', fontFamily:'var(--serif)' }}>{row.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminLogin;
