import React, { useState, useEffect } from 'react';
import { Compass, BookOpen, TrendingUp, Sparkles } from 'lucide-react';

export default function CareerRecommendation({ profile, setActivePage }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('http://127.0.0.1:8000/api/recommendations');
      if (!res.ok) throw new Error("Could not retrieve career recommendations.");
      const data = await res.json();
      setRecs(data.recommendations || []);
    } catch (err) {
      setError(err.message || "Failed to load data from backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [profile]);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-5">
        <Compass size={48} className="mx-auto text-sky-500 animate-spin" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Student Profile Configured</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          I need your list of academic interests and favorite subjects to formulate custom engineering branch matching.
        </p>
        <button
          onClick={() => setActivePage('profile')}
          className="px-6 py-3 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-sm"
        >
          Setup Profile Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
          <Compass size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Branch Recommendations</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Recommended engineering disciplines based on your favorite subjects ({profile.favorite_subjects}) and interests.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">AI Career Agent is evaluating market demand and skill fits...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-500 rounded-xl text-center text-sm border border-rose-100">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Card list */}
          <div className="space-y-6">
            {recs.map((rec, index) => (
              <div 
                key={index}
                className="p-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm hover-card flex flex-col md:flex-row gap-8"
              >
                {/* Visual percentage representation */}
                <div className="flex flex-col items-center justify-center space-y-2 shrink-0 md:w-36">
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        strokeWidth="8" 
                        stroke="currentColor" 
                        className="text-slate-100 dark:text-slate-800"
                        fill="transparent" 
                      />
                      <circle 
                        cx="48" 
                        cy="48" 
                        r="40" 
                        strokeWidth="8" 
                        stroke="currentColor" 
                        className="text-sky-500"
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - rec.match_percentage / 100)}
                      />
                    </svg>
                    <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{rec.match_percentage}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Match Match</span>
                </div>

                {/* Content details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{rec.branch}</h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500 border border-slate-250/20 dark:border-slate-800">
                      <TrendingUp size={12} className="text-indigo-500" />
                      <span>Starts: {rec.avg_starting_salary}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Future Outlook / Scope</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {rec.future_scope}
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Core Skills to Build</span>
                    <div className="flex flex-wrap gap-2">
                      {rec.skills_required.map((skill, sIdx) => (
                        <span 
                          key={sIdx}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Guidelines info card */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-sky-50 to-indigo-50 dark:from-sky-950/20 dark:to-indigo-950/20 border border-indigo-150/10 flex gap-4">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-indigo-500 shrink-0 h-fit shadow-md shadow-indigo-500/5">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Quick Counseling Note</h4>
              <p className="leading-relaxed">
                Branch recommendations are calculated from computational models matching interest keywords against industrial sector trends. 
                Remember to verify which colleges support these specific branch codes in predicted CAP rounds.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
