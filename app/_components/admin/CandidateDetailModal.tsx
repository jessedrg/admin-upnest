'use client';
import React, { useState, useEffect } from 'react';
import { Chip } from './AdminViews';
import { showToast } from './Toast';
import { candidateStore } from './CandidateStore';

const KEY = 'upnest:candidate-notes';
const subs = new Set<() => void>();
const readAll = (): Record<string, any[]> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; } };
const writeAll = (obj: any) => { try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {} for (const fn of subs) try { fn(); } catch {} };

const SEED_NOTES = (id: string): any[] => {
  const hash = String(id).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const v = Math.abs(hash) % 3;
  if (v === 0) return [
    { id:'n1', author:'Jesse Dragstra', role:'recruiter', avatar:'J', org:'Parabol Partners', body:'Submitted after a 45-min intro. Sharp on systems, clearly the lead on the Plaid Link rebuild — owned the migration end-to-end. Comp expectation $245k base. Recommending fast-track.', ts:'4d ago' },
    { id:'n2', author:'Catherine Hughes', role:'client', avatar:'C', org:'Ramp', body:'Strong CV. Bit concerned about the gap between Brex and current role — can you ask what happened there?', ts:'3d ago' },
    { id:'n3', author:'Jesse Dragstra', role:'recruiter', avatar:'J', org:'Parabol Partners', body:'Asked. Took time off to care for a parent, completely fine. Has references from his Brex manager confirming top-tier performer.', ts:'2d ago' },
    { id:'n4', author:'Mira Holt', role:'admin', avatar:'M', org:'upnest', body:'Internal: cross-checked LinkedIn vs CV — all dates match. Eligible for full bounty.', ts:'1d ago' },
  ];
  if (v === 1) return [
    { id:'n1', author:'Noor Salim', role:'recruiter', avatar:'N', org:'Cedar & Finch', body:'Brought to me through a shared connection at Stripe. Currently leading a 4-person platform team — wants more product surface. Available within 6 weeks.', ts:'1w ago' },
    { id:'n2', author:'Jesse Dragstra', role:'admin', avatar:'J', org:'upnest', body:'Spoke to Noor — verified LinkedIn, references warm. Approving the submission.', ts:'5d ago' },
  ];
  return [
    { id:'n1', author:'Ben Ortiz', role:'recruiter', avatar:'B', org:'Independent', body:'Cold email in March, kept the relationship warm. Great fit for the Vercel role specifically — has worked with Next.js since v3.', ts:'2w ago' },
    { id:'n2', author:'Mira Holt', role:'admin', avatar:'M', org:'upnest', body:'Internal: first submission of the quarter. Watch for completeness.', ts:'1w ago' },
    { id:'n3', author:'Guillermo Rauch', role:'client', avatar:'G', org:'Vercel', body:"Looks great on paper. Let's push to phone screen this week.", ts:'3d ago' },
  ];
};

function getNotes(candidateId: string) {
  const all = readAll();
  if (all[candidateId]) return all[candidateId];
  const seed = SEED_NOTES(candidateId);
  all[candidateId] = seed;
  writeAll(all);
  return seed;
}

function addNote(candidateId: string, note: any) {
  const all = readAll();
  const list = all[candidateId] || [];
  list.push({ id: 'n-' + Date.now(), author: 'Jesse Dragstra', role: 'admin', avatar: 'J', org: 'upnest', ...note, ts: 'just now' });
  all[candidateId] = list;
  writeAll(all);
}

function useCandidateNotes(candidateId: string) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick(t => t + 1);
    subs.add(fn);
    return () => { subs.delete(fn); };
  }, []);
  return candidateId ? getNotes(candidateId) : [];
}

const STAGE_ORDER = ['New','Screening','Phone','Technical','Sent to Client','On-site','Offer','Hired'];

const roleColor = (role: string) => role === 'admin' ? 'var(--ink)' : role === 'client' ? 'var(--plum-700)' : 'var(--t-3)';

function NoteAvatar({ note }: any) {
  return (
    <div style={{ width:30, height:30, borderRadius:'50%', background: roleColor(note.role), color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:12, fontStyle:'italic', flexShrink:0 }}>
      {note.avatar}
    </div>
  );
}

function Composer({ onClose, candidateId }: any) {
  const [body, setBody] = useState('');
  const submit = () => {
    if (!body.trim()) return;
    addNote(candidateId, { body: body.trim() });
    showToast('Note added', { kind:'ok' } as any);
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(10,10,11,.4)', display:'flex', alignItems:'flex-end', justifyContent:'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'min(600px, 100vw)', background:'var(--paper)', borderTop:'1px solid var(--hair)', borderLeft:'1px solid var(--hair)', padding:24, display:'flex', flexDirection:'column', gap:12 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>ADD NOTE</div>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Add a note about this candidate…"
          style={{ border:'1px solid var(--hair)', borderRadius:6, padding:'10px 12px', fontFamily:'var(--serif)', fontSize:14, resize:'vertical', outline:'none', lineHeight:1.55 }} autoFocus/>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding:'8px 14px' }}>Cancel</button>
          <button onClick={submit} disabled={!body.trim()} className="btn btn-primary" style={{ padding:'8px 16px', opacity: body.trim() ? 1 : .4 }}>Add note</button>
        </div>
      </div>
    </div>
  );
}

export function CandidateDetailModal({ candidate: c, onClose, viewer = 'admin' }: any) {
  const notes = useCandidateNotes(c?.id);
  const [tab, setTab] = useState<'overview'|'notes'>('overview');
  const [composer, setComposer] = useState(false);

  if (!c) return null;

  const stageIdx = STAGE_ORDER.indexOf(c.stage);

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(10,10,11,.4)', zIndex:200 }}/>
      <div style={{ position:'fixed', right:0, top:0, bottom:0, width:'min(680px, 100vw)', background:'var(--paper)', zIndex:201, boxShadow:'-20px 0 60px rgba(0,0,0,.08)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'24px 32px', borderBottom:'1px solid var(--hair)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexShrink:0 }}>
          <div style={{ display:'flex', gap:16, minWidth:0 }}>
            <div style={{ width:56, height:56, borderRadius:999, background:'var(--ink)', color:'#F3E6CE', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:22, flexShrink:0 }}>{c.initials}</div>
            <div style={{ minWidth:0 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{c.num} · {c.source?.toUpperCase()}</div>
              <div className="serif" style={{ fontSize:30, fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.1, marginTop:4 }}>{c.name}</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:4 }}>{c.title?.toUpperCase()} · {c.current?.toUpperCase()} · {c.years}Y</div>
            </div>
          </div>
          <button onClick={onClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22 }}>✕</button>
        </div>

        {/* Stage track */}
        <div style={{ padding:'16px 32px', borderBottom:'1px solid var(--hair)', flexShrink:0 }}>
          <div style={{ display:'flex', gap:2 }}>
            {STAGE_ORDER.map((s, i) => {
              const reached = i <= stageIdx;
              return (
                <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1, minWidth:0 }}>
                  <div style={{ width:'100%', height:3, background: reached ? 'var(--ink)' : 'var(--hair)' }}/>
                  <span className="mono" style={{ fontSize:8, letterSpacing:'.1em', color: reached ? 'var(--t-2)' : 'var(--t-4)', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%' }}>{s.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding:'0 32px', borderBottom:'1px solid var(--hair)', display:'flex', gap:24, flexShrink:0 }}>
          {(['overview','notes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'12px 0', position:'relative', color: tab===t ? 'var(--ink)' : 'var(--t-3)', fontFamily:'var(--serif)', fontSize:15, fontStyle: tab===t ? 'italic' : 'normal' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}{t === 'notes' && notes.length > 0 && <span className="mono" style={{ marginLeft:6, fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>{notes.length}</span>}
              {tab === t && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflow:'auto', padding:'24px 32px' }}>
          {tab === 'overview' && (
            <>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
                <Chip tone={c.stage==='Hired'?'ok':c.stage==='Rejected'?'err':'paper'}>{c.stage?.toUpperCase()}</Chip>
                {c.location && <Chip tone="paper">{c.location?.toUpperCase()}</Chip>}
                {c.salary && <Chip tone="paper">{c.salary}</Chip>}
                {c.flagged && <Chip tone="err">FLAGGED</Chip>}
                {c.saved && <Chip tone="gold">SAVED</Chip>}
              </div>

              {c.quote && (
                <div className="serif" style={{ fontSize:17, fontStyle:'italic', lineHeight:1.55, color:'var(--t-1)', borderLeft:'3px solid var(--ink)', paddingLeft:16, marginBottom:28 }}>
                  "{c.quote}"
                </div>
              )}

              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>§ ROLE</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', letterSpacing:'-0.01em' }}>{c.role}</div>
              <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{c.org?.toUpperCase()}</div>

              <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginTop:24, marginBottom:6 }}>§ SUBMITTED BY</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic' }}>
                {c.recruiter}
                <span className="mono" style={{ fontSize:10, color:'var(--t-4)', letterSpacing:'.14em', marginLeft:8 }}>{c.submitted?.toUpperCase()}</span>
              </div>

              {c.about && (
                <>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginTop:24, marginBottom:6 }}>§ ABOUT</div>
                  <p style={{ fontFamily:'var(--serif)', fontSize:14, lineHeight:1.65, color:'var(--t-1)', margin:0 }}>{c.about}</p>
                </>
              )}

              {c.tags && c.tags.length > 0 && (
                <>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginTop:24, marginBottom:8 }}>§ TAGS</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {c.tags.map((tag: string) => <Chip key={tag} tone="paper">{tag}</Chip>)}
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'notes' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {notes.length === 0 && <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'var(--t-4)', textAlign:'center', paddingTop:40 }}>No notes yet.</div>}
              {notes.map((note: any) => (
                <div key={note.id} style={{ display:'flex', gap:12 }}>
                  <NoteAvatar note={note}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'baseline', marginBottom:4 }}>
                      <span style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic' }}>{note.author}</span>
                      <span className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>{note.role?.toUpperCase()} · {note.org?.toUpperCase()}</span>
                      <span className="mono" style={{ fontSize:9, letterSpacing:'.12em', color:'var(--t-4)', marginLeft:'auto' }}>{note.ts}</span>
                    </div>
                    <div style={{ fontFamily:'var(--serif)', fontSize:14, lineHeight:1.6, color:'var(--t-1)', background: note.role==='admin' ? 'rgba(10,10,11,.03)' : note.role==='client' ? 'rgba(123,92,180,.04)' : 'transparent', padding: note.role !== 'recruiter' ? '10px 12px' : 0, borderRadius: note.role !== 'recruiter' ? 6 : 0, border: note.role==='admin' ? '1px solid var(--hair)' : note.role==='client' ? '1px solid rgba(123,92,180,.15)' : 'none' }}>
                      {note.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 32px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setComposer(true)} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Add note</button>
            <button className="btn btn-ghost" style={{ padding:'10px 14px' }}>Email recruiter</button>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-ghost" style={{ padding:'10px 14px' }} onClick={() => { showToast('Candidate rejected'); onClose(); }}>Reject</button>
            <button className="btn btn-primary" style={{ padding:'10px 16px' }} onClick={() => showToast('Moved to next stage', { kind:'ok' } as any)}>Advance stage</button>
          </div>
        </div>
      </div>

      {composer && <Composer onClose={() => setComposer(false)} candidateId={c.id}/>}
    </>
  );
}

export function AdminCandidateOverlay() {
  const [candidate, setCandidate] = useState<any>(null);
  useEffect(() => {
    const onOpen = (e: any) => setCandidate(e.detail?.candidate || null);
    window.addEventListener('open-candidate', onOpen);
    return () => window.removeEventListener('open-candidate', onOpen);
  }, []);
  if (!candidate) return null;
  return <CandidateDetailModal candidate={candidate} onClose={() => setCandidate(null)}/>;
}

export default CandidateDetailModal;
