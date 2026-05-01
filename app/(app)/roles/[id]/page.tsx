'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoles, useApplications, transformRolesForUI } from '@/lib/hooks/useAdminData';
import { AdminRoleDetail } from '../../../_components/admin/AdminRoleDetail';
import { CandidateDetailModal } from '../../../_components/admin/CandidateDetailModal';

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params?.id || ''));
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: applicationsData, isLoading: appsLoading } = useApplications();

  const isLoading = rolesLoading || appsLoading;
  const roles = transformRolesForUI(rolesData || [], applicationsData || []);
  const role = roles.find((r: any) => r.id === id);

  if (isLoading) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center', color: 'var(--t-4)' }}>
        <div className="mono" style={{ fontSize: 12, letterSpacing: '.2em' }}>LOADING ROLE...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div style={{ padding: '60px 48px', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 12, letterSpacing: '.2em', color: 'var(--t-4)', marginBottom: 16 }}>ROLE NOT FOUND</div>
        <button onClick={() => router.push('/roles')} className="btn btn-ghost">
          Back to Roles
        </button>
      </div>
    );
  }

  return (
    <>
      <AdminRoleDetail role={role} onBack={() => router.push('/roles')} onCandidate={setSelectedCandidate}/>
      {selectedCandidate && <CandidateDetailModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)}/>}
    </>
  );
}
