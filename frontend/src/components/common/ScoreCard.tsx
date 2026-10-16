import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number | null | undefined;
  type: 'similarity' | 'coverage';
  subtitle?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, type, subtitle }) => {
  const isNull = score === null || score === undefined;

  const getColorClasses = (val: number) => {
    if (val >= 75) return { text: 'text-emerald-600', bar: 'bg-emerald-500', bg: 'bg-emerald-50', badge: 'High Alignment' };
    if (val >= 50) return { text: 'text-indigo-600', bar: 'bg-indigo-500', bg: 'bg-indigo-50', badge: 'Moderate Alignment' };
    if (val >= 30) return { text: 'text-amber-600', bar: 'bg-amber-500', bg: 'bg-amber-50', badge: 'Developing Match' };
    return { text: 'text-rose-600', bar: 'bg-rose-500', bg: 'bg-rose-50', badge: 'Low Overlap' };
  };

  const style = isNull ? null : getColorClasses(score);

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</span>
          {!isNull && style && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
              {style.badge}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          {isNull ? (
            <span className="text-2xl font-bold text-slate-400">N/A</span>
          ) : (
            <>
              <span className={`text-4xl font-extrabold tracking-tight ${style?.text}`}>{score}%</span>
              <span className="text-sm text-slate-400">/ 100%</span>
            </>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ease-out ${isNull ? 'w-0' : style?.bar}`}
            style={{ width: `${isNull ? 0 : Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-start space-x-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="leading-snug">
          {subtitle ||
            (type === 'similarity'
              ? 'Measures TF-IDF textual overlap and vocabulary distribution. Does not indicate hiring odds.'
              : 'Percentage of job-required technical skills detected in your resume text.')}
        </p>
      </div>
    </div>
  );
};
