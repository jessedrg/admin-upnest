'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from '../_components/admin/AppLogins';
import { createClient } from '@/lib/supabase/client';

/**
 * /login — admin operator login.
 *
 * Uses Supabase Auth and validates that the user has admin role
 * in user_profiles before allowing access.
 */
export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Check if already signed in with admin privileges
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, user_type')
            .eq('id', user.id)
            .single();
          
          const isAdmin = profile?.role === 'admin' || profile?.user_type === 'admin' || profile?.role === 'platform_admin';
          
          if (isAdmin) {
            router.replace('/overview');
            return;
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      setChecking(false);
    };
    
    checkAuth();
  }, [router]);

  const onEnter = (user: any) => {
    // Store admin flag in localStorage for quick checks
    try {
      localStorage.setItem('upnest:auth', JSON.stringify({ admin: true, userId: user.id }));
    } catch {}
    router.push('/overview');
  };

  if (checking) {
    return (
      <div style={{ minHeight:'100vh', background:'#0A0A0B', display:'grid', placeItems:'center' }}>
        <div style={{ color:'#B88858', fontFamily:'var(--mono)', fontSize:12, letterSpacing:'.2em' }}>
          CHECKING CREDENTIALS...
        </div>
      </div>
    );
  }

  return <AdminLogin onEnter={onEnter}/>;
}
