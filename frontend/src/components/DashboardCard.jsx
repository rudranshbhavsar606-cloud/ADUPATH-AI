import React from 'react';

export default function DashboardCard({ title, value, subtext, icon: Icon, colorClass = "from-sky-500 to-indigo-600", onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`
        p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 
        hover-card flex items-center justify-between cursor-pointer
      `}
    >
      <div className="space-y-1.5 min-w-0">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 truncate">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>}
      </div>

      <div className={`p-3.5 rounded-xl bg-gradient-to-tr ${colorClass} text-white shadow-lg shadow-indigo-500/5`}>
        <Icon size={22} />
      </div>
    </div>
  );
}
