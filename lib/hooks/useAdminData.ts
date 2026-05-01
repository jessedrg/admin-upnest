'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

// ==================== CONSTANTS & HELPERS ====================

// Pipeline stages in order - these are the stages shown in the admin UI
export const PIPELINE_STAGES = ['New', 'Screening', 'Phone', 'Technical', 'Sent to Client', 'On-site', 'Offer', 'Hired', 'Rejected'] as const;

function mapStatusToStage(status: string | null): string {
  // Map database status values to UI stage names
  const mapping: Record<string, string> = {
    'new': 'New',
    'pending': 'New', // Pending applications are in New stage
    'submitted': 'New',
    'screening': 'Screening',
    'phone': 'Phone',
    'phone_screen': 'Phone',
    'technical': 'Technical',
    'technical_interview': 'Technical',
    'sent_to_client': 'Sent to Client',
    'client_review': 'Sent to Client',
    'onsite': 'On-site',
    'onsite_interview': 'On-site',
    'final_interview': 'On-site',
    'offer': 'Offer',
    'offer_extended': 'Offer',
    'hired': 'Hired',
    'accepted': 'Hired',
    'rejected': 'Rejected',
    'declined': 'Rejected',
    'withdrawn': 'Rejected',
  }
  return mapping[status?.toLowerCase() || 'new'] || 'New'
}

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
    .select('*, roles(id, title, company_name, location, status)')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[v0] Error fetching applications:', error)
    return []
  }
  return data || []
}

async function fetchRecruiters() {
  const supabase = createClient()
  // Simple query without joins - agencies relationship may not exist
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching recruiters:', error)
    return []
  }
  return data || []
}

async function fetchPlacements() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agency_placements')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[v0] Error fetching placements:', error)
    return []
  }
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
  // Map client_organizations status to health: approved -> healthy, pending -> at-risk, rejected/suspended -> unhealthy
  const statusToHealth = (status: string) => {
    if (status === 'approved') return 'healthy' as const
    if (status === 'pending') return 'at-risk' as const
    return 'unhealthy' as const
  }

  const transformed = [
    // Transform client organizations
    ...orgs.map(org => ({
      id: org.id,
      name: org.name || 'Unknown',
      type: org.account_type === 'agency' ? 'agency' as const : 'company' as const,
      tier: org.account_type || 'company',
      logoUrl: org.logo_url || null,
      joined: formatDate(org.created_at),
      mrr: 0, // Not tracked in current schema
      health: statusToHealth(org.status),
      status: org.status, // Keep original status: pending, approved, rejected, suspended
      seats: 0,
      roles: 0, // Will be calculated
      candidates: 0,
      primary: org.contact_name || '',
      domain: org.website?.replace(/https?:\/\//, '') || '',
      website: org.website,
      industry: org.industry,
      companySize: org.company_size,
      description: org.description,
      contactEmail: org.contact_email,
      contactPhone: org.contact_phone,
      agencyCommission: org.agency_commission,
    })),
    // Transform agencies (legacy support)
    ...agencies.map(agency => ({
      id: agency.id,
      name: agency.name || 'Unknown',
      type: 'agency' as const,
      tier: 'Agency',
      logoUrl: agency.logo_url || null,
      joined: formatDate(agency.created_at),
      mrr: 0,
      health: agency.is_active ? 'healthy' : 'dormant',
      status: agency.is_active ? 'approved' : 'suspended',
      seats: 0,
      roles: 0,
      candidates: 0,
      primary: agency.owner_email || '',
      domain: agency.website?.replace(/https?:\/\//, '') || agency.slug || '',
      website: agency.website,
      specializations: agency.specializations,
      description: agency.description,
      contactEmail: agency.owner_email,
    }))
  ]
  return transformed
}

export function transformRolesForUI(roles: any[], applications: any[]) {
  // Count applications per role, grouped by UI stage (not DB status)
  const appCountByRole: Record<string, number> = {}
  const appsByStage: Record<string, Record<string, number>> = {}
  
  applications.forEach((app: any) => {
    if (app.role_id) {
      appCountByRole[app.role_id] = (appCountByRole[app.role_id] || 0) + 1
      if (!appsByStage[app.role_id]) {
        // Initialize all stages to 0
        appsByStage[app.role_id] = {
          'New': 0, 'Screening': 0, 'Phone': 0, 'Technical': 0,
          'Sent to Client': 0, 'On-site': 0, 'Offer': 0, 'Hired': 0, 'Rejected': 0
        }
      }
      // Map the DB status to UI stage and increment
      const stage = mapStatusToStage(app.status)
      appsByStage[app.role_id][stage] = (appsByStage[app.role_id][stage] || 0) + 1
    }
  })

  return roles.map((role, index) => {
    // Get pipeline with all stages initialized
    const pipeline = appsByStage[role.id] || {
      'New': 0, 'Screening': 0, 'Phone': 0, 'Technical': 0,
      'Sent to Client': 0, 'On-site': 0, 'Offer': 0, 'Hired': 0, 'Rejected': 0
    }
    // Map DB status to UI status: 'active' -> 'open', 'closed' -> 'paused'
    const uiStatus = role.status === 'active' ? 'open' : role.status === 'closed' ? 'paused' : role.status || 'open'
    return {
      id: role.id,
      num: `R-${String(index + 1).padStart(5, '0')}`,
      org: role.company_name || 'Unknown',
      title: role.title || 'Untitled Role',
      location: role.location || 'Remote',
      workMode: role.remote_policy || 'Remote',
      status: uiStatus,
      salary: role.salary_range || 'Competitive',
      opened: formatTimeAgo(role.created_at),
      focused: role.focus_this_week || false,
      confidential: role.is_hidden || false,
      recruiters: 0, // Would need recruiter_role_assignments
      candidates: appCountByRole[role.id] || 0,
      pipeline,
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

  // Show all recruiters - they have various user_types like 'independent_recruiter'
  // Filter out admin users only
  const filteredRecruiters = recruiters.filter(r => r.role !== 'admin')

  return filteredRecruiters.map(r => {
    // Map DB status to UI status: 'approved' -> 'active', 'rejected' -> 'revoked', 'pending' -> 'pending'
    const uiStatus = r.status === 'approved' ? 'active' : r.status === 'rejected' ? 'revoked' : r.status || 'pending'
    return {
      id: r.id,
      name: r.full_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email || 'Unknown',
      org: r.agency_name || 'Independent',
      status: uiStatus,
      tier: r.user_type || 'recruiter',
      roles: 0,
      submitted: appCountByRecruiter[r.id] || 0,
      placed: 0,
      rev: 0,
      fee: r.bounty_percentage ? `${r.bounty_percentage}%` : '20%',
      joined: formatDate(r.created_at),
      email: r.email,
      phone: r.phone,
      linkedin: r.linkedin_url,
      location: r.registration_country || r.country || '',
      timezone: r.timezone || '',
      portfolio: '',
      bio: r.bio || '',
      profilePicture: r.profile_picture_url,
      contractType: r.contract_type,
      contractSigned: r.contract_signed_at,
      userType: r.user_type,
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
