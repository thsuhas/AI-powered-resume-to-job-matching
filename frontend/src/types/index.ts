export type ApplicationStatus =
  | 'Interested'
  | 'To Apply'
  | 'Applied'
  | 'Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface JobApplication {
  id: number;
  company_name: string;
  job_title: string;
  job_description: string;
  job_url?: string | null;
  location?: string | null;
  employment_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  application_date?: string | null;
  status: ApplicationStatus;
  follow_up_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  analyses_count?: number;
}

export interface JobApplicationCreate {
  company_name: string;
  job_title: string;
  job_description: string;
  job_url?: string | null;
  location?: string | null;
  employment_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  application_date?: string | null;
  status?: ApplicationStatus;
  follow_up_date?: string | null;
  notes?: string | null;
}

export interface PaginatedApplications {
  items: JobApplication[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AnalysisEvidence {
  id?: number;
  skill: string;
  match_status: 'matched' | 'missing' | 'additional' | 'ambiguous';
  resume_evidence?: string | null;
  job_requirement_evidence?: string | null;
}

export interface ResumeAnalysis {
  id: number;
  job_application_id?: number | null;
  resume_filename: string;
  resume_text: string;
  job_description: string;
  job_title?: string | null;
  company_name?: string | null;
  similarity_score: number;
  skill_coverage_score?: number | null;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  extraction_warnings: string[];
  suggested_improvements: string[];
  evidence: AnalysisEvidence[];
  analysis_version: string;
  created_at: string;
}

export interface ResumeAnalysisListItem {
  id: number;
  job_application_id?: number | null;
  resume_filename: string;
  job_title?: string | null;
  company_name?: string | null;
  similarity_score: number;
  skill_coverage_score?: number | null;
  matched_skills_count: number;
  missing_skills_count: number;
  created_at: string;
}

export interface PaginatedAnalyses {
  items: ResumeAnalysisListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardSummary {
  total_applications: number;
  applications_by_status: Record<string, number>;
  upcoming_followups_count: number;
  total_analyses: number;
  average_similarity_score?: number | null;
  average_skill_coverage_score?: number | null;
  recent_applications: JobApplication[];
  recent_analyses: ResumeAnalysisListItem[];
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface UpcomingFollowupItem {
  id: number;
  company_name: string;
  job_title: string;
  status: string;
  follow_up_date: string;
  days_until: number;
  notes?: string | null;
}

export interface MetricComparison {
  metric: string;
  proposed_method: number;
  baseline_method: number;
  difference: number;
}

export interface EvaluationSummary {
  status: string;
  executed_at?: string | null;
  dataset_name: string;
  dataset_size: number;
  precision: number;
  recall: number;
  f1_score: number;
  ranking_precision_at_5?: number | null;
  baseline_precision: number;
  baseline_recall: number;
  baseline_f1_score: number;
  comparisons: MetricComparison[];
  methodology: string;
  limitations: string[];
}
