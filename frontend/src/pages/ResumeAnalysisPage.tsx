import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Check,
  Tag,
} from 'lucide-react';

import { api } from '../api/client';
import { ResumeAnalysis } from '../types';
import { ScoreCard } from '../components/common/ScoreCard';

export const ResumeAnalysisPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Execution State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [isSavingToTracker, setIsSavingToTracker] = useState(false);
  const [savedTrackerSuccess, setSavedTrackerSuccess] = useState(false);

  // File Drag & Drop Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid PDF document (.pdf extension).');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Selected file exceeds the 5MB size limit.');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid PDF document (.pdf extension).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Selected file exceeds the 5MB size limit.');
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or upload a PDF resume file.');
      return;
    }
    if (jobDescription.trim().length < 10) {
      setError('Job description must contain at least 10 characters.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setLoadingStep(1);

    const stepTimer = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    const formData = new FormData();
    formData.append('resume_file', selectedFile);
    formData.append('job_description', jobDescription.trim());
    if (jobTitle.trim()) formData.append('job_title', jobTitle.trim());
    if (companyName.trim()) formData.append('company_name', companyName.trim());

    try {
      const data = await api.analyzeResume(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check the file and try again.');
    } finally {
      clearInterval(stepTimer);
      setIsSubmitting(false);
    }
  };

  const handleSaveToTracker = async () => {
    if (!result) return;
    setIsSavingToTracker(true);
    try {
      await api.createApplication({
        company_name: companyName.trim() || 'Target Employer',
        job_title: jobTitle.trim() || 'Software Role',
        job_description: jobDescription.trim(),
        status: 'Interested',
        notes: `Analyzed via CareerLens on ${new Date().toLocaleDateString()}. Initial similarity: ${result.similarity_score}%, coverage: ${result.skill_coverage_score ?? 'N/A'}%`,
      });
      setSavedTrackerSuccess(true);
    } catch (err: any) {
      alert(`Could not save to tracker: ${err.message}`);
    } finally {
      setIsSavingToTracker(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Resume Alignment Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload your resume and a target job posting to extract skills, evaluate overlap, and inspect matched evidence.
        </p>
      </div>

      {/* Input Section or Results */}
      {!result ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: PDF Upload (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <label className="block text-sm font-semibold text-slate-900">
                1. Upload PDF Resume <span className="text-rose-500">*</span>
              </label>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  selectedFile
                    ? 'border-brand-500 bg-brand-50/30'
                    : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  id="resume_file_input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label htmlFor="resume_file_input" className="cursor-pointer block space-y-3">
                  <div className="w-12 h-12 bg-white text-brand-600 rounded-full shadow-sm flex items-center justify-center mx-auto border border-slate-200">
                    {selectedFile ? <FileText className="w-6 h-6 text-brand-600" /> : <Upload className="w-6 h-6" />}
                  </div>

                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-brand-900 truncate max-w-xs mx-auto">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB • Ready to parse</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-700">Click to select PDF or drag and drop</p>
                      <p className="text-xs text-slate-400">Standard 1-2 page digital PDF • Max 5MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* PDF note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800">Scanned PDF Notice:</span>
                <p>
                  CareerLens extracts selectable digital text. Scanned photo or image-only PDFs without OCR cannot be
                  read.
                </p>
              </div>
            </div>

            {/* Optional Metadata */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <label className="block text-sm font-semibold text-slate-900">2. Role Metadata (Optional)</label>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hiring Organization / Company</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Job Description Text (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-900">
                  3. Target Job Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{jobDescription.length} characters</span>
              </div>

              <textarea
                rows={12}
                placeholder="Paste the target job description, requirements, technical qualifications, and team responsibilities here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-4 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
              />

              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile || jobDescription.trim().length < 10}
                className="w-full py-3.5 px-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {loadingStep === 1 && 'Extracting text from PDF...'}
                      {loadingStep === 2 && 'Normalising phrases & resolving aliases...'}
                      {loadingStep === 3 && 'Computing TF-IDF cosine similarity...'}
                      {loadingStep === 4 && 'Generating grounded suggestions...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyse Resume Alignment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Results Section */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Analysis Complete
                </span>
                <span className="text-xs text-slate-400">ID #{result.id}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {result.job_title || 'Software Role'}{' '}
                {result.company_name ? <span className="text-slate-500 font-normal">at {result.company_name}</span> : ''}
              </h2>
              <p className="text-xs text-slate-400">Resume: {result.resume_filename}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSaveToTracker}
                disabled={isSavingToTracker || savedTrackerSuccess}
                className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium border shadow-sm transition-colors ${
                  savedTrackerSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {savedTrackerSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Saved to Applications</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-slate-500" />
                    <span>{isSavingToTracker ? 'Saving...' : 'Save to Tracker'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(`/analyses/${result.id}`)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                <span>View Full Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setResult(null);
                  setSelectedFile(null);
                  setSavedTrackerSuccess(false);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2"
              >
                New Analysis
              </button>
            </div>
          </div>

          {/* Scores Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard
              title="Skill Coverage Score"
              score={result.skill_coverage_score}
              type="coverage"
              subtitle="Matched required technical skills / Total detected job requirements."
            />
            <ScoreCard
              title="TF-IDF Text Similarity"
              score={result.similarity_score}
              type="similarity"
              subtitle="Cosine similarity over vocabulary vectors. Measures textual keyword overlap only."
            />
          </div>

          {/* Warnings Alert if any */}
          {result.extraction_warnings && result.extraction_warnings.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Extraction & Boundary Warnings:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {result.extraction_warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched Skills */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Matched Requirements</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {result.matched_skills.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">Skills detected in both the job description and your resume.</p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {result.matched_skills.length > 0 ? (
                  result.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No direct requirement matches detected.</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Missing Requirements</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  {result.missing_skills.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Required by posting, but <strong className="text-slate-700">not detected in resume text</strong>.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {result.missing_skills.length > 0 ? (
                  result.missing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">All detected job requirements matched!</span>
                )}
              </div>
            </div>

            {/* Additional Skills */}
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-brand-600" />
                  <span>Additional Resume Skills</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                  {result.additional_skills.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Identified in your resume, but not explicitly requested by this job.
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {result.additional_skills.length > 0 ? (
                  result.additional_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No additional skills identified.</span>
                )}
              </div>
            </div>
          </div>

          {/* Suggested Improvements Grounded in Text */}
          <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Deterministic Improvement Recommendations</span>
            </h3>

            <div className="space-y-2.5">
              {result.suggested_improvements.map((sug, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{sug}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
