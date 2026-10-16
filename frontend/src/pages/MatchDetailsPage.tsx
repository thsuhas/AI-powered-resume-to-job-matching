import React, { useState, useEffect, useEffectEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trash2,
  Tag,
  Sparkles,
  Info,
} from 'lucide-react';

import { api } from '../api/client';
import { ResumeAnalysis } from '../types';
import { ScoreCard } from '../components/common/ScoreCard';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export const MatchDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isLoading = Boolean(id) && loadedAnalysisId !== id;

  const fetchAnalysis = useEffectEvent((analysisId: string) => {
    api.getAnalysis(parseInt(analysisId, 10))
      .then((data) => {
        setAnalysis(data);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Could not find requested analysis.'))
      .finally(() => setLoadedAnalysisId(analysisId));
  });

  useEffect(() => {
    if (!id) return;
    fetchAnalysis(id);
  }, [id]);

  const handleDelete = async () => {
    if (!analysis) return;
    setIsDeleting(true);
    try {
      await api.deleteAnalysis(analysis.id);
      navigate('/dashboard');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading analysis details...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm max-w-md mx-auto">
          {error || 'Analysis record not found.'}
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const matchedEvidence = analysis.evidence.filter((e) => e.match_status === 'matched');
  const missingEvidence = analysis.evidence.filter((e) => e.match_status === 'missing');
  const additionalEvidence = analysis.evidence.filter((e) => e.match_status === 'additional');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Analysis</span>
        </button>
      </div>

      {/* Main Header Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
              Detailed Match Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analysis.job_title || 'Target Position'}
              {analysis.company_name ? <span className="font-normal text-slate-500"> — {analysis.company_name}</span> : ''}
            </h1>
          </div>
          <div className="text-xs text-slate-400 space-y-0.5 sm:text-right">
            <div className="flex items-center gap-1 sm:justify-end">
              <Calendar className="w-3.5 h-3.5" />
              <span>Analyzed on {new Date(analysis.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 sm:justify-end">
              <FileText className="w-3.5 h-3.5" />
              <span>File: {analysis.resume_filename}</span>
            </div>
          </div>
        </div>

        {/* Explainable Methodology Callout */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
            <Info className="w-4 h-4 text-brand-600" />
            <span>Score Computation Methodology</span>
          </div>
          <p className="leading-relaxed">
            CareerLens reports two distinct, mathematically defensible scores:
            <br />
            1. <strong>Skill Coverage ({analysis.skill_coverage_score ?? 'N/A'}%):</strong> Calculated as the proportion of required
            technical skills present in your resume.
            <br />
            2. <strong>Text Similarity ({analysis.similarity_score}%):</strong> Measures cosine similarity over TF-IDF vocabulary vectors
            between resume text and job posting.
          </p>
        </div>
      </div>

      {/* Scores Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard
          title="Skill Requirement Coverage"
          score={analysis.skill_coverage_score}
          type="coverage"
          subtitle="Percentage of requirements found in resume text. Null when no requirements could be identified."
        />
        <ScoreCard
          title="TF-IDF Text Similarity"
          score={analysis.similarity_score}
          type="similarity"
          subtitle="Vocabulary and term frequency cosine similarity. Measures textual phrasing overlap only."
        />
      </div>

      {/* Grounded Evidence Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Extracted Evidence Breakdown</h2>
          <p className="text-xs text-slate-500">
            Verifiable snippets extracted directly from your resume and the target job description.
          </p>
        </div>

        {/* Matched Skills Evidence */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Matched Requirements Evidence ({matchedEvidence.length})</span>
            </h3>
          </div>

          {matchedEvidence.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedEvidence.map((ev, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {ev.skill}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Match
                    </span>
                  </div>

                  {ev.job_requirement_evidence && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                        Job Posting Requirement:
                      </span>
                      <blockquote className="p-2 bg-white rounded border border-slate-200 text-slate-700 italic font-mono text-[11px]">
                        "{ev.job_requirement_evidence}"
                      </blockquote>
                    </div>
                  )}

                  {ev.resume_evidence && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                        Resume Evidence Detected:
                      </span>
                      <blockquote className="p-2 bg-emerald-50/50 rounded border border-emerald-100 text-emerald-900 italic font-mono text-[11px]">
                        "{ev.resume_evidence}"
                      </blockquote>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-2">No matched skills evidence recorded.</p>
          )}
        </div>

        {/* Missing Skills Evidence */}
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Missing Requirements ({missingEvidence.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Labelled: "Not detected in resume"</span>
          </div>

          {missingEvidence.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingEvidence.map((ev, idx) => (
                <div key={idx} className="p-4 bg-rose-50/40 border border-rose-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-rose-200">
                      {ev.skill}
                    </span>
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Not Detected
                    </span>
                  </div>

                  {ev.job_requirement_evidence && (
                    <div className="text-xs space-y-1">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                        Specified in Job Posting:
                      </span>
                      <blockquote className="p-2 bg-white rounded border border-slate-200 text-slate-700 italic font-mono text-[11px]">
                        "{ev.job_requirement_evidence}"
                      </blockquote>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500">
                    If you have hands-on experience with {ev.skill}, consider documenting your specific projects and
                    tools clearly.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Great alignment! All detected job description requirements were matched in your resume.</span>
            </div>
          )}
        </div>

        {/* Additional Resume Skills */}
        {additionalEvidence.length > 0 && (
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-600" />
              <span>Additional Skills in Resume ({additionalEvidence.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Technical proficiencies highlighted on your resume that were not explicitly listed in the job description.
            </p>

            <div className="flex flex-wrap gap-2">
              {additionalEvidence.map((ev, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {ev.skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Improvements */}
      <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <span>Suggested Action Plan</span>
        </h3>

        <div className="space-y-2.5">
          {analysis.suggested_improvements.map((sug, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{sug}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Resume Analysis?"
        message="Are you sure you want to delete this analysis report and associated skill evidence? This action cannot be undone."
        confirmLabel="Delete Analysis"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
