'use client';
import { useState } from 'react';
import { AdminRoles } from '../../_components/admin/AdminRoles';
import { CreateRoleModal } from '../../_components/admin/CreateRoleModal';
export default function RolesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <>
      <AdminRoles onCreateRole={() => setCreateOpen(true)}/>
      <CreateRoleModal open={createOpen} onClose={() => setCreateOpen(false)}/>
    </>
  );
}
