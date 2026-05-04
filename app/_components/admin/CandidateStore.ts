'use client';

import { useState, useEffect } from 'react';
import ADMIN_DATA from './AdminData';

// Pipeline stages matching actual interview_status values from DB:
// new, screening, phone_interview, sent_to_client, final_interview, hired, rejected
export const STAGES = ['New','Screening','Phone','Sent to Client','Final Interview','Hired','Rejected'];

export const REJECT_REASONS = [
  'Not a fit · skills',
  'Not a fit · culture',
  'Not a fit · comp',
  'Not a fit · location',
  'Not a fit · experience level',
  'Client passed',
  'Candidate withdrew',
  'Role filled',
  'Other',
];

export const WITHDRAW_REASONS = [
  'Accepted another offer',
  'Not interested in role',
  'Compensation mismatch',
  'Location / remote conflict',
  'Personal reasons',
  'No response',
  'Other',
];

// Internal mutable candidates array (starts from mock data)
let _candidates = [...ADMIN_DATA.candidates];
const _subs = new Set<() => void>();

export const candidateStore = {
  STAGES,
  REJECT_REASONS,
  WITHDRAW_REASONS,

  setStage(id: string, stage: string, opts: any = {}) {
    _candidates = _candidates.map(c => c.id === id ? { ...c, stage } : c);
    ADMIN_DATA.candidates.splice(0, ADMIN_DATA.candidates.length, ..._candidates);
    _subs.forEach(fn => { try { fn(); } catch {} });
  },

  reject(id: string, reason: string, note: string, actor: string) {
    _candidates = _candidates.map(c =>
      c.id === id ? { ...c, stage: 'Rejected', rejectReason: reason, rejectNote: note } : c
    );
    ADMIN_DATA.candidates.splice(0, ADMIN_DATA.candidates.length, ..._candidates);
    _subs.forEach(fn => { try { fn(); } catch {} });
  },

  withdraw(id: string, reason: string, note: string, actor: string) {
    _candidates = _candidates.map(c =>
      c.id === id ? { ...c, stage: 'Withdrawn', withdrawReason: reason, withdrawNote: note } : c
    );
    ADMIN_DATA.candidates.splice(0, ADMIN_DATA.candidates.length, ..._candidates);
    _subs.forEach(fn => { try { fn(); } catch {} });
  },

  subscribe(fn: () => void) {
    _subs.add(fn);
    return () => _subs.delete(fn);
  },

  visibleToClient(stage: string) {
    return ['Sent to Client','Final Interview','Hired'].includes(stage);
  },
};

export function useCandidateStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const fn = () => setTick(t => t + 1);
    _subs.add(fn);
    return () => { _subs.delete(fn); };
  }, []);

  return candidateStore;
}

export default candidateStore;
