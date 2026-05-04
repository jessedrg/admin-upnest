'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

// ==================== CONSTANTS & HELPERS ====================

// Pipeline stages in order - these are the stages shown in the admin UI
// Based on actual interview_status values: new, screening, phone_interview, sent_to_client, final_interview, rejected
export const PIPELINE_STAGES = ['New', 'Screening', 'Phone', 'Sent to Client', 'Final Interview', 'Hired', 'Rejected'] as const;

// Maps interview_status (the real stage) to UI display names
function mapInterviewStatusToStage(interviewStatus: string | null): string {
  const mapping: Record<string, string> = {
    // Actual values from DB
    'new': 'New',
    'screening': 'Screening',
    'phone_interview': 'Phone',
    'sent_to_client': 'Sent to Client',
    'final_interview': 'Final Interview',
    'hired': 'Hired',
    'rejected': 'Rejected',
    // Legacy/alternative values
    'pending': 'New',
    'submitted': 'New',
    'phone': 'Phone',
    'phone_screen': 'Phone',
    'technical': 'Final Interview',
    'technical_interview': 'Final Interview',
    'client_review': 'Sent to Client',
    'onsite': 'Final Interview',
    'onsite_interview': 'Final Interview',
    'offer': 'Hired',
    'offer_extended': 'Hired',
    'accepted': 'Hired',
    'declined': 'Rejected',
    'withdrawn': 'Rejected',
  }
  return mapping[interviewStatus?.toLowerCase() || 'new'] || 'New'
}

// Deprecated: use mapInterviewStatusToStage instead
function mapStatusToStage(status: string | null): string {
  return mapInterviewStatusToStage(status)
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

async function fetchFocusedRoles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('focused_roles')
    .select('*, user_profiles(id, full_name, email, profile_picture_url)')
    .order('focused_at', { ascending: false })
  if (error) {
    console.error('[v0] Error fetching focused_roles:', error)
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

export function useFocusedRoles() {
  return useSWR('focused_roles', fetchFocusedRoles, {
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

export function transformRolesForUI(roles: any[], applications: any[], focusedRoles?: any[]) {
  // Count applications per role, grouped by UI stage using interview_status (the real pipeline stage)
  const appCountByRole: Record<string, number> = {}
  const appsByStage: Record<string, Record<string, number>> = {}
  
  applications.forEach((app: any) => {
    if (app.role_id) {
      appCountByRole[app.role_id] = (appCountByRole[app.role_id] || 0) + 1
      if (!appsByStage[app.role_id]) {
        // Initialize all stages to 0 - matches PIPELINE_STAGES
        appsByStage[app.role_id] = {
          'New': 0, 'Screening': 0, 'Phone': 0, 'Sent to Client': 0,
          'Final Interview': 0, 'Hired': 0, 'Rejected': 0
        }
      }
      // Use interview_status (the REAL stage), not status
      const stage = mapInterviewStatusToStage(app.interview_status)
      appsByStage[app.role_id][stage] = (appsByStage[app.role_id][stage] || 0) + 1
    }
  })

  // Group focused recruiters by role_id
  const focusedByRole: Record<string, { all: any[]; last24h: any[] }> = {}
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  if (focusedRoles) {
    focusedRoles.forEach((fr: any) => {
      if (!focusedByRole[fr.role_id]) {
        focusedByRole[fr.role_id] = { all: [], last24h: [] }
      }
      focusedByRole[fr.role_id].all.push(fr)
      // Check if focused in last 24h
      const focusedAt = new Date(fr.focused_at || fr.created_at)
      if (focusedAt >= oneDayAgo) {
        focusedByRole[fr.role_id].last24h.push(fr)
      }
    })
  }

  return roles.map((role, index) => {
    // Get pipeline with all stages initialized - matches PIPELINE_STAGES
    const pipeline = appsByStage[role.id] || {
      'New': 0, 'Screening': 0, 'Phone': 0, 'Sent to Client': 0,
      'Final Interview': 0, 'Hired': 0, 'Rejected': 0
    }
    // Map DB status to UI status: 'active' -> 'open', 'closed' -> 'paused'
    const uiStatus = role.status === 'active' ? 'open' : role.status === 'closed' ? 'paused' : role.status || 'open'
    
    // Get focused recruiters for this role
    const focusedData = focusedByRole[role.id] || { all: [], last24h: [] }
    const focusedRecruiters = focusedData.all.map((fr: any) => ({
      id: fr.user_id,
      name: fr.user_profiles?.full_name || fr.user_profiles?.email?.split('@')[0] || 'Unknown',
      email: fr.user_profiles?.email,
      avatar: fr.user_profiles?.profile_picture_url,
      focusedAt: fr.focused_at || fr.created_at,
    }))
    
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
      recruiters: focusedRecruiters.length, // Number of recruiters focused on this role
      recruitersLast24h: focusedData.last24h.length, // Focused in last 24h
      focusedRecruiters, // Array of recruiter details
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

export function transformCandidatesForUI(applications: any[], recruitersMap?: Map<string, any>) {
  return applications.map((app, index) => {
    // Extract data from linkedin_data if available
    const linkedin = app.linkedin_data || {}
    
    // Use candidate_name as primary source (this is the real name)
    // Only fallback to linkedin if candidate_name is empty or "Unknown"
    const name = (app.candidate_name && app.candidate_name !== 'Unknown') 
      ? app.candidate_name 
      : (linkedin.full_name || 'Unknown');
    
    const nameParts = name.split(' ')
    const initials = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase()
    const currentJob = linkedin.experience?.[0] || {}
    const education = linkedin.education?.[0] || {}
    
    // Calculate years of experience from linkedin data
    const totalYears = linkedin.experience?.reduce((years: number, exp: any) => {
      const duration = exp.duration || ''
      const match = duration.match(/(\d+)\s*yr/)
      return years + (match ? parseInt(match[1]) : 0)
    }, 0) || 0

    // Get recruiter name from map if available
    const recruiter = recruitersMap?.get(app.sourced_by)
    const recruiterName = recruiter?.full_name || recruiter?.email?.split('@')[0] || null

    return {
      id: app.id,
      num: `C-${String(index + 1).padStart(5, '0')}`,
      name,
      initials,
      // From LinkedIn data
      title: currentJob.title || linkedin.job_title || linkedin.headline || '',
      headline: linkedin.headline || '',
      current: currentJob.company || linkedin.company || '',
      currentCompanyLogo: linkedin.company_logo_url || currentJob.company_logo_url || '',
      about: linkedin.about || '',
      location: linkedin.location || linkedin.city || '',
      school: education.school || linkedin.school || '',
      degree: education.degree || '',
      fieldOfStudy: education.field_of_study || '',
      // Experience & education arrays
      experience: linkedin.experience || [],
      education: linkedin.education || [],
      skills: linkedin.skills || [],
      certifications: linkedin.certifications || [],
      languages: linkedin.languages || [],
      // Role info
      role: app.roles?.title || 'Unknown Role',
      roleId: app.role_id,
      org: app.roles?.company_name || '',
      // Status - interview_status is the REAL stage in the pipeline
      status: app.status || 'pending',
      interviewStatus: app.interview_status || 'new',
      stage: mapInterviewStatusToStage(app.interview_status), // Use interview_status for the actual stage!
      rejectionReason: app.rejection_reason,
      statusEnteredAt: app.status_entered_at,
      screeningCompleted: app.screening_completed,
      // Source info
      source: app.sourced_by ? 'Recruiter' : 'Direct',
      sourcedBy: app.sourced_by,
      recruiterName, // Now includes the resolved recruiter name
      submitted: formatTimeAgo(app.created_at),
      submittedAt: app.created_at,
      updatedAt: app.updated_at,
      // Years of experience
      years: totalYears,
      // Contact & links
      email: app.candidate_email,
      phone: app.candidate_phone || linkedin.phone || '',
      linkedinUrl: app.linkedin_url || linkedin.linkedin_url || '',
      linkedinProfileId: app.linkedin_profile_id,
      // Documents
      resumeUrl: app.resume_url || app.cv_url,
      coverLetter: app.cover_letter,
      answers: app.answers,
      // Profile image - prefer from app, fallback to linkedin_data
      profileImage: app.profile_image_url || linkedin.profile_image_url || '',
      // AI analysis
      fitScore: app.fit_score,
      matchingSkills: app.matching_skills || [],
      missingSkills: app.missing_skills || [],
      aiAnalysis: app.ai_analysis,
      // LinkedIn metadata
      followerCount: linkedin.follower_count,
      connectionCount: linkedin.connection_count,
      isVerified: linkedin.is_verified,
      isPremium: linkedin.is_premium,
      isCreator: linkedin.is_creator,
      lastEnrichedAt: app.last_enriched_at,
      // Flags
      flagged: false,
      saved: false,
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
