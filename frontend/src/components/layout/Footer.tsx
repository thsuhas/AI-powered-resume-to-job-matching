import React from 'react';
import { Sparkles, Shield, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">CareerLens</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              AI-Powered Job Intelligence Platform helping job seekers and engineering students analyze resumes against
              job descriptions with explainable skill matching and robust application management.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Engineered with strict privacy: No external cloud AI API required.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-brand-600 transition-colors">
                  Resume Analysis
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-brand-600 transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/evaluation" className="hover:text-brand-600 transition-colors">
                  Matching Engine Benchmark
                </Link>
              </li>
            </ul>
          </div>

          {/* Ethical Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Disclaimer & Ethics</h4>
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed space-y-1">
              <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                <Info className="w-3.5 h-3.5 text-brand-600" />
                <span>Decision-Support Tool</span>
              </div>
              <p>
                CareerLens analyzes textual alignment and vocabulary overlap only. It does not predict recruiter
                hiring decisions or guarantee interview invitations.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {CURRENT_YEAR} CareerLens. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built with FastAPI, React, TypeScript, and scikit-learn</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
