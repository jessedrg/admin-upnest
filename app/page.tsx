'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * / — bounces to /overview if signed in as admin, else /login.
 */
export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.replace('/login');
          return;
        }

        // Verify admin status
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, user_type')
          .eq('id', user.id)
          .single();
        
        const isAdmin = profile?.role === 'admin' || profile?.user_type === 'admin' || profile?.role === 'platform_admin';
        
        router.replace(isAdmin ? '/overview' : '/login');
      } catch {
        router.replace('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0B', display:'grid', placeItems:'center' }}>
      <div style={{ color:'#B88858', fontFamily:'var(--mono)', fontSize:12, letterSpacing:'.2em' }}>
        LOADING...
      </div>
    </div>
  );
}
