import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Explainable AI Career Decision Support</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Understand exactly how your resume aligns with <span className="text-brand-600">target roles</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CareerLens uses phrase-aware NLP and TF-IDF text similarity to highlight matched skills, detect missing
            requirements, and manage your job applications—transparently and without black-box guesswork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition-all"
            >
              <FileText className="w-5 h-5" />
              <span>Analyse Resume</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/applications"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all"
            >
              <Briefcase className="w-5 h-5 text-slate-500" />
              <span>Track Applications</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Native PDF text parsing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Deterministic skill extraction
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> 100% private & self-contained
            </span>
          </div>
        </div>
      </section>

      {/* Workflow Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How CareerLens Works</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            A 4-step explainable workflow designed to give candidates objective, actionable clarity before applying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold text-slate-900">Upload Digital PDF</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload your 1-2 page digital PDF resume. Native text is extracted safely without external cloud dependencies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold text-slate-900">Paste Job Posting</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Provide the real requirements and responsibilities text directly from the target job posting.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold text-slate-900">Explainable Analysis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              View detected matched skills, missing terms, TF-IDF cosine similarity, and contextual text evidence.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-semibold text-slate-900">Track & Follow Up</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Save the analyzed posting to your job tracker with status checkpoints and follow-up date reminders.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Architected for Real Career Decisions</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Engineered with strict algorithmic honesty: no fabricated scores or mysterious black boxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Phrase-Aware Skill Extraction</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Configurable dictionary patterns resolve aliases like PostgreSQL/postgres and React/react.js, avoiding
              false positive matches on substrings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Two Separate, Defensible Scores</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We never combine unrelated numbers into one opaque score. Text similarity measures vocabulary alignment;
              skill coverage measures requirement presence.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Empirical Engine Benchmarking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every extraction metric (Precision, Recall, F1-Score) is evaluated against a synthetic benchmark dataset
              and compared to a baseline model.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations & Ethical Grounding Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-slate-900 text-white shadow-xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Understanding Score Meaning & Boundaries
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            CareerLens is a decision-support tool. It analyzes textual overlap and keyword presence between your resume
            and a job posting. Please note the following principles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Not an ATS Guarantee
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                A high similarity score does not guarantee shortlisting or human recruiter preference. Real hiring
                considers project depth, references, and interview interactions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Absence is Not Incompetence
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a skill is flagged as missing, it simply means the phrase was not detected in your resume text. It
                does not mean you do not possess that capability.
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 border-t border-slate-800 flex items-center justify-between">
            <span>CareerLens Engine v1.0 • Built for transparency</span>
            <Link to="/evaluation" className="text-brand-400 hover:text-brand-300 font-medium underline">
              View Evaluation Results →
            </Link>
          </div>
        </div>
      </section>

      {/* Ready CTA */}
      <section className="text-center max-w-xl mx-auto px-4 pb-8 space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Ready to audit your resume?</h3>
        <p className="text-sm text-slate-600">
          Upload your resume now to inspect matched skills, missing terms, and structured evidence.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
        >
          <FileText className="w-4 h-4" />
          <span>Launch Analysis</span>
        </Link>
      </section>
    </div>
  );
};
