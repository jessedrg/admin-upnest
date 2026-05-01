'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ADMIN_DATA from '../../../_components/admin/AdminData';
import { AdminRoleDetail } from '../../../_components/admin/AdminRoleDetail';
import { CandidateDetailModal } from '../../../_components/admin/CandidateDetailModal';

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params?.id || ''));
  const [role, setRole] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    let r: any = null;
    try {
      const stash = sessionStorage.getItem('upnest:admin:selectedRole');
      if (stash) {
        const parsed = JSON.parse(stash);
        if (parsed?.id === id) r = parsed;
      }
    } catch {}
    if (!r) r = ADMIN_DATA.roles.find((x: any) => x.id === id) || ADMIN_DATA.roles[0] || null;
    setRole(r);
  }, [id]);

  if (!role) return null;

  return (
    <>
      <AdminRoleDetail role={role} onBack={() => router.push('/roles')} onCandidate={setSelectedCandidate}/>
      {selectedCandidate && <CandidateDetailModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)}/>}
    </>
  );
}
