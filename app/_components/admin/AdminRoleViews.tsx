'use client';

// Sub-views inside the role detail page: pipeline kanban, candidates table,
// activity feed, comments thread, email thread, and the read-only role brief.

import * as React from 'react';
import { Chip as AChip } from './AdminViews';

// Use actual stages from DB
const STAGES = ['New', 'Screening', 'Phone', 'Sent to Client', 'Final Interview', 'Hired', 'Rejected'];

/* ============ Candidate Avatar ============ */
function CandidateAvatar({ c, size = 32 }: { c: any; size?: number }) {
  if (c.profileImage) {
    return (
      <img 
        src={c.profileImage} 
        alt={c.name}
        style={{
          width: size, height: size, borderRadius: 999,
          objectFit: 'cover', flexShrink: 0,
          border: '2px solid var(--paper)',
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: 'var(--ink)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--serif)', fontSize: size * 0.38, fontStyle: 'italic',
      flexShrink: 0,
    }}>{c.initials}</div>
  );
}

/* ============ Pipeline (kanban) ============ */

export function AdminPipelineBoard({
  candidates, onCandidate,
}: {
  candidates: any[];
  onCandidate?: (c: any) => void;
}) {
  const bucketFor = (s: string) => candidates.filter((c) => c.stage === s);

  return (
    <div data-kanban style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${STAGES.length}, minmax(200px, 1fr))`,
      gap: 12, overflowX: 'auto', paddingBottom: 20,
    }}>
      {STAGES.map((s) => {
        const bucket = bucketFor(s);
        const isClient = ['Sent to Client', 'Final Interview', 'Hired'].includes(s);
        const isHired = s === 'Hired';
        const isRejected = s === 'Rejected';
        return (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 300 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: `2px solid ${isHired ? 'var(--ok)' : isRejected ? 'var(--err)' : isClient ? 'var(--plum-600)' : 'var(--hair)'}`,
            }}>
              <span style={{ 
                fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic',
                color: isHired ? 'var(--ok)' : isRejected ? 'var(--err)' : isClient ? 'var(--plum-600)' : 'var(--t-1)',
              }}>{s}</span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)' }}>{bucket.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bucket.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCandidate?.(c)}
                  style={{
                    appearance: 'none', textAlign: 'left',
                    border: '1px solid var(--hair)', background: '#fff',
                    padding: '12px', cursor: 'pointer', borderRadius: 4,
                    display: 'flex', flexDirection: 'column', gap: 6,
                    transition: 'border-color .18s var(--ease), box-shadow .18s var(--ease)',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--ink)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = 'var(--hair)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CandidateAvatar c={c} size={28} />
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', letterSpacing: '-0.01em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  </div>
                  {c.current && (
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '.12em', color: 'var(--t-4)' }}>
                      {c.current.toUpperCase()} · {c.years}Y
                    </div>
                  )}
                  {c.headline && (
                    <div style={{
                      fontFamily: 'var(--serif)', fontSize: 12, fontStyle: 'italic',
                      color: 'var(--t-3)', lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{c.headline}</div>
                  )}
                  {c.fitScore && (
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '.12em', color: c.fitScore >= 70 ? 'var(--ok)' : 'var(--t-4)' }}>
                      FIT: {c.fitScore}%
                    </div>
                  )}
                  {c.flagged && (
                    <span className="mono" style={{
                      fontSize: 9, color: 'var(--err)', letterSpacing: '.12em', marginTop: 2,
                    }}>⚑ FLAGGED</span>
                  )}
                </button>
              ))}
              {!bucket.length && (
                <div style={{
                  padding: '20px 8px', color: 'var(--t-4)', fontSize: 12,
                  fontStyle: 'italic', fontFamily: 'var(--serif)',
                }}>—</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ Candidates table ============ */

export function CandidatesTable({
  candidates, onCandidate,
}: {
  candidates: any[];
  onCandidate?: (c: any) => void;
}) {
  if (!candidates.length) {
    return (
      <div style={{ border: '1px solid var(--hair)', borderRadius: 4, background: '#fff' }}>
        <div style={{
          padding: '40px', textAlign: 'center',
          color: 'var(--t-4)', fontFamily: 'var(--serif)', fontStyle: 'italic',
        }}>No candidates yet.</div>
      </div>
    );
  }
  return (
    <div style={{ border: '1px solid var(--hair)', borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
      <div className="mono" style={{
        display: 'grid',
        gridTemplateColumns: '80px 1.5fr 120px 100px 140px 100px 60px',
        gap: 16, padding: '12px 20px',
        borderBottom: '1px solid var(--hair)',
        background: 'color-mix(in oklch, var(--paper) 50%, #fff)',
        fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)',
      }}>
        <span>NO.</span><span>CANDIDATE</span><span>STAGE</span>
        <span>SOURCE</span><span>RECRUITER</span><span>SUBMITTED</span><span></span>
      </div>
      {candidates.map((c, i) => {
        const stageTone = c.stage === 'Hired' ? 'ok' : c.stage === 'Rejected' ? 'err' : ['Sent to Client', 'Final Interview'].includes(c.stage) ? 'plum' : 'paper';
        const isVisible = ['Sent to Client', 'Final Interview', 'Hired'].includes(c.stage);
        return (
          <button
            key={c.id}
            onClick={() => onCandidate?.(c)}
            style={{
              appearance: 'none', textAlign: 'left', width: '100%',
              border: 0, background: 'transparent', cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: '80px 1.5fr 120px 100px 140px 100px 60px',
              gap: 16, padding: '14px 20px',
              borderBottom: i < candidates.length - 1 ? '1px solid var(--hair)' : 'none',
              alignItems: 'center',
              transition: 'background .15s var(--ease)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--ink) 2.5%, transparent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="mono" style={{ fontSize: 10, letterSpacing: '.1em', color: 'var(--t-4)' }}>{c.num}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <CandidateAvatar c={c} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{c.name}</span>
                  {isVisible && (
                    <span className="mono" style={{ 
                      fontSize: 8, letterSpacing: '.1em', 
                      padding: '2px 5px', borderRadius: 3,
                      background: 'var(--plum-100)', color: 'var(--plum-700)',
                    }}>CLIENT</span>
                  )}
                </div>
                <div className="mono" style={{
                  fontSize: 9, letterSpacing: '.1em', color: 'var(--t-4)', marginTop: 2,
                }}>
                  {c.current ? `${c.current.toUpperCase()} · ${c.years}Y` : c.email}
                </div>
              </div>
            </div>
            <div><AChip tone={stageTone}>{c.stage?.toUpperCase()}</AChip></div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.1em', color: 'var(--t-3)' }}>
              {(c.source || 'DIRECT').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: 'var(--t-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.recruiterName || '—'}
              </div>
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.1em', color: 'var(--t-4)' }}>
              {c.submitted?.toUpperCase()}
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--t-4)', textAlign: 'right' }}>→</div>
          </button>
        );
      })}
    </div>
  );
}

/* ============ Activity feed ============ */

export function ActivityFeed({ activities = [] }: { activities?: any[] }) {
  const items = activities.length ? activities : [
    { at: '10 min ago', actor: 'System', verb: 'created role', target: '', to: '' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((a, i) => (
        <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--hair)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <div>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{a.actor}</span>
              <span style={{ color: 'var(--t-4)', margin: '0 6px' }}>·</span>
              <span style={{ color: 'var(--t-3)', fontSize: 14 }}>{a.verb}</span>
              {a.target && (
                <>
                  <span style={{ color: 'var(--t-4)', margin: '0 6px' }}>—</span>
                  <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15 }}>{a.target}</span>
                </>
              )}
            </div>
            <span className="mono" style={{
              fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)', whiteSpace: 'nowrap',
            }}>{a.at?.toUpperCase()}</span>
          </div>
          {a.to && (
            <div style={{
              marginTop: 4, fontFamily: 'var(--serif)', fontStyle: 'italic',
              fontSize: 14, color: 'var(--t-3)',
            }}>{a.to}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============ Comments thread ============ */

export function CommentsThread({ comments = [] }: { comments?: any[] }) {
  const [val, setVal] = React.useState('');
  const has = val.trim().length > 0;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
        {comments.length === 0 && (
          <div style={{ padding: '20px 0', color: 'var(--t-4)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            No comments yet.
          </div>
        )}
        {comments.map((c, i) => {
          const initials = (c.author || 'U').split(' ').map((w: string) => w[0]).slice(0, 2).join('');
          return (
            <div key={c.id || i} style={{
              display: 'grid', gridTemplateColumns: '44px 1fr', gap: 16,
              padding: '20px 0',
              borderBottom: i < comments.length - 1 ? '1px solid var(--hair)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                background: 'var(--ink)', color: '#F3E6CE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
              }}>{initials}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 16, letterSpacing: '-0.01em' }}>{c.author}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--t-4)', letterSpacing: '.14em' }}>
                    {(c.role || 'USER').toUpperCase()}
                  </span>
                  <span className="mono" style={{
                    fontSize: 10, color: 'var(--t-4)', letterSpacing: '.14em', marginLeft: 'auto',
                  }}>{c.at?.toUpperCase()}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.5,
                  marginTop: 6, color: 'var(--t-1)',
                }}>{c.body}</div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Comment box */}
      <div style={{ border: '1px solid var(--hair)', padding: '14px 16px', borderRadius: 4 }}>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Write a comment..."
          style={{
            width: '100%', border: 0, outline: 'none', resize: 'vertical', minHeight: 60,
            fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--t-1)',
            background: 'transparent', fontStyle: has ? 'normal' : 'italic',
          }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid var(--hair)', paddingTop: 10, marginTop: 8,
        }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)' }}>
            VISIBLE TO · CLIENT · RECRUITERS · ADMIN
          </span>
          <button
            className="btn btn-primary"
            style={{ padding: '8px 16px', opacity: has ? 1 : .5 }}
            disabled={!has}
            onClick={() => {
              (window as any).showToast?.('Comment posted');
              setVal('');
            }}
          >Post</button>
        </div>
      </div>
    </div>
  );
}

/* ============ Role brief ============ */

export function RoleBrief({ role }: { role: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 48 }} className="stack-mobile">
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)' }}>§ JOB DESCRIPTION</div>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.65, marginTop: 10, color: 'var(--t-1)',
        }}>
          {role.description || 'No description provided for this role.'}
        </div>
        {role.requirements && (
          <>
            <div className="mono" style={{
              fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)', marginTop: 28,
            }}>§ REQUIREMENTS</div>
            <div style={{
              fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.7,
              marginTop: 10, color: 'var(--t-1)',
            }}>{role.requirements}</div>
          </>
        )}
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)' }}>§ META</div>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10,
          fontFamily: 'var(--serif)', fontSize: 15,
        }}>
          <div><span style={{ color: 'var(--t-4)' }}>Location · </span>{role.location || 'Remote'}</div>
          <div><span style={{ color: 'var(--t-4)' }}>Mode · </span>{role.workMode || 'Remote'}</div>
          <div><span style={{ color: 'var(--t-4)' }}>Salary · </span>{role.salary || 'Competitive'}</div>
          <div><span style={{ color: 'var(--t-4)' }}>Opened · </span>{role.opened || '—'}</div>
        </div>
      </div>
    </div>
  );
}

/* ============ Composer (right-side drawer) ============ */

export function Composer({
  kind, onClose,
}: {
  kind: 'comment' | 'email';
  onClose: () => void;
}) {
  const [text, setText] = React.useState('');
  const isEmail = kind === 'email';
  const has = text.trim().length > 0;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,11,.4)', zIndex: 100,
        }}
      />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 'min(560px, 100vw)',
        background: 'var(--paper)', zIndex: 101,
        boxShadow: '-20px 0 60px rgba(0,0,0,.08)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid var(--hair)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)' }}>
              {isEmail ? 'COMPOSE · EMAIL' : 'COMPOSE · COMMENT'}
            </div>
            <div className="serif" style={{ fontSize: 22, fontStyle: 'italic', marginTop: 4 }}>
              {isEmail ? 'Email recruiters' : 'Leave a comment'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              appearance: 'none', border: 0, background: 'transparent',
              cursor: 'pointer', color: 'var(--t-3)', fontSize: 20,
            }}
          >✕</button>
        </div>

        <div style={{ padding: '22px 28px', flex: 1, overflow: 'auto' }}>
          {isEmail && (
            <div style={{ marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', marginBottom: 6 }}>TO</div>
              <input
                type="text"
                placeholder="All recruiters on this role"
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid var(--hair)',
                  borderRadius: 4, fontSize: 14, fontFamily: 'var(--serif)',
                }}
              />
            </div>
          )}
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', marginBottom: 6 }}>
            {isEmail ? 'MESSAGE' : 'COMMENT'}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isEmail ? 'Write your email...' : 'Write a comment...'}
            style={{
              width: '100%', minHeight: 200, padding: '12px', border: '1px solid var(--hair)',
              borderRadius: 4, fontSize: 16, fontFamily: 'var(--serif)',
              resize: 'vertical', outline: 'none',
            }}
          />
        </div>

        <div style={{
          padding: '16px 28px', borderTop: '1px solid var(--hair)',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '10px 16px' }}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ padding: '10px 20px', opacity: has ? 1 : .5 }}
            disabled={!has}
            onClick={() => {
              (window as any).showToast?.(isEmail ? 'Email sent' : 'Comment posted');
              onClose();
            }}
          >
            {isEmail ? 'Send email' : 'Post comment'}
          </button>
        </div>
      </div>
    </>
  );
}
