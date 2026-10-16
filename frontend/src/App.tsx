import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ResumeAnalysisPage = lazy(() => import('./pages/ResumeAnalysisPage').then((module) => ({ default: module.ResumeAnalysisPage })));
const MatchDetailsPage = lazy(() => import('./pages/MatchDetailsPage').then((module) => ({ default: module.MatchDetailsPage })));
const ApplicationTrackerPage = lazy(() => import('./pages/ApplicationTrackerPage').then((module) => ({ default: module.ApplicationTrackerPage })));
const EvaluationPage = lazy(() => import('./pages/EvaluationPage').then((module) => ({ default: module.EvaluationPage })));

export function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<div className="px-4 py-16 text-center text-sm text-slate-500">Loading page...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analyze" element={<ResumeAnalysisPage />} />
              <Route path="/analyses/:id" element={<MatchDetailsPage />} />
              <Route path="/applications" element={<ApplicationTrackerPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
