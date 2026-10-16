import {
  JobApplication,
  JobApplicationCreate,
  PaginatedApplications,
  ResumeAnalysis,
  PaginatedAnalyses,
  DashboardSummary,
  StatusDistributionItem,
  UpcomingFollowupItem,
  EvaluationSummary,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Set default JSON headers unless sending FormData
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null as unknown as T;
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
        }
      }
    } catch {
      // Non-JSON response
      const errText = await response.text();
      if (errText) errorDetail = errText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; app_name: string; version: string; database: string }>('/health'),

  // Applications
  getApplications: (params: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', params.page.toString());
    if (params.page_size) q.set('page_size', params.page_size.toString());
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.sort_by) q.set('sort_by', params.sort_by);
    if (params.sort_order) q.set('sort_order', params.sort_order);
    return request<PaginatedApplications>(`/applications?${q.toString()}`);
  },

  getApplication: (id: number) => request<JobApplication>(`/applications/${id}`),

  createApplication: (data: JobApplicationCreate) =>
    request<JobApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApplication: (id: number, data: Partial<JobApplicationCreate>) =>
    request<JobApplication>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteApplication: (id: number) =>
    request<void>(`/applications/${id}`, {
      method: 'DELETE',
    }),

  // Analyses
  analyzeResume: (formData: FormData) =>
    request<ResumeAnalysis>('/analyses', {
      method: 'POST',
      body: formData,
    }),

  getAnalyses: (params: { page?: number; page_size?: number; job_application_id?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', params.page.toString());
    if (params.page_size) q.set('page_size', params.page_size.toString());
    if (params.job_application_id) q.set('job_application_id', params.job_application_id.toString());
    return request<PaginatedAnalyses>(`/analyses?${q.toString()}`);
  },

  getAnalysis: (id: number) => request<ResumeAnalysis>(`/analyses/${id}`),

  deleteAnalysis: (id: number) =>
    request<void>(`/analyses/${id}`, {
      method: 'DELETE',
    }),

  // Dashboard
  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),
  getStatusDistribution: () => request<StatusDistributionItem[]>('/dashboard/status-distribution'),
  getUpcomingFollowups: (limit: number = 10) => request<UpcomingFollowupItem[]>(`/dashboard/upcoming-followups?limit=${limit}`),

  // Evaluation
  getEvaluationSummary: () => request<EvaluationSummary>('/evaluation/summary'),
  runEvaluation: () =>
    request<EvaluationSummary>('/evaluation/run', {
      method: 'POST',
    }),
};
