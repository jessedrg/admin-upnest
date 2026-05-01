'use client';
import React, { useState, useEffect } from 'react';
import Icons from './Icons';
import { showToast } from './Toast';

const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', border:'1px solid var(--hair)', background:'#fff', borderRadius:6, fontFamily:'var(--serif)', fontSize:14, outline:'none', lineHeight:1.5 };

function Field({ label, children }: any) {
  return (
    <div>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:6 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function InputStep({ onNext, onClose }: any) {
  const [jd, setJd] = useState('');
  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <div style={{ padding:'28px 32px', flex:1, overflow:'auto' }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-700)', marginBottom:16 }}>§ STEP 1 OF 3 · PASTE JOB DESCRIPTION</div>
        <p style={{ fontFamily:'var(--serif)', fontSize:15, lineHeight:1.6, color:'var(--t-2)', marginBottom:20 }}>
          Paste the full job description below. Our AI will extract role details, requirements, and compensation automatically.
        </p>
        <textarea value={jd} onChange={e => setJd(e.target.value)} rows={16} placeholder="Paste job description here…"
          style={{ ...inp, resize:'vertical', fontFamily:'var(--serif)', fontSize:14 }}/>
      </div>
      <div style={{ padding:'14px 28px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'space-between', background:'#fff' }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Cancel</button>
        <button onClick={() => onNext(jd)} disabled={!jd.trim()} className="btn btn-primary" style={{ padding:'10px 20px', opacity: jd.trim() ? 1 : .4 }}>
          Analyze with AI →
        </button>
      </div>
    </div>
  );
}

function AnalyzingStep() {
  const steps = ['Parsing job description…', 'Extracting requirements…', 'Calibrating compensation bands…', 'Generating role draft…'];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 600);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:32 }}>
      <div style={{ width:64, height:64, borderRadius:'50%', border:'3px solid var(--hair)', borderTopColor:'var(--ink)', animation:'spin 1s linear infinite' }}/>
      <div style={{ textAlign:'center' }}>
        <div className="serif" style={{ fontSize:24, fontStyle:'italic', marginBottom:8 }}>Analyzing…</div>
        <div className="mono" style={{ fontSize:11, letterSpacing:'.16em', color:'var(--t-4)' }}>{steps[step]}</div>
      </div>
    </div>
  );
}

function ReviewStep({ draft, onClose, onCreated }: any) {
  const [tab, setTab] = useState('basic');
  const [title, setTitle] = useState(draft.title || '');
  const [org, setOrg] = useState(draft.org || '');
  const [location, setLocation] = useState(draft.location || 'San Francisco');
  const [workMode, setWorkMode] = useState(draft.workMode || 'Hybrid');
  const [seniority, setSeniority] = useState(draft.seniority || 'Senior');
  const [salary, setSalary] = useState(draft.salary || '$160–210k');
  const [headcount, setHeadcount] = useState(draft.headcount || 1);
  const [priority, setPriority] = useState(draft.priority || 'med');
  const [description, setDescription] = useState(draft.description || '');
  const [requirements, setRequirements] = useState(draft.requirements || '');
  const [skills, setSkills] = useState<string[]>(draft.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const tabs = [{ k:'basic', l:'Basic' },{ k:'details', l:'Details' },{ k:'skills', l:'Skills' },{ k:'recruiter', l:'Recruiter' }];

  const submit = () => {
    showToast(`Role created · ${title || 'New Role'}`, { kind:'ok' } as any);
    onCreated?.();
    onClose();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      <div style={{ padding:'0 32px', borderBottom:'1px solid var(--hair)', display:'flex', gap:22 }}>
        {tabs.map(t => {
          const A = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', padding:'14px 0', position:'relative', color: A ? 'var(--ink)' : 'var(--t-3)', fontFamily:'var(--serif)', fontSize:15, fontStyle: A ? 'italic' : 'normal' }}>
              {t.l}{A && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
            </button>
          );
        })}
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'24px 32px' }}>
        {tab === 'basic' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <Field label="Role title"><input value={title} onChange={e => setTitle(e.target.value)} style={inp}/></Field>
            <Field label="Organization"><input value={org} onChange={e => setOrg(e.target.value)} style={inp}/></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
              <Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} style={inp}/></Field>
              <Field label="Work mode">
                <select value={workMode} onChange={e => setWorkMode(e.target.value)} style={inp}>
                  <option>Remote</option><option>Hybrid</option><option>Onsite</option>
                </select>
              </Field>
              <Field label="Seniority">
                <select value={seniority} onChange={e => setSeniority(e.target.value)} style={inp}>
                  <option>Junior</option><option>Mid</option><option>Senior</option><option>Staff / Principal</option><option>Lead / Head of</option>
                </select>
              </Field>
              <Field label="Headcount"><input type="number" min={1} value={headcount} onChange={e => setHeadcount(+e.target.value)} style={inp}/></Field>
              <Field label="Salary range"><input value={salary} onChange={e => setSalary(e.target.value)} style={inp}/></Field>
              <Field label="Priority">
                <select value={priority} onChange={e => setPriority(e.target.value)} style={inp}>
                  <option value="high">High</option><option value="med">Medium</option><option value="low">Low</option>
                </select>
              </Field>
            </div>
          </div>
        )}
        {tab === 'details' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <Field label="Description">
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} style={{ ...inp, resize:'vertical' }}/>
            </Field>
            <Field label="Requirements">
              <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={8} style={{ ...inp, resize:'vertical' }}/>
            </Field>
          </div>
        )}
        {tab === 'skills' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <Field label="Must-have skills">
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {skills.map(s => (
                  <span key={s} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', border:'1px solid var(--hair)', borderRadius:999, fontFamily:'var(--serif)', fontSize:13 }}>
                    {s}<button onClick={() => setSkills(ss => ss.filter(x => x !== s))} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-4)', fontSize:12 }}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newSkill.trim()) { setSkills(s => [...s, newSkill.trim()]); setNewSkill(''); }}} placeholder="Add skill + Enter" style={{ ...inp, flex:1 }}/>
                <button onClick={() => { if (newSkill.trim()) { setSkills(s => [...s, newSkill.trim()]); setNewSkill(''); }}} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Add</button>
              </div>
            </Field>
          </div>
        )}
        {tab === 'recruiter' && (
          <div style={{ padding:'24px 0', fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', color:'var(--t-3)' }}>
            Recruiter assignment will be configured after role creation.
          </div>
        )}
      </div>

      <div style={{ padding:'14px 28px', borderTop:'1px solid var(--hair)', display:'flex', gap:8, justifyContent:'space-between', background:'#fff' }}>
        <button onClick={onClose} className="btn btn-ghost" style={{ padding:'10px 14px' }}>Save as draft</button>
        <button onClick={submit} className="btn btn-primary" style={{ padding:'10px 20px' }}>✓ Publish role</button>
      </div>
    </div>
  );
}

// Draft generated from JD (deterministic mock)
function generateDraft(jd: string) {
  const lower = jd.toLowerCase();
  const title = lower.includes('engineer') ? 'Senior Software Engineer' : lower.includes('designer') ? 'Senior Product Designer' : lower.includes('pm') || lower.includes('product manager') ? 'Product Manager' : 'Senior Engineer';
  const salary = lower.includes('staff') || lower.includes('principal') ? '$240–320k' : lower.includes('junior') ? '$110–140k' : '$170–220k';
  const skills = lower.includes('rust') ? ['Rust','Systems','Compilers'] : lower.includes('python') ? ['Python','ML','PyTorch'] : ['TypeScript','React','Node','Postgres'];
  return { title, salary, skills, workMode:'Hybrid', seniority:'Senior', headcount:1, priority:'med', location:'San Francisco', description: jd.slice(0, 300), requirements: '' };
}

export function CreateRoleModal({ open, closing, onClose, onCreated }: any) {
  const [phase, setPhase] = useState<'input'|'analyzing'|'review'>('input');
  const [draft, setDraft] = useState<any>({});

  const handleInput = (jd: string) => {
    setPhase('analyzing');
    setTimeout(() => {
      setDraft(generateDraft(jd));
      setPhase('review');
    }, 2400);
  };

  const handleClose = () => {
    setPhase('input');
    setDraft({});
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(20,10,40,.48)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation: closing ? 'modalOut .24s var(--ease) forwards' : 'modalIn .2s var(--ease) both' }}>
      <div style={{ width:760, maxWidth:'100%', maxHeight:'92vh', background:'var(--paper)', borderRadius:14, overflow:'hidden', boxShadow:'0 30px 80px rgba(0,0,0,.28)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'20px 28px', borderBottom:'1px solid var(--hair)', background:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--plum-700)' }}>— CREATE ROLE</div>
            <h2 className="serif" style={{ margin:'4px 0 0', fontSize:28, fontStyle:'italic', letterSpacing:'-0.02em' }}>
              {phase === 'input' ? 'Paste job description' : phase === 'analyzing' ? 'AI analysis' : 'Review & publish'}
            </h2>
          </div>
          <button onClick={handleClose} style={{ appearance:'none', border:0, background:'transparent', cursor:'pointer', color:'var(--t-3)', fontSize:22 }}>
            <Icons.Close size={20}/>
          </button>
        </div>

        {phase === 'input'     && <InputStep onNext={handleInput} onClose={handleClose}/>}
        {phase === 'analyzing' && <AnalyzingStep/>}
        {phase === 'review'    && <ReviewStep draft={draft} onClose={handleClose} onCreated={onCreated}/>}
      </div>
    </div>
  );
}

export default CreateRoleModal;
