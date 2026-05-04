import { createClient } from './client'

// Types basados en el esquema de Supabase
export type Organization = {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  industry: string | null
  company_size: string | null
  account_type: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  billing_email: string | null
  created_at: string
  updated_at: string
}

export type Agency = {
  id: string
  name: string
  slug: string | null
  description: string | null
  logo_url: string | null
  website: string | null
  contact_email: string | null
  contact_phone: string | null
  billing_email: string | null
  billing_address: string | null
  owner_email: string | null
  specializations: string[] | null
  is_active: boolean
  agency_commission_percentage: number | null
  created_at: string
  updated_at: string
}

export type Role = {
  id: string
  title: string
  description: string | null
  requirements: string | null
  location: string | null
  remote_policy: string | null
  salary_range: string | null
  bounty: number | null
  status: string | null
  type: string | null
  experience_level: string | null
  department: string | null
  company_name: string | null
  company_logo: string | null
  company_website: string | null
  company_description: string | null
  company_size: string | null
  industry: string | null
  is_published: boolean
  is_hidden: boolean
  priority: number | null
  difficulty: number | null
  focus_this_week: boolean
  recruiter_percentage: number | null
  skills_required: any
  nice_to_have: any
  benefits: string | null
  interview_stages: string[] | null
  visa_sponsorship: boolean
  phone_screening_required: boolean
  approval_status: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export type Application = {
  id: string
  role_id: string
  candidate_name: string
  candidate_email: string | null
  candidate_phone: string | null
  resume_url: string | null
  cv_url: string | null
  linkedin_url: string | null
  profile_image_url: string | null
  cover_letter: string | null
  status: string
  fit_score: number | null
  matching_skills: string[] | null
  missing_skills: string[] | null
  ai_analysis: any
  interview_status: string | null
  sourced_by: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string | null
  full_name: string | null
  first_name: string | null
  last_name: string | null
  role: string | null
  status: string | null
  profile_picture_url: string | null
  phone: string | null
  bio: string | null
  linkedin_url: string | null
  user_type: string | null
  agency_id: string | null
  bounty_percentage: number | null
  contract_type: string | null
  contract_signed_at: string | null
  payment_method: string | null
  billing_address: string | null
  billing_country: string | null
  registration_country: string | null
  created_at: string
  updated_at: string
  last_seen_at: string | null
}

export type Placement = {
  id: string
  application_id: string | null
  role_id: string | null
  recruiter_id: string | null
  agency_id: string | null
  total_bounty: number | null
  agency_amount: number | null
  recruiter_amount: number | null
  platform_amount: number | null
  payment_status: string | null
  hired_at: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  actor_id: string | null
  actor_name: string | null
  actor_image: string | null
  reference_type: string | null
  reference_id: string | null
  is_read: boolean
  metadata: any
  created_at: string
}

// ==================== FETCH FUNCTIONS ====================

export async function fetchOrganizations() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('client_organizations')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching organizations:', error)
    return []
  }
  return data as Organization[]
}

export async function fetchAgencies() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching agencies:', error)
    return []
  }
  return data as Agency[]
}

export async function fetchRoles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching roles:', error)
    return []
  }
  return data as Role[]
}

export async function fetchRoleById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('[v0] Error fetching role:', error)
    return null
  }
  return data as Role
}

export async function fetchApplications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('*, roles(title, company_name)')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching applications:', error)
    return []
  }
  return data
}

export async function fetchApplicationsByRole(roleId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('role_id', roleId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching applications for role:', error)
    return []
  }
  return data as Application[]
}

export async function fetchRecruiters() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .in('user_type', ['recruiter', 'agency_recruiter', 'agency_owner', 'agency_admin'])
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching recruiters:', error)
    return []
  }
  return data as UserProfile[]
}

export async function fetchUserProfiles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching user profiles:', error)
    return []
  }
  return data as UserProfile[]
}

export async function fetchPlacements() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('agency_placements')
    .select('*, roles(title, company_name), user_profiles!recruiter_id(full_name, email)')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('[v0] Error fetching placements:', error)
    return []
  }
  return data
}

export async function fetchNotifications(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) {
    console.error('[v0] Error fetching notifications:', error)
    return []
  }
  return data as Notification[]
}

// ==================== STATS FUNCTIONS ====================

export async function fetchAdminStats() {
  const supabase = createClient()
  
  // Fetch counts in parallel
  const [
    rolesResult,
    applicationsResult,
    recruitersResult,
    orgsResult,
    agenciesResult,
    placementsResult
  ] = await Promise.all([
    supabase.from('roles').select('id, status, bounty, created_at', { count: 'exact' }),
    supabase.from('applications').select('id, status, created_at', { count: 'exact' }),
    supabase.from('user_profiles').select('id, status, user_type', { count: 'exact' }).in('user_type', ['recruiter', 'agency_recruiter', 'agency_owner']),
    supabase.from('client_organizations').select('id, created_at', { count: 'exact' }),
    supabase.from('agencies').select('id, is_active', { count: 'exact' }),
    supabase.from('agency_placements').select('id, total_bounty, payment_status, created_at', { count: 'exact' })
  ])

  const roles = rolesResult.data || []
  const applications = applicationsResult.data || []
  const recruiters = recruitersResult.data || []
  const placements = placementsResult.data || []
  
  // Calculate stats
  const openRoles = roles.filter((r: any) => r.status === 'open').length
  const totalCandidates = applications.length
  const activeRecruiters = recruiters.filter((r: any) => r.status === 'active').length
  const totalOrgs = orgsResult.count || 0
  const totalAgencies = agenciesResult.count || 0
  
  // Calculate revenue from placements
  const totalRevenue = placements.reduce((sum: number, p: any) => sum + (p.total_bounty || 0), 0)
  const paidRevenue = placements
    .filter((p: any) => p.payment_status === 'paid')
    .reduce((sum: number, p: any) => sum + (p.total_bounty || 0), 0)

  // Calculate hired candidates
  const hiredCandidates = applications.filter((a: any) => a.status === 'hired').length

  return {
    openRoles,
    totalCandidates,
    activeRecruiters,
    totalOrgs,
    totalAgencies,
    totalPlacements: placements.length,
    totalRevenue,
    paidRevenue,
    hiredCandidates,
    conversionRate: totalCandidates > 0 ? ((hiredCandidates / totalCandidates) * 100).toFixed(1) : '0'
  }
}

// ==================== ACTIVITY/AUDIT LOG ====================

export async function fetchRecentActivity(limit = 20) {
  const supabase = createClient()
  
  // Fetch recent applications as activity
  const { data: recentApps } = await supabase
    .from('applications')
    .select('id, candidate_name, status, created_at, updated_at, roles(title, company_name)')
    .order('updated_at', { ascending: false })
    .limit(limit)

  // Transform into activity items
  const activity = (recentApps || []).map((app: any) => ({
    id: app.id,
    type: 'application',
    actor: app.candidate_name || 'Unknown',
    verb: getStatusVerb(app.status),
    target: app.roles?.title || 'Unknown Role',
    org: app.roles?.company_name || '',
    at: formatTimeAgo(app.updated_at || app.created_at),
    timestamp: app.updated_at || app.created_at
  }))

  return activity
}

function getStatusVerb(status: string): string {
  const verbs: Record<string, string> = {
    'new': 'applied to',
    'screening': 'moved to screening for',
    'phone': 'scheduled phone screen for',
    'technical': 'in technical review for',
    'sent_to_client': 'sent to client for',
    'onsite': 'scheduled onsite for',
    'offer': 'received offer for',
    'hired': 'was hired for',
    'rejected': 'was rejected for'
  }
  return verbs[status] || `status changed to ${status} for`
}

function formatTimeAgo(dateString: string): string {
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
  return date.toLocaleDateString()
}

// ==================== RECRUITER STATS ====================

export async function fetchRecruiterStats() {
  const supabase = createClient()
  
  // Fetch recruiters with their placements
  const { data: recruiters } = await supabase
    .from('user_profiles')
    .select(`
      *,
      agency_placements!recruiter_id(id, total_bounty, recruiter_amount, payment_status)
    `)
    .in('user_type', ['recruiter', 'agency_recruiter', 'agency_owner'])
    .order('created_at', { ascending: false })

  // Fetch application counts per sourced_by
  const { data: applications } = await supabase
    .from('applications')
    .select('sourced_by')
  
  const appCountByRecruiter: Record<string, number> = {}
  applications?.forEach((app: any) => {
    if (app.sourced_by) {
      appCountByRecruiter[app.sourced_by] = (appCountByRecruiter[app.sourced_by] || 0) + 1
    }
  })

  return (recruiters || []).map((r: any) => {
    const placements = r.agency_placements || []
    const totalRev = placements.reduce((sum: number, p: any) => sum + (p.recruiter_amount || 0), 0)
    
    return {
      ...r,
      submitted: appCountByRecruiter[r.id] || 0,
      placed: placements.length,
      revenue: totalRev
    }
  })
}
