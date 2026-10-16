import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  Briefcase,
  BarChart2,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { api } from '../../api/client';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    api.checkHealth()
      .then((data) => setIsBackendHealthy(data.status === 'healthy'))
      .catch(() => setIsBackendHealthy(false));
  }, []);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Resume', path: '/analyze', icon: FileText },
    { name: 'Application Tracker', path: '/applications', icon: Briefcase },
    { name: 'Model Evaluation', path: '/evaluation', icon: BarChart2 },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/' && path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                CareerLens
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  AI
                </span>
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Job Intelligence Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Section: System Health + Quick CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Backend health indicator */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isBackendHealthy === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isBackendHealthy === false
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
              title={isBackendHealthy ? 'API Backend Connected' : 'Connecting to API'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendHealthy === true
                    ? 'bg-emerald-500 animate-pulse'
                    : isBackendHealthy === false
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-[11px]">
                {isBackendHealthy === true ? 'API Online' : isBackendHealthy === false ? 'API Offline' : 'Connecting...'}
              </span>
            </div>

            <Link
              to="/analyze"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Analyze Resume</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              to="/analyze"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Analyze Resume</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
