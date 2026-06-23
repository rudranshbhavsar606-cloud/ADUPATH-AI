import React, { useState, useEffect } from 'react';
import { GraduationCap, Heart, Check, ExternalLink, Search, Filter } from 'lucide-react';

export default function CollegePredictor({ profile, savedIds, toggleSaveCollege, setActivePage }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [maxFees, setMaxFees] = useState(250000);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPredictions = async () => {
    if (!profile) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('http://127.0.0.1:8000/api/predict');
      if (!res.ok) throw new Error("Could not load college prediction metrics.");
      const data = await res.json();
      setPredictions(data.predictions || []);
    } catch (err) {
      setError(err.message || "Failed to contact backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [profile]);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-5">
        <GraduationCap size={48} className="mx-auto text-indigo-500 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Student Profile Configured</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          I need your exam type, score percentile, and quota category to perform historical cutoff matches.
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

  // Helper arrays for filtering
  const uniqueCities = ["all", ...new Set(predictions.map(p => p.college.city))];

  // Filters application
  const filteredPredictions = predictions.filter(item => {
    const cityMatch = filterCity === "all" || item.college.city.toLowerCase() === filterCity.toLowerCase();
    const feeMatch = item.college.fees <= maxFees;
    const nameMatch = item.college.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      item.branch.toLowerCase().includes(searchTerm.toLowerCase());
    return cityMatch && feeMatch && nameMatch;
  });

  const getProbColor = (prob) => {
    switch (prob) {
      case 'High': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      default: return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-bold">College Predictor</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Admission probability calculated from your {profile.exam_type} score of {profile.percentile || profile.rank}.
            </p>
          </div>
        </div>
        <button 
          onClick={fetchPredictions}
          className="text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 dark:bg-sky-950/20 px-3.5 py-2 rounded-xl transition-all"
        >
          Recalculate Cutoffs
        </button>
      </div>

      {/* Filters Area */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Search size={12} />
            <span>Search College / Branch</span>
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. COEP, Computer"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
          />
        </div>

        {/* City Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter size={12} />
            <span>City Location</span>
          </label>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm capitalize"
          >
            {uniqueCities.map((c, i) => (
              <option key={i} value={c}>{c === "all" ? "All Cities" : c}</option>
            ))}
          </select>
        </div>

        {/* Fee Limit */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Max Annual Fees</span>
            <span className="text-sky-500 font-semibold">₹{maxFees.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="80000"
            max="250000"
            step="10000"
            value={maxFees}
            onChange={(e) => setMaxFees(parseInt(e.target.value))}
            className="w-full accent-sky-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer dark:bg-slate-850"
          />
        </div>

      </div>

      {/* Predictions grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Comparing your score with historical database cutoffs...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-500 rounded-xl text-center text-sm font-semibold border border-rose-100">
          {error}
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <p className="text-sm font-medium">No colleges matched your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPredictions.map((item, index) => {
            const isSaved = savedIds.includes(item.college.id);
            return (
              <div 
                key={index}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm hover-card flex flex-col justify-between space-y-4"
              >
                
                {/* College header */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.college.city}, {item.college.state}</span>
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getProbColor(item.admission_probability)}`}>
                      {item.admission_probability} Chance ({item.chance_percentage})
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-snug">{item.college.name}</h3>
                  <p className="text-sm text-sky-500 font-bold">{item.branch}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/50 text-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg Package</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{item.average_package}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Annual Fees</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">₹{item.college.fees/1000}k</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cutoff score</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{item.cutoff_percentile}%</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  {item.college.website && (
                    <a 
                      href={item.college.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
                    >
                      <span>Website</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <button
                    onClick={() => toggleSaveCollege(item.college.id)}
                    className={`
                      px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all
                      ${isSaved 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-800'
                      }
                    `}
                  >
                    {isSaved ? <Check size={12} /> : <Heart size={12} className="text-slate-400" />}
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
