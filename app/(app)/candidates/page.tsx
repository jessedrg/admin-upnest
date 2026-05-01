'use client';
import { useState } from 'react';
import { AdminCandidates } from '../../_components/admin/AdminCandidates';
import { CandidateDetailModal } from '../../_components/admin/CandidateDetailModal';
export default function CandidatesPage() {
  const [selected, setSelected] = useState<any>(null);
  return (
    <>
      <AdminCandidates onCandidate={setSelected}/>
      {selected && <CandidateDetailModal candidate={selected} onClose={() => setSelected(null)}/>}
    </>
  );
}
