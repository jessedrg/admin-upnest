'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

// ==================== SWR FETCHERS ====================

async function fetchOrganizations() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_organizations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchAgencies() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchRoles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchApplications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('*, roles(title, company_name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchRecruiters() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      agencies(name),
      agency_placements!agency_placements_recruiter_id_fkey(id, total_bounty, recruiter_amount)
    `)
    .in('user_type', ['recruiter', 'agency_recruiter', 'agency_owner', 'agency_admin'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchPlacements() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agency_placements')
    .select('*, roles(title, company_name), user_profiles!agency_placements_recruiter_id_fkey(full_name, email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchAllAdminData() {
  const [orgs, agencies, roles, applications, recruiters, placements] = await Promise.all([
    fetchOrganizations(),
    fetchAgencies(),
    fetchRoles(),
    fetchApplications(),
    fetchRecruiters(),
    fetchPlacements()
  ])
  return { orgs, agencies, roles, applications, recruiters, placements }
}

// ==================== HOOKS ====================

export function useOrganizations() {
  return useSWR('organizations', fetchOrganizations, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  })
}

export function useAgencies() {
  return useSWR('agencies', fetchAgencies, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  })
}

export function useRoles() {
  return useSWR('roles', fetchRoles, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  })
}

export function useApplications() {
  return useSWR('applications', fetchApplications, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  })
}

export function useRecruiters() {
  return useSWR('recruiters', fetchRecruiters, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  })
}

export function usePlacements() {
  return useSWR('placements', fetchPlacements, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  })
}

export function useAdminData() {
  return useSWR('admin-data', fetchAllAdminData, {
    revalidateOnFocus: false,
    dedupingInterval: 30000
  })
}

// ==================== TRANSFORMERS ====================
// Transform Supabase data to match the expected UI format

export function transformOrgsForUI(orgs: any[], agencies: any[]) {
  const transformed = [
    // Transform client organizations
    ...orgs.map(org => ({
      id: org.id,
      name: org.name || 'Unknown',
      type: 'company' as const,
      tier: org.account_type || 'Growth',
      logo: (org.name || 'U')[0].toUpperCase(),
      joined: formatDate(org.created_at),
      mrr: 0, // Not tracked in current schema
      health: 'healthy' as const,
      seats: 0,
      roles: 0, // Will be calculated
      candidates: 0,
      primary: org.contact_name || '',
      domain: org.website?.replace(/https?:\/\//, '') || '',
      industry: org.industry,
      companySize: org.company_size,
      description: org.description,
      contactEmail: org.contact_email,
      contactPhone: org.contact_phone,
    })),
    // Transform agencies
    ...agencies.map(agency => ({
      id: agency.id,
      name: agency.name || 'Unknown',
      type: 'agency' as const,
      tier: 'Agency',
      logo: (agency.name || 'A')[0].toUpperCase(),
      joined: formatDate(agency.created_at),
      mrr: 0,
      health: agency.is_active ? 'healthy' : 'dormant',
      seats: 0,
      roles: 0,
      candidates: 0,
      primary: agency.owner_email || '',
      domain: agency.website?.replace(/https?:\/\//, '') || agency.slug || '',
      specializations: agency.specializations,
      description: agency.description,
    }))
  ]
  return transformed
}

export function transformRolesForUI(roles: any[], applications: any[]) {
  // Count applications per role
  const appCountByRole: Record<string, number> = {}
  const appsByStatus: Record<string, Record<string, number>> = {}
  
  applications.forEach((app: any) => {
    if (app.role_id) {
      appCountByRole[app.role_id] = (appCountByRole[app.role_id] || 0) + 1
      if (!appsByStatus[app.role_id]) {
        appsByStatus[app.role_id] = {}
      }
      const status = app.status || 'new'
      appsByStatus[app.role_id][status] = (appsByStatus[app.role_id][status] || 0) + 1
    }
  })

  return roles.map((role, index) => {
    const pipeline = appsByStatus[role.id] || {}
    return {
      id: role.id,
      num: `R-${String(index + 1).padStart(5, '0')}`,
      org: role.company_name || 'Unknown',
      title: role.title || 'Untitled Role',
      location: role.location || 'Remote',
      workMode: role.remote_policy || 'Remote',
      status: role.status || 'open',
      salary: role.salary_range || 'Competitive',
      opened: formatTimeAgo(role.created_at),
      focused: role.focus_this_week || false,
      confidential: role.is_hidden || false,
      recruiters: 0, // Would need recruiter_role_assignments
      candidates: appCountByRole[role.id] || 0,
      pipeline: {
        New: pipeline['new'] || 0,
        Screening: pipeline['screening'] || 0,
        Phone: pipeline['phone'] || 0,
        Technical: pipeline['technical'] || 0,
        SentToClient: pipeline['sent_to_client'] || 0,
        OnSite: pipeline['onsite'] || 0,
        Offer: pipeline['offer'] || 0,
        Hired: pipeline['hired'] || 0,
        Rejected: pipeline['rejected'] || 0,
      },
      age: daysSince(role.created_at),
      tta: '—',
      fee: role.recruiter_percentage ? `${role.recruiter_percentage}%` : '20%',
      priority: role.priority === 1 ? 'high' : role.priority === 2 ? 'med' : 'low',
      bounty: role.bounty,
      description: role.description,
      requirements: role.requirements,
      skills: role.skills_required,
      benefits: role.benefits,
      companyLogo: role.company_logo,
      companyDescription: role.company_description,
      difficulty: role.difficulty,
      visaSponsorship: role.visa_sponsorship,
      phoneScreening: role.phone_screening_required,
    }
  })
}

export function transformCandidatesForUI(applications: any[]) {
  return applications.map((app, index) => {
    const name = app.candidate_name || 'Unknown'
    const nameParts = name.split(' ')
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase()

    return {
      id: app.id,
      num: `C-${String(index + 1).padStart(5, '0')}`,
      name,
      initials,
      title: '', // Not in applications schema
      current: '', // Not in applications schema
      role: app.roles?.title || 'Unknown Role',
      roleId: app.role_id,
      org: app.roles?.company_name || '',
      stage: mapStatusToStage(app.status),
      source: app.sourced_by ? 'Recruiter' : 'Direct apply',
      submitted: formatTimeAgo(app.created_at),
      recruiter: '', // Would need join with user_profiles
      location: '', // Not in applications
      salary: '', // Not in applications
      years: 0,
      quote: app.cover_letter?.substring(0, 100) || '',
      flagged: false,
      saved: false,
      fitScore: app.fit_score,
      matchingSkills: app.matching_skills,
      missingSkills: app.missing_skills,
      linkedinUrl: app.linkedin_url,
      email: app.candidate_email,
      phone: app.candidate_phone,
      resumeUrl: app.resume_url || app.cv_url,
      profileImage: app.profile_image_url,
      aiAnalysis: app.ai_analysis,
    }
  })
}

export function transformRecruitersForUI(recruiters: any[], applications: any[]) {
  // Count applications per recruiter (sourced_by)
  const appCountByRecruiter: Record<string, number> = {}
  applications.forEach((app: any) => {
    if (app.sourced_by) {
      appCountByRecruiter[app.sourced_by] = (appCountByRecruiter[app.sourced_by] || 0) + 1
    }
  })

  return recruiters.map(r => {
    const placements = r.agency_placements || []
    const totalRev = placements.reduce((sum: number, p: any) => sum + (p.recruiter_amount || 0), 0)
    
    return {
      id: r.id,
      name: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown',
      org: r.agencies?.name || 'Independent',
      status: r.status || 'pending',
      tier: r.role || 'recruiter',
      roles: 0, // Would need recruiter_role_assignments count
      submitted: appCountByRecruiter[r.id] || 0,
      placed: placements.length,
      rev: totalRev,
      fee: r.bounty_percentage ? `${r.bounty_percentage}%` : '20%',
      joined: formatDate(r.created_at),
      email: r.email,
      phone: r.phone,
      linkedin: r.linkedin_url,
      location: r.registration_country || '',
      timezone: '',
      portfolio: '',
      bio: r.bio || '',
      profilePicture: r.profile_picture_url,
      contractType: r.contract_type,
      contractSigned: r.contract_signed_at,
    }
  })
}

// ==================== HELPER FUNCTIONS ====================

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

function daysSince(dateString: string | null): number {
  if (!dateString) return 0
  const date = new Date(dateString)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function mapStatusToStage(status: string | null): string {
  const mapping: Record<string, string> = {
    'new': 'New',
    'screening': 'Screening',
    'phone': 'Phone',
    'technical': 'Technical',
    'sent_to_client': 'Sent to Client',
    'onsite': 'On-site',
    'offer': 'Offer',
    'hired': 'Hired',
    'rejected': 'Rejected'
  }
  return mapping[status || 'new'] || 'New'
}
