'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from '../_components/admin/AppLogins';

/**
 * /login — admin operator login.
 *
 * Renders <AdminLogin/> from the original AppLogins.jsx. On successful
 * sign-in, persists `auth.admin = true` to localStorage and pushes to
 * /overview.
 */
export default function LoginPage() {
  const router = useRouter();

  // If already signed in, bounce straight to overview.
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      if (auth.admin) router.replace('/overview');
    } catch {}
  }, [router]);

  const onEnter = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      auth.admin = true;
      localStorage.setItem('upnest:auth', JSON.stringify(auth));
    } catch {}
    router.push('/overview');
  };

  return <AdminLogin onEnter={onEnter}/>;
}
