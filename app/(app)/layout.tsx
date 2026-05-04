'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminNav, AdminTopBar } from '../_components/admin/AdminShell';
import Icons from '../_components/admin/Icons';
import { ToastHost } from '../_components/admin/Toast';
import { RejectModal } from '../_components/admin/RejectModal';
import { AdminCandidateOverlay } from '../_components/admin/CandidateDetailModal';
import { CreateRoleModal } from '../_components/admin/CreateRoleModal';
import { SubmitCandidateModal } from '../_components/admin/SubmitCandidateModal';

const ROUTE_META: Record<string, { t: string; s: string }> = {
  overview:      { t: 'Overview',      s: 'OPERATOR CONSOLE' },
  roles:         { t: 'Roles',         s: 'ACROSS ALL ORGS' },
  candidates:    { t: 'Candidates',    s: 'GLOBAL' },
  organizations: { t: 'Organizations', s: 'COMPANIES · AGENCIES' },
  recruiters:    { t: 'Recruiters',    s: 'GLOBAL' },
  contracts:     { t: 'Contracts',     s: 'BILLING · TIERS' },
  stats:         { t: 'Stats',         s: 'PLATFORM ANALYTICS' },
  activity:      { t: 'Activity',      s: 'AUDIT LOG' },
  settings:      { t: 'Settings',      s: 'PLATFORM CONFIG' },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [createClosing, setCreateClosing] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [subClosing, setSubClosing] = useState(false);
  const [subRole, setSubRole] = useState<any>(null);

  const seg = (pathname || '/').replace(/^\//, '').split('/')[0] || 'overview';
  const meta = ROUTE_META[seg] || ROUTE_META.overview;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.replace('/login');
          setAuthChecked(true);
          return;
        }

        // Verify admin status
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, user_type')
          .eq('id', user.id)
          .single();
        
        const isAdmin = profile?.role === 'admin' || profile?.user_type === 'admin' || profile?.role === 'platform_admin';
        
        if (!isAdmin) {
          await supabase.auth.signOut();
          localStorage.removeItem('upnest:auth');
          router.replace('/login');
        } else {
          setAuthed(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.replace('/login');
      }
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [router]);

  // Listen for cross-page events
  useEffect(() => {
    const onOpenSubmit = (e: any) => {
      setSubRole(e.detail?.role);
      setSubClosing(false);
      setSubOpen(true);
    };
    const onOpenCreate = () => {
      setCreateClosing(false);
      setCreateOpen(true);
    };
    window.addEventListener('open-submit-candidate', onOpenSubmit);
    window.addEventListener('open-create-role', onOpenCreate);
    return () => {
      window.removeEventListener('open-submit-candidate', onOpenSubmit);
      window.removeEventListener('open-create-role', onOpenCreate);
    };
  }, []);

  const onNavigate = useCallback((k: string) => {
    if (ROUTE_META[k]) router.push('/' + k);
  }, [router]);

  const onExitAdmin = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.removeItem('upnest:auth');
    } catch (err) {
      console.error('Signout error:', err);
    }
    router.push('/login');
  }, [router]);

  const openCreate = useCallback(() => {
    setCreateClosing(false);
    setCreateOpen(true);
  }, []);
  const closeCreate = useCallback(() => {
    setCreateClosing(true);
    setTimeout(() => { setCreateOpen(false); setCreateClosing(false); }, 240);
  }, []);
  const closeSubmit = useCallback(() => {
    setSubClosing(true);
    setTimeout(() => { setSubOpen(false); setSubClosing(false); }, 240);
  }, []);

  if (!authChecked || !authed) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      <AdminNav current={seg} onNavigate={onNavigate} onExitAdmin={onExitAdmin}/>
      <main style={{ flex: 1, minWidth: 0, background: 'var(--paper)' }}>
        <AdminTopBar
          title={meta.t}
          subtitle={meta.s}
          right={
            <>
              <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}
                onClick={() => {}} aria-label="Notifications">
                <Icons.Bell size={14}/>
              </button>
              <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}
                onClick={openCreate}>
                <Icons.Plus size={12}/> Create role
              </button>
            </>
          }
        />
        {children}
      </main>

      <CreateRoleModal open={createOpen} closing={createClosing} onClose={closeCreate} onCreated={() => {}}/>
      <SubmitCandidateModal open={subOpen} closing={subClosing} onClose={closeSubmit} role={subRole}/>
      <AdminCandidateOverlay/>
      <ToastHost/>
      <RejectModal/>
    </div>
  );
}
