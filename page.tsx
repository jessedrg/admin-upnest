'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * / — bounces to /overview if signed in, else /login.
 */
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      router.replace(auth.admin ? '/overview' : '/login');
    } catch { router.replace('/login'); }
  }, [router]);
  return null;
}
