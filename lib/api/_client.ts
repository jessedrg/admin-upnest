/**
 * Supabase-based API client.
 * All data operations go through Supabase directly.
 */

export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

// Type helpers for Supabase database tables
export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          title: string;
          company_name: string;
          company_logo: string | null;
          location: string;
          remote_policy: string | null;
          status: string;
          bounty: number | null;
          salary_range: string | null;
          created_at: string;
          updated_at: string;
          description: string | null;
          requirements: string | null;
          skills_required: unknown;
          experience_level: string | null;
          department: string | null;
          type: string | null;
          is_published: boolean;
          published_at: string | null;
          priority: number;
          focus_this_week: boolean;
          recruiter_percentage: number | null;
          created_by: string | null;
          agency_id: string | null;
        };
      };
      applications: {
        Row: {
          id: string;
          role_id: string;
          candidate_name: string;
          candidate_email: string | null;
          candidate_phone: string | null;
          status: string;
          fit_score: number | null;
          sourced_by: string | null;
          created_at: string;
          updated_at: string;
          linkedin_url: string | null;
          resume_url: string | null;
          cv_url: string | null;
          cover_letter: string | null;
          rejection_reason: string | null;
          ai_analysis: unknown;
          matching_skills: string[] | null;
          missing_skills: string[] | null;
        };
      };
      client_organizations: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          website: string | null;
          industry: string | null;
          company_size: string | null;
          description: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          account_type: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          role: string | null;
          status: string | null;
          profile_picture_url: string | null;
          phone: string | null;
          bio: string | null;
          linkedin_url: string | null;
          agency_id: string | null;
          bounty_percentage: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      agency_placements: {
        Row: {
          id: string;
          role_id: string;
          application_id: string;
          recruiter_id: string | null;
          agency_id: string | null;
          total_bounty: number | null;
          platform_amount: number | null;
          agency_amount: number | null;
          recruiter_amount: number | null;
          payment_status: string | null;
          hired_at: string | null;
          paid_at: string | null;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
          reference_type: string | null;
          reference_id: string | null;
          actor_id: string | null;
          actor_name: string | null;
          actor_image: string | null;
        };
      };
    };
  };
};
