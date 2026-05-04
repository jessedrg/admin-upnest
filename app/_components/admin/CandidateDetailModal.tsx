'use client';
import React, { useState, useEffect } from 'react';
import { Chip } from './AdminViews';
import { showToast } from './Toast';
import { useCandidateNotes, useStatusHistory, addCandidateNote } from '@/lib/hooks/useAdminData';
import { mutate } from 'swr';

// Helper to format time ago
function formatTimeAgo(date: string | Date): string {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

// Transform DB notes to UI format
function transformNotesToUI(notes: any[]): any[] {
  return notes.map(n => {
    const user = n.user_profiles;
    const name = user?.full_name || user?.email?.split('@')[0] || 'Unknown';
    const role = user?.role === 'platform_admin' ? 'admin' : 
                 user?.role === 'client' ? 'client' : 'recruiter';
    return {
      id: n.id,
      author: name,
      role,
      avatar: name.charAt(0).toUpperCase(),
      org: role === 'admin' ? 'upnest' : (user?.agency_id ? 'Agency' : 'Independent'),
      body: n.content,
      ts: formatTimeAgo(n.created_at),
      noteType: n.note_type,
      createdAt: n.created_at,
    };
  });
}

// Transform status history to activity log
function transformHistoryToActivity(history: any[], candidate: any): any[] {
  const statusLabels: Record<string, string> = {
    'new': 'submitted candidate',
    'screening': 'moved to Screening',
    'phone_interview': 'moved to Phone',
    'sent_to_client': 'sent to client',
    'final_interview': 'moved to Final Interview',
    'hired': 'marked as Hired',
    'rejected': 'marked as Rejected',
  };
  
  return history.map(h => ({
    id: h.id,
    ts: formatTimeAgo(h.entered_at),
    actor: candidate?.sourcedBy || 'System',
    verb: statusLabels[h.status] || `status changed to ${h.status}`,
    detail: h.exited_at ? `Duration: ${formatTimeAgo(h.exited_at)}` : 'Current stage',
    status: h.status,
    enteredAt: h.entered_at,
  }));
}

// Pipeline stages matching the actual interview_status values from DB:
// new, screening, phone_interview, sent_to_client, final_interview, hired, rejected
const STAGES = ['New','Screening','Phone','Sent to Client','Final Interview','Hired'];
const VISIBLE_TO_CLIENT = new Set(['Sent to Client','Final Interview','Hired']);

const VIEWER_IDENTITY: Record<string, any> = {
  admin:    { name: 'Mira Holt',      role: 'admin',     avatar: 'M', org: 'upnest',           audience: 'recruiter, client, internal' },
  recruiter:{ name: 'Jesse Dragstra', role: 'recruiter', avatar: 'J', org: 'Parabol Partners', audience: 'client, admin' },
  client:   { name: 'Catherine Hughes', role: 'client',  avatar: 'C', org: 'Ramp',            audience: 'recruiter, admin' },
};

const SAMPLE_OWNERSHIP = [
  'the platform team and ship infra-shifting refactors',
  'core product surfaces and own delivery end-to-end',
  'integrations with downstream services',
  "an experiments squad that's shipped 4 product wins this year",
  'mobile app architecture and the iOS team',
];
const SAMPLE_PRIOR = [
  'three years at a Series B fintech and a brief stint at AWS',
  'a senior role at a growth-stage devtools company',
  'two YC startups, one acquired',
  'a stint at Big Tech and a YC company',
  'leadership roles at two sub-100-person teams',
];

// ---- Avatar component ----
function CandidateAvatar({ candidate, size = 64 }: { candidate: any, size?: number }) {
  if (candidate.profileImage) {
    return (
      <img 
        src={candidate.profileImage} 
        alt={candidate.name}
        style={{ 
          width: size, height: size, borderRadius: 999, objectFit: 'cover', 
          flexShrink: 0, border: '3px solid var(--hair)' 
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: 'var(--ink)', color: 'var(--paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: size * 0.4, flexShrink: 0,
    }}>
      {candidate.initials}
    </div>
  );
}

// ---- Overview Tab ----
function OverviewTab({ c, recruiterMeta, orgMeta }: any) {
  // Get status chip color based on actual status
  const getStatusTone = () => {
    if (c.interviewStatus === 'rejected' || c.status === 'rejected') return 'err';
    if (c.stage === 'Hired' || c.status === 'hired') return 'ok';
    if (c.stage === 'Sent to Client') return 'plum';
    return 'paper';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36 }}>
      {/* LEFT */}
      <div>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <Chip tone={getStatusTone()}>{c.stage?.toUpperCase()}</Chip>
          {c.interviewStatus && c.interviewStatus !== c.status && (
            <Chip tone={c.interviewStatus === 'rejected' ? 'err' : 'paper'}>
              INTERVIEW: {c.interviewStatus.toUpperCase()}
            </Chip>
          )}
          {c.location && <Chip tone="paper">{c.location.toUpperCase()}</Chip>}
          {c.fitScore && <Chip tone={c.fitScore >= 70 ? 'ok' : c.fitScore >= 50 ? 'paper' : 'err'}>FIT: {c.fitScore}%</Chip>}
          {c.screeningCompleted && <Chip tone="ok">SCREENED</Chip>}
          {c.flagged && <Chip tone="err">FLAGGED</Chip>}
          {c.saved && <Chip tone="gold">SAVED</Chip>}
        </div>

        {/* Rejection reason if rejected */}
        {c.rejectionReason && (
          <div style={{
            padding: 16, marginBottom: 24,
            background: 'rgba(220,53,69,.06)', border: '1px solid rgba(220,53,69,.2)', borderRadius: 8,
          }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--err)', marginBottom: 6 }}>REJECTION REASON</div>
            <div className="serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--t-2)', lineHeight: 1.5 }}>
              {c.rejectionReason}
            </div>
          </div>
        )}

        {/* About from LinkedIn */}
        {c.about && (
          <>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 8 }}>ABOUT</div>
            <p className="serif" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--t-2)', margin: '0 0 24px', textWrap: 'pretty' }}>
              {c.about}
            </p>
          </>
        )}

        {/* Experience from LinkedIn */}
        {c.experience?.length > 0 && (
          <>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 12 }}>EXPERIENCE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 24 }}>
              {c.experience.slice(0, 3).map((exp: any, i: number) => (
                <div key={i} style={{ 
                  display: 'flex', gap: 14, padding: '14px 0',
                  borderBottom: i < Math.min(c.experience.length, 3) - 1 ? '1px solid var(--hair)' : 'none'
                }}>
                  {exp.company_logo_url ? (
                    <img src={exp.company_logo_url} alt={exp.company} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic' }}>
                      {(exp.company || '?')[0]}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic' }}>{exp.title}</div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', marginTop: 3 }}>
                      {exp.company?.toUpperCase()} · {exp.duration || exp.date_range}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Role submitted to */}
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 12 }}>ROLE SUBMITTED TO</div>
        <div style={{ border: '1px solid var(--hair)', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', letterSpacing: '-0.005em' }}>
                {c.role}
              </div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '.16em', color: 'var(--t-4)', marginTop: 3 }}>
                {c.org?.toUpperCase()} · SUBMITTED {c.submitted?.toUpperCase()}
              </div>
            </div>
            <Chip tone={getStatusTone()}>{c.stage?.toUpperCase()}</Chip>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {c.linkedinUrl && (
            <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              border: '1px solid var(--hair)', borderRadius: 6, fontSize: 12,
              textDecoration: 'none', color: 'var(--t-2)', fontFamily: 'var(--mono)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn
            </a>
          )}
          {c.resumeUrl && (
            <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              border: '1px solid var(--hair)', borderRadius: 6, fontSize: 12,
              textDecoration: 'none', color: 'var(--t-2)', fontFamily: 'var(--mono)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Resume
            </a>
          )}
          {c.email && (
            <a href={`mailto:${c.email}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              border: '1px solid var(--hair)', borderRadius: 6, fontSize: 12,
              textDecoration: 'none', color: 'var(--t-2)', fontFamily: 'var(--mono)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Email
            </a>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div>
        {/* Current Company Card */}
        {c.current && (
          <>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 10 }}>CURRENT ROLE</div>
            <div style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: 18, background: '#fff', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {c.currentCompanyLogo ? (
                  <img src={c.currentCompanyLogo} alt={c.current} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'var(--ink)', color: 'var(--paper)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic',
                  }}>{(c.current || '?')[0]}</div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', letterSpacing: '-0.005em' }}>{c.title}</div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '.16em', color: 'var(--t-4)', marginTop: 3 }}>
                    {c.current?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Education */}
        {c.school && (
          <>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 10 }}>EDUCATION</div>
            <div style={{ border: '1px solid var(--hair)', borderRadius: 10, padding: 18, background: '#fff', marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic' }}>{c.school}</div>
              {c.degree && <div className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', marginTop: 4 }}>{c.degree} · {c.fieldOfStudy}</div>}
            </div>
          </>
        )}

        {/* Details */}
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 10 }}>DETAILS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--hair)', borderRadius: 10, overflow: 'hidden' }}>
          {[
            ['STATUS', c.status?.toUpperCase() || 'PENDING'],
            ['INTERVIEW', c.interviewStatus?.toUpperCase() || '-'],
            ['SOURCE', c.source || 'Direct'],
            ['EXPERIENCE', (c.years || 0) + ' years'],
            ['LOCATION', c.location || '-'],
            ['EMAIL', c.email || '-'],
            ['SUBMITTED', c.submitted || '-'],
          ].filter(([k, v]) => v && v !== '-').map(([k, v], i, arr) => (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '110px 1fr', gap: 14,
              padding: '10px 16px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--hair)' : 'none',
            }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: '.16em', color: 'var(--t-4)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', wordBreak: 'break-all' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* LinkedIn Stats */}
        {(c.followerCount || c.connectionCount) && (
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            {c.followerCount && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic' }}>{c.followerCount.toLocaleString()}</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)' }}>FOLLOWERS</div>
              </div>
            )}
            {c.connectionCount && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic' }}>{c.connectionCount.toLocaleString()}</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)' }}>CONNECTIONS</div>
              </div>
            )}
            {c.isPremium && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Chip tone="gold">PREMIUM</Chip>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Notes Tab ----
function NotesTab({ notes, draft, setDraft, onAdd, me, isLoading }: any) {
  const getTone = (role: string) => role === 'admin' ? 'var(--ink)' : role === 'client' ? 'var(--plum-700)' : '#B88858';
  const getBg = (role: string) => role === 'admin' ? 'var(--ink)' : role === 'client' ? 'var(--plum-700)' : 'linear-gradient(135deg, #F3E6CE, #B88858)';

  if (isLoading) {
    return (
      <div style={{ maxWidth: 780 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 12 }}>
          NOTES THREAD · LOADING...
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '18px 0', borderBottom: '1px solid var(--hair)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--paper-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 16, width: 150, background: 'var(--paper-2)', borderRadius: 4, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: 40, width: '100%', background: 'var(--paper-2)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 12 }}>
        NOTES THREAD · {notes.length} ENTRIES
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--t-3)', margin: '0 0 24px', lineHeight: 1.5, textWrap: 'pretty' }}>
        Recruiters, clients, and admins all post here. Each entry is tagged with its author&apos;s role, so you always know who said what.
      </p>

      {/* Notes list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
        {notes.map((n: any, i: number) => (
          <div key={n.id} style={{
            display: 'grid', gridTemplateColumns: '44px 1fr', gap: 14,
            padding: '18px 0', borderBottom: i < notes.length - 1 ? '1px solid var(--hair)' : 'none',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 999,
              background: getBg(n.role),
              color: n.role === 'recruiter' ? 'var(--ink)' : 'var(--paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic', flexShrink: 0,
            }}>{n.avatar}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic' }}>{n.author}</span>
                <span className="mono" style={{
                  fontSize: 9, letterSpacing: '.18em', padding: '2px 8px', borderRadius: 4,
                  color: getTone(n.role), border: `1px solid ${getTone(n.role)}`, opacity: .85,
                }}>{n.role.toUpperCase()}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)' }}>· {n.org?.toUpperCase()}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', marginLeft: 'auto' }}>{n.ts?.toUpperCase()}</span>
              </div>
              <div className="serif" style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--t-1)', marginTop: 8, textWrap: 'pretty' }}>
                {n.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div style={{ border: '1px solid var(--hair-strong)', borderRadius: 12, padding: 14, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 999,
            background: getBg(me.role),
            color: me.role === 'recruiter' ? 'var(--ink)' : 'var(--paper)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic',
          }}>{me.avatar}</div>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14 }}>{me.name}</span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: '.18em', color: 'var(--t-4)' }}>· {me.role.toUpperCase()}</span>
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Add a note. Visible to everyone on this candidate."
          rows={3}
          style={{
            width: '100%', border: 0, outline: 'none', resize: 'vertical',
            fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.5,
            background: 'transparent', color: 'var(--t-1)',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--hair)' }}>
          <span className="mono" style={{ fontSize: 9, letterSpacing: '.18em', color: 'var(--t-4)' }}>
            VISIBLE TO {me.audience.toUpperCase()}
          </span>
          <button onClick={onAdd} disabled={!draft.trim()} style={{
            appearance: 'none', border: 0, cursor: draft.trim() ? 'pointer' : 'not-allowed',
            background: 'var(--ink)', color: 'var(--paper)',
            padding: '8px 16px', borderRadius: 999,
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13,
            opacity: draft.trim() ? 1 : 0.4,
          }}>+ Post note</button>
        </div>
      </div>
    </div>
  );
}

// ---- History Tab ----
function HistoryTab({ activity, isLoading }: { activity: any[], isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 18 }}>ACTIVITY · LOADING...</div>
        <div style={{ position: 'relative', paddingLeft: 30 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ position: 'relative', padding: '10px 0 22px' }}>
              <div style={{ height: 12, width: 60, background: 'var(--paper-2)', borderRadius: 4, marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 18, width: 200, background: 'var(--paper-2)', borderRadius: 4, marginBottom: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: 14, width: 150, background: 'var(--paper-2)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activity.length) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 18 }}>ACTIVITY · 0 ENTRIES</div>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--t-4)' }}>
          No activity recorded yet. Status changes will appear here as the candidate progresses through the pipeline.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 18 }}>ACTIVITY · {activity.length} ENTRIES</div>
      <div style={{ position: 'relative', paddingLeft: 30 }}>
        <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 1, background: 'var(--hair-strong)' }} />
        {activity.map((e: any, i: number) => (
          <div key={e.id || i} style={{ position: 'relative', padding: '10px 0 22px' }}>
            <div style={{
              position: 'absolute', left: -26, top: 14,
              width: 11, height: 11, borderRadius: 999,
              background: e.status === 'hired' ? 'var(--ok)' : e.status === 'rejected' ? 'var(--err)' : 'var(--paper)',
              border: `2px solid ${e.status === 'hired' ? 'var(--ok)' : e.status === 'rejected' ? 'var(--err)' : 'var(--ink)'}`,
            }} />
            <div className="mono" style={{ fontSize: 9, letterSpacing: '.18em', color: 'var(--t-4)' }}>{e.ts?.toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, marginTop: 4, letterSpacing: '-0.005em' }}>
              <em>{e.actor}</em> <span style={{ color: 'var(--t-3)' }}>· {e.verb}</span>
            </div>
            {e.detail && <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--t-3)', marginTop: 3 }}>{e.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main Modal ----
export function CandidateDetailModal({ candidate, viewer = 'admin', onClose }: { candidate: any, viewer?: string, onClose: () => void }) {
  const c = candidate;
  
  // Fetch real data from Supabase
  const { data: notesData, isLoading: notesLoading, mutate: mutateNotes } = useCandidateNotes(c?.id);
  const { data: historyData, isLoading: historyLoading } = useStatusHistory(c?.id);
  
  // Transform to UI format
  const notes = notesData ? transformNotesToUI(notesData) : [];
  const activity = historyData ? transformHistoryToActivity(historyData, c) : [];
  
  const [draft, setDraft] = useState('');
  const [tab, setTab] = useState<'overview' | 'notes' | 'history'>('overview');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!c) return null;

  const me = VIEWER_IDENTITY[viewer] || VIEWER_IDENTITY.admin;
  const stageIdx = STAGES.indexOf(c.stage);
  const visibleToClient = VISIBLE_TO_CLIENT.has(c.stage);

  const handleAddNote = async () => {
    if (!draft.trim() || isAddingNote) return;
    setIsAddingNote(true);
    try {
      await addCandidateNote(c.id, draft.trim(), 'general');
      setDraft('');
      // Refresh notes
      mutateNotes();
      mutate(`candidate-notes-${c.id}`);
      showToast('Note added');
    } catch (err) {
      console.error('[v0] Error adding note:', err);
      showToast('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAdvance = () => {
    const nextIdx = Math.min(stageIdx + 1, STAGES.indexOf('Hired'));
    const next = STAGES[nextIdx];
    if (next && next !== c.stage) {
      showToast(`Moved to ${next}`);
    }
  };

  const handleReject = () => {
    showToast('Candidate rejected');
    onClose();
  };

  const handleSendToClient = () => {
    showToast('Sent to client');
  };

  return (
    <>
      {/* Scrim */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(10,10,11,.55)',
        zIndex: 200, backdropFilter: 'blur(2px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: '4vh 4vw',
        maxWidth: 1500, margin: '0 auto',
        background: 'var(--paper)', zIndex: 201,
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(0,0,0,.35)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* HEADER */}
        <div style={{
          padding: '28px 36px 22px',
          borderBottom: '1px solid var(--hair)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18,
        }}>
          <div style={{ display: 'flex', gap: 18, minWidth: 0 }}>
            <CandidateAvatar candidate={c} size={64} />
            <div style={{ minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)' }}>
                {c.num} · {(c.source || 'DIRECT').toUpperCase()} · STATUS: {(c.status || 'PENDING').toUpperCase()}
                {c.interviewStatus && c.interviewStatus !== c.status && (
                  <span style={{ marginLeft: 10, color: c.interviewStatus === 'rejected' ? 'var(--err)' : 'var(--plum-700)' }}>
                    · INTERVIEW: {c.interviewStatus.toUpperCase()}
                  </span>
                )}
                {visibleToClient && <span style={{ marginLeft: 10, color: 'var(--plum-700)' }}>· VISIBLE TO CLIENT</span>}
              </div>
              <div className="serif" style={{ fontSize: 38, fontStyle: 'italic', letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 6 }}>{c.name}</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', color: 'var(--t-3)', fontFamily: 'var(--serif)', fontSize: 15 }}>
                {c.headline ? (
                  <span style={{ fontStyle: 'italic' }}>{c.headline}</span>
                ) : (
                  <>
                    <span style={{ fontStyle: 'italic' }}>{c.title || 'Software Engineer'}</span>
                    {c.current && (
                      <>
                        <span style={{ color: 'var(--t-5)' }}>·</span>
                        <span>at <em>{c.current}</em></span>
                      </>
                    )}
                  </>
                )}
                {c.years > 0 && (
                  <>
                    <span style={{ color: 'var(--t-5)' }}>·</span>
                    <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--t-4)' }}>{c.years}Y EXP</span>
                  </>
                )}
                {c.location && (
                  <>
                    <span style={{ color: 'var(--t-5)' }}>·</span>
                    <span className="mono" style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--t-4)' }}>{c.location.toUpperCase()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} title="Close" style={{
            appearance: 'none', border: 0, background: 'var(--paper-2)', cursor: 'pointer',
            width: 36, height: 36, borderRadius: 999, fontSize: 16, color: 'var(--t-2)',
          }}>&#10005;</button>
        </div>

        {/* PIPELINE TRACK */}
        <div style={{ padding: '18px 36px 14px', borderBottom: '1px solid var(--hair)', background: 'color-mix(in oklch, var(--paper) 60%, #fff)' }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 10 }}>STAGE PIPELINE</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            {STAGES.map((s, i) => {
              const reached = i <= stageIdx;
              const isClientBoundary = s === 'Sent to Client';
              return (
                <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                  <div style={{
                    width: '100%', height: 4,
                    background: reached ? (isClientBoundary && i === stageIdx ? 'var(--plum-700)' : 'var(--ink)') : 'var(--hair)',
                    borderRadius: 1,
                  }} />
                  <div className="mono" style={{
                    fontSize: 9, letterSpacing: '.16em',
                    color: reached ? (isClientBoundary ? 'var(--plum-700)' : 'var(--t-2)') : 'var(--t-4)',
                    whiteSpace: 'nowrap',
                  }}>{s.toUpperCase()}</div>
                </div>
              );
            })}
            {c.stage === 'Rejected' && (
              <div style={{ paddingLeft: 10, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--err)', letterSpacing: '.2em', alignSelf: 'center' }}>· REJECTED</div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ padding: '0 36px', borderBottom: '1px solid var(--hair)', display: 'flex', gap: 24 }}>
          {[
            { k: 'overview', l: 'Overview' },
            { k: 'notes', l: notesLoading ? 'Notes · ...' : `Notes · ${notes.length}` },
            { k: 'history', l: historyLoading ? 'Activity · ...' : `Activity · ${activity.length}` },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k as any)} style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              padding: '14px 0', position: 'relative',
              fontFamily: 'var(--serif)', fontSize: 15, letterSpacing: '-0.005em',
              fontStyle: tab === t.k ? 'italic' : 'normal',
              color: tab === t.k ? 'var(--t-1)' : 'var(--t-3)',
            }}>
              {t.l}
              {tab === t.k && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: 'var(--ink)' }} />}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflow: 'auto', padding: '28px 36px' }}>
          {tab === 'overview' && <OverviewTab c={c} recruiterMeta={null} orgMeta={null} />}
          {tab === 'notes' && <NotesTab notes={notes} draft={draft} setDraft={setDraft} onAdd={handleAddNote} me={me} isLoading={notesLoading} />}
          {tab === 'history' && <HistoryTab activity={activity} isLoading={historyLoading} />}
        </div>

        {/* FOOTER ACTIONS */}
        {viewer !== 'client' && (
          <div style={{
            padding: '16px 36px', borderTop: '1px solid var(--hair)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            background: '#fff',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleReject} className="btn btn-ghost" style={{ padding: '10px 14px' }}>Reject</button>
              {!visibleToClient && c.stage !== 'Rejected' && (
                <button onClick={handleSendToClient} style={{
                  appearance: 'none', border: '1px solid var(--plum-700)',
                  background: 'var(--plum-700)', color: 'var(--paper)',
                  padding: '10px 16px', borderRadius: 999, cursor: 'pointer',
                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
                }}>
                  &#8594; Send to client
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleAdvance} className="btn btn-primary" style={{ padding: '10px 16px' }}>
                Advance stage &#8594;
              </button>
            </div>
          </div>
        )}
        {viewer === 'client' && (
          <div style={{
            padding: '16px 36px', borderTop: '1px solid var(--hair)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, background: '#fff',
          }}>
            <button className="btn btn-ghost" style={{ padding: '10px 14px' }} onClick={() => showToast('Recruiter notified')}>
              Message recruiter
            </button>
            <button className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={() => showToast('Interview requested')}>
              Request interview
            </button>
          </div>
        )}
      </div>
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
  return <CandidateDetailModal candidate={candidate} onClose={() => setCandidate(null)} />;
}

export default CandidateDetailModal;
