import React, { useState, useEffect } from 'react';
import { Bookmark, Heart, BarChart3, AlertCircle } from 'lucide-react';

export default function SavedColleges({ profile, savedIds, toggleSaveCollege, setActivePage }) {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSavedColleges = async () => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('http://127.0.0.1:8000/api/saved-colleges');
      if (!res.ok) throw new Error("Could not load bookmarked colleges list.");
      const data = await res.json();
      setColleges(data || []);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedColleges();
  }, [profile, savedIds]); // Refresh when savedIds changes

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-5">
        <Bookmark size={48} className="mx-auto text-amber-500 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Student Profile Configured</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Create a profile first to enable saving and comparing engineering colleges.
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
        <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
          <Bookmark size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Saved Colleges Comparison</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Compare packages, tuition fees, and placements for your bookmarked institutions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Loading saved bookmarks...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-500 rounded-xl text-center text-sm border border-rose-100">
          {error}
        </div>
      ) : colleges.length === 0 ? (
        <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <Bookmark size={32} className="mx-auto text-slate-300" />
          <p className="text-sm font-medium">Your bookmark checklist is empty.</p>
          <button
            onClick={() => setActivePage('predictor')}
            className="px-4 py-2 text-xs font-bold bg-sky-550 text-sky-500 hover:bg-sky-50 dark:bg-sky-950/20 rounded-xl transition-all"
          >
            Find Colleges to Save
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Comparison cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((col) => (
              <div 
                key={col.id}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm hover-card flex flex-col justify-between space-y-5"
              >
                
                {/* College name info */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{col.city}, {col.state}</span>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-snug">{col.name}</h3>
                  {col.nirf_rank && (
                    <span className="inline-flex text-[9px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 px-2 py-0.5 rounded">
                      NIRF Engineering Rank: #{col.nirf_rank}
                    </span>
                  )}
                </div>

                {/* Placements block */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-2 border border-slate-150/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Average Salary:</span>
                    <span className="text-emerald-500 font-extrabold">{col.average_package} LPA</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Highest Salary:</span>
                    <span className="text-slate-700 dark:text-slate-350 font-extrabold">{col.highest_package} LPA</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Annual Fees:</span>
                    <span className="text-slate-700 dark:text-slate-350 font-extrabold">₹{col.fees.toLocaleString()}</span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => toggleSaveCollege(col.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100/50 text-rose-600 dark:text-rose-400 transition-colors border border-rose-100/10 flex items-center justify-center gap-1.5"
                >
                  <Heart size={12} className="fill-rose-650 text-rose-600" />
                  <span>Remove Bookmark</span>
                </button>

              </div>
            ))}
          </div>

          {/* Quick analysis box */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl flex gap-4">
            <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-500 h-fit shadow-md shadow-sky-500/5">
              <BarChart3 size={20} />
            </div>
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Compare and Decide</h4>
              <p className="leading-relaxed">
                Aim for colleges that offer high average placements relative to tuition fees (high ROI). 
                Make sure to match their city locations with your preferred counselor forms in state CAP guidelines.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
