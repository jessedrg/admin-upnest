'use client';

import React, { useState, useEffect } from 'react';
import { candidateStore } from './CandidateStore';
import { showToast } from './Toast';

const REJECT_REASONS = [
  { code:'not_qualified',    label:'Not a fit · skills',    tone:'fit',      detail:'Skill set or experience level doesn\'t match the brief.' },
  { code:'not_culture',      label:'Not a fit · culture',   tone:'fit',      detail:'Strong gut signal from the client team on culture fit.' },
  { code:'comp_mismatch',    label:'Comp mismatch',         tone:'logistic', detail:'Candidate\'s expectations exceed role budget.' },
  { code:'location',         label:'Location / remote',     tone:'logistic', detail:'Can\'t meet the role\'s location or work-mode requirement.' },
  { code:'exp_level',        label:'Wrong level',           tone:'fit',      detail:'Too junior or too senior for the scope.' },
  { code:'client_passed',    label:'Client passed',         tone:'fit',      detail:'Client reviewed and decided not to move forward.' },
  { code:'withdrew',         label:'Candidate withdrew',    tone:'withdraw', detail:'Candidate pulled themselves out of the process.' },
  { code:'role_filled',      label:'Role filled',           tone:'logistic', detail:'Position was closed or filled via another channel.' },
  { code:'other',            label:'Other',                 tone:'logistic', detail:'Provide detail in the note below.' },
];

const WITHDRAW_REASONS = [
  { code:'accepted_offer',   label:'Accepted another offer', tone:'candidate', detail:'Candidate took a competing offer.' },
  { code:'not_interested',   label:'Not interested in role', tone:'candidate', detail:'Candidate changed their mind about this opportunity.' },
  { code:'comp_mismatch',    label:'Compensation mismatch',  tone:'candidate', detail:'Offer or expected comp didn\'t align.' },
  { code:'location',         label:'Location conflict',       tone:'logistic',  detail:'Remote / onsite terms aren\'t workable.' },
  { code:'personal',         label:'Personal reasons',        tone:'candidate', detail:'Candidate cited personal circumstances.' },
  { code:'no_response',      label:'No response',             tone:'recruiter', detail:'Candidate became unresponsive after submission.' },
  { code:'other',            label:'Other',                   tone:'logistic',  detail:'Provide detail in the note below.' },
];

let _openFn: ((args: any) => void) | null = null;

export function openRejectModal(args: { candidate: any; actor?: any; mode?: 'reject' | 'withdraw' }) {
  if (_openFn) _openFn(args);
}

export function RejectModal() {
  const [open, setOpen]   = useState(false);
  const [c, setC]         = useState<any>(null);
  const [actor, setActor] = useState<any>(null);
  const [mode, setMode]   = useState<'reject' | 'withdraw'>('reject');
  const [code, setCode]   = useState('not_qualified');
  const [note, setNote]   = useState('');

  useEffect(() => {
    _openFn = ({ candidate, actor: act, mode: m }) => {
      const md = m === 'withdraw' ? 'withdraw' : 'reject';
      setC(candidate);
      setActor(act || null);
      setMode(md);
      setCode(md === 'withdraw' ? 'accepted_offer' : 'not_qualified');
      setNote('');
      setOpen(true);
    };
    return () => { _openFn = null; };
  }, []);

  if (!open || !c) return null;

  const isWithdraw = mode === 'withdraw';
  const REASONS = isWithdraw ? WITHDRAW_REASONS : REJECT_REASONS;
  const selected = REASONS.find(r => r.code === code) || REASONS[0];
  const accent = isWithdraw ? 'var(--ink)' : 'var(--err)';

  const submit = () => {
    if (code === 'other' && !note.trim()) return;
    if (isWithdraw) {
      candidateStore.withdraw(c.id, code, note, actor);
      showToast('Withdrawn · ' + c.name, { kind: 'info' } as any);
    } else {
      candidateStore.reject(c.id, code, note, actor);
      showToast('Rejected · ' + c.name, { kind: 'error' } as any);
    }
    setOpen(false);
  };

  const close = () => setOpen(false);

  const groups = isWithdraw
    ? [
        { label: 'Candidate-side', items: REASONS.filter(r => r.tone === 'candidate') },
        { label: 'Recruiter-side', items: REASONS.filter(r => r.tone === 'recruiter') },
        { label: 'Logistics',      items: REASONS.filter(r => r.tone === 'logistic') },
      ]
    : [
        { label: 'Fit & evaluation', items: REASONS.filter(r => r.tone === 'fit') },
        { label: 'Logistics',        items: REASONS.filter(r => r.tone === 'logistic') },
        { label: 'Withdrew',         items: REASONS.filter(r => r.tone === 'withdraw') },
      ];

  const headerLabel = isWithdraw ? '§ WITHDRAW CANDIDATE' : '§ REJECT CANDIDATE';
  const headerHeadline = isWithdraw
    ? <>{`Why are you pulling `}<em style={{ color:'var(--t-2)' }}>{c.name}</em>{` from the pipeline?`}</>
    : <>{`Why are you rejecting `}<em style={{ color:'var(--t-2)' }}>{c.name}</em>{'?'}</>;
  const headerSub = isWithdraw
    ? "Visible to the client team — they'll see this candidate as withdrawn with the reason below."
    : "Visible to your team — and to the client if this candidate was sent. Pick a reason; add detail if it helps.";
  const confirmLabel = isWithdraw ? 'Confirm withdrawal' : 'Confirm rejection';
  const disabled = code === 'other' && !note.trim();

  return (
    <>
      <div onClick={close} style={{ position:'fixed', inset:0, background:'rgba(20,10,40,.45)', zIndex:80, backdropFilter:'blur(2px)' }}/>

      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'min(560px, 94vw)', maxHeight:'90vh', overflowY:'auto',
        background:'var(--paper)', border:'1px solid var(--hair-strong)',
        borderRadius:14, zIndex:81,
        boxShadow:'0 30px 80px rgba(20,10,40,.25)',
      }}>
        <div style={{ padding:'22px 28px 14px', borderBottom:'1px solid var(--hair)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
          <div style={{ minWidth:0 }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:accent, marginBottom:8 }}>{headerLabel}</div>
            <div className="serif" style={{ fontSize:24, letterSpacing:'-0.02em', lineHeight:1.15 }}>{headerHeadline}</div>
            <div style={{ fontSize:12, color:'var(--t-3)', marginTop:6, fontFamily:'var(--serif)', fontStyle:'italic' }}>{headerSub}</div>
          </div>
          <button onClick={close} style={{ appearance:'none', border:'1px solid var(--hair)', background:'#fff', width:30, height:30, borderRadius:999, cursor:'pointer', fontSize:14, color:'var(--t-3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
        </div>

        <div style={{ padding:'18px 28px 6px' }}>
          {groups.map((g, gi) => (
            <div key={g.label} style={{ marginBottom: gi === groups.length - 1 ? 4 : 18 }}>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:8 }}>{g.label.toUpperCase()}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {g.items.map(r => {
                  const active = code === r.code;
                  return (
                    <button key={r.code} onClick={() => setCode(r.code)} style={{
                      appearance:'none', cursor:'pointer',
                      border: active ? `1px solid ${accent}` : '1px solid var(--hair)',
                      background: active ? accent : '#fff',
                      color: active ? '#fff' : 'var(--t-2)',
                      padding:'8px 14px', borderRadius:999,
                      fontFamily:'var(--sans)', fontSize:13,
                      transition:'all .15s',
                    }}>
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ margin:'4px 28px 16px', padding:'12px 14px', border:'1px dashed var(--hair-strong)', borderRadius:8, background:'#fff', display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ width:7, height:7, borderRadius:999, background:accent, marginTop:7, flexShrink:0 }}/>
            <div>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:3 }}>SELECTED REASON</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'var(--t-2)' }}>
                {selected.label} — <span style={{ color:'var(--t-3)' }}>{selected.detail}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding:'0 28px 8px' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 }}>
            <label className="mono" style={{ fontSize:9, letterSpacing:'.22em', color:'var(--t-4)' }}>
              ADDITIONAL CONTEXT {code === 'other' ? <span style={{ color:'var(--err)' }}>· REQUIRED</span> : <span style={{ color:'var(--t-4)' }}>· OPTIONAL</span>}
            </label>
            <span className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>{note.length}/280</span>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 280))}
            placeholder={code === 'other' ? 'Tell us what happened…' : 'Optional: specifics for the team.'}
            rows={3}
            style={{ width:'100%', resize:'vertical', border:'1px solid var(--hair)', borderRadius:8, padding:'10px 12px', fontFamily:'var(--sans)', fontSize:13, color:'var(--t-1)', background:'#fff', outline:'none', lineHeight:1.5 }}
            onFocus={e => (e.target.style.borderColor = accent)}
            onBlur={e => (e.target.style.borderColor = 'var(--hair)')}
          />
        </div>

        <div style={{ padding:'14px 28px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:11, color:'var(--t-4)', fontFamily:'var(--serif)', fontStyle:'italic' }}>
            {isWithdraw ? 'You can re-submit this candidate later if circumstances change.' : "You can un-reject later from the candidate's profile."}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={close} className="btn btn-ghost" style={{ padding:'9px 14px', fontSize:13 }}>Cancel</button>
            <button onClick={submit} disabled={disabled}
              style={{
                appearance:'none', cursor: disabled ? 'not-allowed' : 'pointer',
                border: `1px solid ${accent}`,
                background: disabled ? 'var(--paper-2)' : accent,
                color: disabled ? 'var(--t-3)' : '#fff',
                padding:'10px 18px', borderRadius:999,
                fontFamily:'var(--sans)', fontSize:13, fontWeight:500,
                opacity: disabled ? .55 : 1, transition:'opacity .15s',
              }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default RejectModal;
