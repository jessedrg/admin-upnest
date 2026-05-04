'use client';
import React, { useMemo } from 'react';
import { useApplications, transformCandidatesForUI } from '@/lib/hooks/useAdminData';

export function AdminActivity() {
  const { data: applicationsData, isLoading } = useApplications();

  // Transform applications into activity items
  const activity = useMemo(() => {
    if (!applicationsData) return [];
    
    return applicationsData.slice(0, 20).map((app: any) => ({
      id: app.id,
      actor: app.candidate_name || 'Unknown',
      verb: getStatusVerb(app.status),
      target: app.roles?.title || 'Unknown Role',
      to: app.roles?.company_name || '',
      at: formatTimeAgo(app.updated_at || app.created_at),
      timestamp: new Date(app.updated_at || app.created_at)
    }));
  }, [applicationsData]);

  // Group by day
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const todayItems = activity.filter((a: any) => a.timestamp >= today);
    const yesterdayItems = activity.filter((a: any) => a.timestamp >= yesterday && a.timestamp < today);
    const olderItems = activity.filter((a: any) => a.timestamp < yesterday);

    return [
      { day: 'Today', items: todayItems.length > 0 ? todayItems : activity.slice(0, 3) },
      { day: 'Yesterday', items: yesterdayItems.length > 0 ? yesterdayItems : activity.slice(3, 6) },
      { day: 'Earlier', items: olderItems.length > 0 ? olderItems.slice(0, 5) : activity.slice(6, 10) },
    ].filter(g => g.items.length > 0);
  }, [activity]);

  if (isLoading) {
    return (
      <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
        <div style={{ textAlign: 'center', color: 'var(--t-4)', padding: '60px 0' }}>Loading activity...</div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth:1800 }}>
        <div className="masthead" style={{ marginBottom:28 }}>
          <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · ACTIVITY · AUDIT</div>
          <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
            Everything that happened,<br/><span style={{ color:'var(--t-4)' }}>in order.</span>
          </h1>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--t-4)', padding: '60px 0', border: '1px solid var(--hair)' }}>
          No activity yet. Applications will appear here.
        </div>
      </div>
    );
  }

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

function getStatusVerb(status: string): string {
  const verbs: Record<string, string> = {
    'new': 'applied to',
    'screening': 'moved to screening for',
    'phone': 'scheduled phone screen for',
    'technical': 'in technical review for',
    'sent_to_client': 'sent to client for',
    'onsite': 'scheduled onsite for',
    'offer': 'received offer for',
    'hired': 'was hired for',
    'rejected': 'was rejected for'
  }
  return verbs[status] || `status changed to ${status} for`
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default AdminActivity;
