'use client';
import { useRouter } from 'next/navigation';
import { AdminOverview } from '../../_components/admin/AdminViews';
export default function OverviewPage() {
  const router = useRouter();
  const onNavigate = (k: string) => router.push('/' + k);
  return <AdminOverview onNavigate={onNavigate}/>;
}
