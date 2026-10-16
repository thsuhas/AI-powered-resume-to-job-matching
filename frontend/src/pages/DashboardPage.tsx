import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

import { api } from '../api/client';
import { DashboardSummary, StatusDistributionItem, UpcomingFollowupItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

const STATUS_COLORS: Record<string, string> = {
  Interested: '#38bdf8', // sky-400
  'To Apply': '#a855f7', // purple-500
  Applied: '#3b82f6', // blue-500
  Assessment: '#f59e0b', // amber-500
  Interview: '#6366f1', // indigo-500
  Offer: '#10b981', // emerald-500
  Rejected: '#f43f5e', // rose-500
  Withdrawn: '#64748b', // slate-500
};

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [distribution, setDistribution] = useState<StatusDistributionItem[]>([]);
  const [followups, setFollowups] = useState<UpcomingFollowupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [sumData, distData, followData] = await Promise.all([
        api.getDashboardSummary(),
        api.getStatusDistribution(),
        api.getUpcomingFollowups(5),
      ]);
      setSummary(sumData);
      setDistribution(distData);
      setFollowups(followData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  useEffect(() => {
    let isActive = true;
    Promise.all([
      api.getDashboardSummary(),
      api.getStatusDistribution(),
      api.getUpcomingFollowups(5),
    ])
      .then(([sumData, distData, followData]) => {
        if (!isActive) return;
        setSummary(sumData);
        setDistribution(distData);
        setFollowups(followData);
      })
      .catch((err) => {
        if (isActive) setError(err.message || 'Failed to load dashboard metrics.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading dashboard data from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold">Unable to connect to backend service</h3>
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
          >
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !summary || summary.total_applications === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Application Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time overview of your job search pipeline and resume scores.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/applications"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>Add Job</span>
          </Link>
          <Link
            to="/analyze"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Analyse Resume</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Applications */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Applications</span>
            <div className="text-3xl font-extrabold text-slate-900">{summary?.total_applications ?? 0}</div>
            <p className="text-xs text-slate-400">Tracked in database</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Follow-ups</span>
            <div className="text-3xl font-extrabold text-amber-600">{summary?.upcoming_followups_count ?? 0}</div>
            <p className="text-xs text-slate-400">Scheduled reminders</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Total Resume Analyses */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resume Analyses</span>
            <div className="text-3xl font-extrabold text-indigo-600">{summary?.total_analyses ?? 0}</div>
            <p className="text-xs text-slate-400">Processed through NLP</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Average Match Scores */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Skill Coverage</span>
            <div className="text-3xl font-extrabold text-emerald-600">
              {summary?.average_skill_coverage_score !== null && summary?.average_skill_coverage_score !== undefined
                ? `${summary.average_skill_coverage_score}%`
                : 'N/A'}
            </div>
            <p className="text-xs text-slate-400">
              Avg Similarity:{' '}
              {summary?.average_similarity_score !== null && summary?.average_similarity_score !== undefined
                ? `${summary.average_similarity_score}%`
                : 'N/A'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {isEmpty ? (
        /* Zero state when no records */
        <div className="p-12 bg-white border border-dashed border-slate-300 rounded-2xl text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Your application tracker is empty</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Get started by analyzing your resume against a job description or adding your current active applications.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/analyze"
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm"
            >
              Analyze First Resume
            </Link>
            <Link
              to="/applications"
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Add Application Manually
            </Link>
          </div>
        </div>
      ) : (
        /* Data Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Distribution Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Application Status Distribution</h3>
                <p className="text-xs text-slate-500">Live breakdown of tracked opportunities</p>
              </div>
              <Link to="/applications" className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full">
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: any) => [`${value} applications`, 'Count']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No status data recorded yet
                </div>
              )}
            </div>

            {/* Quick status counters */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
              {Object.entries(summary?.applications_by_status || {}).map(([st, cnt]) => (
                <span
                  key={st}
                  className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium"
                >
                  <span
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: STATUS_COLORS[st] || '#94a3b8' }}
                  />
                  {st}: <strong className="ml-1 text-slate-900">{cnt}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming Follow-ups (1 col) */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Follow-up Schedule</h3>
                <p className="text-xs text-slate-500">Upcoming interview / check-in targets</p>
              </div>
            </div>

            <div className="space-y-3">
              {followups.length > 0 ? (
                followups.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between card-hover"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">{item.company_name}</div>
                      <div className="text-xs text-slate-500">{item.job_title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Date: {item.follow_up_date}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <StatusBadge status={item.status} size="sm" />
                      <div className="text-[11px] font-semibold text-amber-700">
                        {item.days_until > 0 ? `In ${item.days_until} days` : item.days_until === 0 ? 'Today' : `${Math.abs(item.days_until)}d overdue`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No upcoming follow-ups scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications & Analyses lists */}
      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recently Added Applications</h3>
              <Link to="/applications" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                Manage Tracker <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {summary?.recent_applications && summary.recent_applications.length > 0 ? (
                summary.recent_applications.map((app) => (
                  <div key={app.id} className="py-3.5 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-slate-900">{app.company_name}</div>
                      <div className="text-xs text-slate-500">
                        {app.job_title} {app.location ? `• ${app.location}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Added {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4">No recent applications.</p>
              )}
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Resume Analyses</h3>
              <Link to="/analyze" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                New Analysis <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {summary?.recent_analyses && summary.recent_analyses.length > 0 ? (
                summary.recent_analyses.map((an) => (
                  <Link
                    key={an.id}
                    to={`/analyses/${an.id}`}
                    className="py-3.5 flex items-center justify-between group hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{an.job_title || an.resume_filename}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {an.company_name ? `${an.company_name} • ` : ''}
                        {an.matched_skills_count} matched, {an.missing_skills_count} missing
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(an.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs font-bold text-slate-900">
                        Sim: <span className="text-brand-600">{an.similarity_score}%</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cov: {an.skill_coverage_score !== null ? `${an.skill_coverage_score}%` : 'N/A'}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4">No recent analyses run.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
