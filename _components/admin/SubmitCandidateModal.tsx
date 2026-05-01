'use client';
import React, { useState } from 'react';
import Icons from './Icons';
import { showToast } from './Toast';

const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid var(--hair)', background:'#fff', borderRadius:6, fontFamily:'var(--serif)', fontSize:14, outline:'none' };

function FieldHair({ label, required }: any) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
      <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{label.toUpperCase()}</span>
      {required && <span className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--err)' }}>REQUIRED</span>}
    </div>
  );
}

function ShimRow({ label, value }: any) {
  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--hair)' }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--ok)', flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div className="mono" style={{ fontSize:9, letterSpacing:'.16em', color:'var(--t-4)' }}>{label.toUpperCase()}</div>
        <div style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', marginTop:2 }}>{value}</div>
      </div>
    </div>
  );
}

export function SubmitCandidateModal({ open, closing, onClose, role }: any) {
  const [stage, setStage] = useState<'form'|'submitting'|'done'>('form');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const qs = role?.screeningQs || [
    'Why are you interested in this opportunity?',
    'What is your current compensation and target?',
    'When would you be available to start?',
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
    if (!linkedin.trim()) errs.linkedin = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setStage('submitting');
    setTimeout(() => setStage('done'), 1800);
  };

  const handleClose = () => {
    setStage('form');
    setEmail('');
    setLinkedin('');
    setAnswers(['', '', '']);
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(20,10,40,.48)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation: closing ? 'modalOut .24s var(--ease) forwards' : 'modalIn .2s var(--ease) both' }}>
      <div style={{ width:660, maxWidth:'100%', maxHeight:'92vh', background:'var(--paper)', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'20px 28px', borderBottom:'1px solid var(--hair)', background:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-700)' }}>— SUBMIT CANDIDATE</div>
            <h2 className="serif" style={{ margin:'4px 0 0', fontSize:26, fontStyle:'italic', letterSpacing:'-0.02em' }}>
              {role?.title || 'Submit to role'}
            </h2>
            {role && <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{role.org?.toUpperCase()}</div>}
          </div>
          <button onClick={handleClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22 }}>
            <Icons.Close size={20}/>
          </button>
        </div>

        {stage === 'form' && (
          <>
            <div style={{ flex:1, overflow:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <FieldHair label="Candidate email" required/>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="candidate@example.com" style={{ ...inp, borderColor: errors.email ? 'var(--err)' : 'var(--hair)' }}/>
                {errors.email && <div className="mono" style={{ fontSize:10, color:'var(--err)', marginTop:4 }}>{errors.email}</div>}
              </div>
              <div>
                <FieldHair label="LinkedIn profile" required/>
                <input value={linkedin} onChange={e => setLinkedin(e.target.value)} type="url" placeholder="linkedin.com/in/username" style={{ ...inp, borderColor: errors.linkedin ? 'var(--err)' : 'var(--hair)' }}/>
                {errors.linkedin && <div className="mono" style={{ fontSize:10, color:'var(--err)', marginTop:4 }}>{errors.linkedin}</div>}
              </div>
              <div>
                <FieldHair label="Resume (PDF)"/>
                <div style={{ border:'2px dashed var(--hair)', borderRadius:6, padding:'20px', textAlign:'center', cursor:'pointer', background:'#fff' }}
                  onClick={() => showToast('File upload coming soon')}>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>DRAG PDF OR CLICK TO UPLOAD</div>
                  <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--t-4)', marginTop:6 }}>Max 10MB</div>
                </div>
              </div>
              {qs.length > 0 && (
                <div>
                  <FieldHair label="Screening questions"/>
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {qs.map((q: string, i: number) => (
                      <div key={i}>
                        <div style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'var(--t-2)', marginBottom:6 }}>{q}</div>
                        <textarea value={answers[i] || ''} onChange={e => setAnswers(a => { const n = [...a]; n[i] = e.target.value; return n; })} rows={2}
                          placeholder="Candidate's answer…" style={{ ...inp, resize:'vertical', fontFamily:'var(--serif)', fontSize:13 }}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding:'14px 28px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'space-between', background:'#fff' }}>
              <button onClick={handleClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Cancel</button>
              <button onClick={handleSubmit} className="btn btn-primary" style={{ padding:'10px 20px' }}>Submit candidate →</button>
            </div>
          </>
        )}

        {stage === 'submitting' && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid var(--hair)', borderTopColor:'var(--ink)', animation:'spin 1s linear infinite' }}/>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.18em', color:'var(--t-4)' }}>VERIFYING SUBMISSION…</div>
          </div>
        )}

        {stage === 'done' && (
          <>
            <div style={{ flex:1, padding:'36px 28px', display:'flex', flexDirection:'column', gap:4 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--ok)', marginBottom:16 }}>✓ SUBMISSION RECEIVED</div>
              <ShimRow label="Email" value={email}/>
              <ShimRow label="LinkedIn" value={linkedin}/>
              {role && <ShimRow label="Role" value={role.title}/>}
              <div style={{ marginTop:20, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, lineHeight:1.6, color:'var(--t-3)' }}>
                The candidate will receive an outreach email within 24 hours. You'll be notified when they respond.
              </div>
            </div>
            <div style={{ padding:'14px 28px', borderTop:'1px solid var(--hair)', display:'flex', justifyContent:'flex-end', background:'#fff' }}>
              <button onClick={handleClose} className="btn btn-primary" style={{ padding:'10px 20px' }}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SubmitCandidateModal;
