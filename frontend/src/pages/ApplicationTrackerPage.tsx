import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';

import { api } from '../api/client';
import { JobApplication, ApplicationStatus, JobApplicationCreate } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Interested',
  'To Apply',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

export const ApplicationTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<JobApplicationCreate>(() => ({
    company_name: '',
    job_title: '',
    job_description: '',
    job_url: '',
    location: '',
    employment_type: 'Full-time',
    salary_min: undefined,
    salary_max: undefined,
    application_date: new Date().toISOString().split('T')[0],
    status: 'Applied',
    follow_up_date: '',
    notes: '',
  }));

  const fetchApplications = async () => {
    try {
      const data = await api.getApplications({
        page,
        page_size: pageSize,
        search: searchTerm,
        status: statusFilter,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setApplications(data.items);
      setTotalCount(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      console.error('Failed to fetch applications', err);
      setFetchError(err.message || 'Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshApplications = () => {
    setIsLoading(true);
    setFetchError(null);
    fetchApplications();
  };

  useEffect(() => {
    let isActive = true;
    api.getApplications({
      page,
      page_size: pageSize,
      search: searchTerm,
      status: statusFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    })
      .then((data) => {
        if (!isActive) return;
        setApplications(data.items);
        setTotalCount(data.total);
        setTotalPages(data.total_pages);
      })
      .catch((err: Error) => {
        if (isActive) setFetchError(err.message || 'Failed to load applications.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [page, pageSize, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleOpenCreateModal = () => {
    setEditingApp(null);
    setFormData({
      company_name: '',
      job_title: '',
      job_description: '',
      job_url: '',
      location: '',
      employment_type: 'Full-time',
      salary_min: undefined,
      salary_max: undefined,
      application_date: new Date().toISOString().split('T')[0],
      status: 'Applied',
      follow_up_date: '',
      notes: '',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      company_name: app.company_name,
      job_title: app.job_title,
      job_description: app.job_description,
      job_url: app.job_url || '',
      location: app.location || '',
      employment_type: app.employment_type || 'Full-time',
      salary_min: app.salary_min ?? undefined,
      salary_max: app.salary_max ?? undefined,
      application_date: app.application_date || '',
      status: app.status,
      follow_up_date: app.follow_up_date || '',
      notes: app.notes || '',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.company_name.trim() || !formData.job_title.trim() || !formData.job_description.trim()) {
      setFormError('Company name, Job title, and Job description are required.');
      return;
    }

    if (
      formData.salary_min !== undefined &&
      formData.salary_max !== undefined &&
      formData.salary_min !== null &&
      formData.salary_max !== null &&
      Number(formData.salary_max) < Number(formData.salary_min)
    ) {
      setFormError('Maximum salary cannot be less than Minimum salary.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: JobApplicationCreate = {
        ...formData,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        job_url: formData.job_url?.trim() || null,
        location: formData.location?.trim() || null,
        follow_up_date: formData.follow_up_date || null,
        notes: formData.notes?.trim() || null,
      };

      if (editingApp) {
        await api.updateApplication(editingApp.id, payload);
      } else {
        await api.createApplication(payload);
      }

      setIsCreateModalOpen(false);
      handleRefreshApplications();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
    try {
      await api.updateApplication(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err: any) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAppId) return;
    setIsDeleting(true);
    try {
      await api.deleteApplication(deletingAppId);
      setApplications((prev) => prev.filter((a) => a.id !== deletingAppId));
      setTotalCount((c) => c - 1);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeletingAppId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Job Application Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize active opportunities, record follow-ups, and track application lifecycle states.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, title, or location..."
            value={searchTerm}
            onChange={(e) => {
              setIsLoading(true);
              setFetchError(null);
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setIsLoading(true);
                setFetchError(null);
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses ({totalCount})</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setIsLoading(true);
                setFetchError(null);
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="created_at-desc">Recently Added</option>
              <option value="application_date-desc">Application Date (Newest)</option>
              <option value="application_date-asc">Application Date (Oldest)</option>
              <option value="company_name-asc">Company (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading applications from database...</p>
          </div>
        ) : fetchError ? (
          <div role="alert" className="p-12 text-center space-y-3 text-rose-800">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold">Unable to load applications</h3>
            <p className="text-xs">{fetchError}</p>
            <button
              onClick={handleRefreshApplications}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || statusFilter
                ? 'Try adjusting your search query or status filter.'
                : 'Click "New Application" to add your first job record to the tracker.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date Applied</th>
                  <th className="px-6 py-3.5">Follow-up Target</th>
                  <th className="px-6 py-3.5">Location & Comp</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Company & Role */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{app.company_name}</span>
                          {app.job_url && (
                            <a
                              href={app.job_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-brand-600"
                              title="Open original job posting"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-slate-600">{app.job_title}</div>
                        {app.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{app.notes}</div>
                        )}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-800 shadow-xs focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Date Applied */}
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {app.application_date || 'Not specified'}
                    </td>

                    {/* Follow-up */}
                    <td className="px-6 py-4">
                      {app.follow_up_date ? (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {app.follow_up_date}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Location & Compensation */}
                    <td className="px-6 py-4 text-xs text-slate-500 space-y-0.5">
                      <div>{app.location || 'Location unlisted'}</div>
                      {app.salary_min || app.salary_max ? (
                        <div className="font-mono text-[11px] text-slate-700 font-medium">
                          ${app.salary_min?.toLocaleString()} - ${app.salary_max?.toLocaleString()}
                        </div>
                      ) : null}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setViewingApp(app)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View description & details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(app)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit application"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingAppId(app.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount} records
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => {
                  setIsLoading(true);
                  setFetchError(null);
                  setPage((p) => Math.max(1, p - 1));
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  setIsLoading(true);
                  setFetchError(null);
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingApp ? 'Edit Job Application' : 'Create New Job Application'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description / Requirements <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.job_description}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  placeholder="Paste job posting details..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Applied</label>
                  <input
                    type="date"
                    value={formData.application_date || ''}
                    onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Target</label>
                  <input
                    type="date"
                    value={formData.follow_up_date || ''}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote, New York, NY"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Min ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 100000"
                    value={formData.salary_min ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_min: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Max ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 140000"
                    value={formData.salary_max ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, salary_max: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Posting URL</label>
                <input
                  type="url"
                  placeholder="https://company.com/jobs/role-123"
                  value={formData.job_url || ''}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Follow-up Plan</label>
                <textarea
                  rows={2}
                  placeholder="Contact person, referral details, or interview prep notes..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingApp ? 'Update Application' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Slideout / Modal */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingApp.company_name}</h3>
                <p className="text-sm text-slate-500">{viewingApp.job_title}</p>
              </div>
              <button onClick={() => setViewingApp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={viewingApp.status} size="md" />
              {viewingApp.location && <span className="text-xs text-slate-500">{viewingApp.location}</span>}
              {viewingApp.salary_min && viewingApp.salary_max && (
                <span className="text-xs font-mono font-medium text-slate-700">
                  ${viewingApp.salary_min.toLocaleString()} - ${viewingApp.salary_max.toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                Job Description
              </span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-y-auto text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                {viewingApp.job_description}
              </div>
            </div>

            {viewingApp.notes && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Notes
                </span>
                <p className="text-xs text-slate-600 p-2 bg-amber-50/50 border border-amber-200 rounded-md">
                  {viewingApp.notes}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingApp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deletingAppId !== null}
        title="Delete Application Record?"
        message="Are you sure you want to delete this job application? This action cannot be undone."
        confirmLabel="Delete Application"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingAppId(null)}
      />
    </div>
  );
};
