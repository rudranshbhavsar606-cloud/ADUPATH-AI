import React, { useState } from 'react';
import { User, Check, AlertCircle, Save } from 'lucide-react';

export default function StudentProfile({ profile, setProfile, onSaveSuccess }) {
  const [name, setName] = useState(profile?.name || "");
  const [examType, setExamType] = useState(profile?.exam_type || "MHT-CET");
  const [percentile, setPercentile] = useState(profile?.percentile || "");
  const [rank, setRank] = useState(profile?.rank || "");
  const [category, setCategory] = useState(profile?.category || "General");
  const [preferredCities, setPreferredCities] = useState(profile?.preferred_cities || "Mumbai, Pune");
  const [interests, setInterests] = useState(profile?.interests || "AI/ML, Web Development");
  const [favoriteSubjects, setFavoriteSubjects] = useState(profile?.favorite_subjects || "Mathematics, Coding");
  
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'saving'
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg("");

    const payload = {
      name,
      exam_type: examType,
      percentile: examType === "MHT-CET" ? parseFloat(percentile) : null,
      rank: examType === "JEE" ? parseInt(rank) : null,
      category,
      preferred_cities: preferredCities,
      interests,
      favorite_subjects: favoriteSubjects
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save profile on backend server.");
      const data = await res.json();
      setProfile(data);
      setStatus('success');
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || "Error connecting to backend API.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
          <User size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Setup Student Profile</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">Provide your score inputs and tech interests for personalized agent routing.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm space-y-6">
        
        {/* Status Messages */}
        {status === 'success' && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-200/30">
            <Check size={16} />
            <span>Profile saved successfully! Database configured.</span>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm font-semibold border border-rose-200/30">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rudransh Bhavsar"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
            />
          </div>

          {/* Exam Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exam Taken</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
            >
              <option value="MHT-CET">MHT-CET (Maharashtra State)</option>
              <option value="JEE">JEE Main (National Level)</option>
            </select>
          </div>

          {/* Conditional Score Inputs */}
          {examType === "MHT-CET" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">MHT-CET Percentile</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                max="100"
                required
                value={percentile}
                onChange={(e) => setPercentile(e.target.value)}
                placeholder="e.g. 99.52"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">JEE All India Rank (AIR)</label>
              <input
                type="number"
                required
                min="1"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
              />
            </div>
          )}

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quota Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
            >
              <option value="General">General / Open</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          {/* Preferred Cities */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Preferred Cities</label>
            <input
              type="text"
              required
              value={preferredCities}
              onChange={(e) => setPreferredCities(e.target.value)}
              placeholder="e.g. Mumbai, Pune (use 'All' for no filter)"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
            />
          </div>

          {/* Favorite Subjects */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Favorite Subjects</label>
            <input
              type="text"
              required
              value={favoriteSubjects}
              onChange={(e) => setFavoriteSubjects(e.target.value)}
              placeholder="e.g. Mathematics, Coding"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
            />
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Technical Interests</label>
          <input
            type="text"
            required
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. AI/ML, Web Development, Robotics, IoT"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200 text-sm"
          />
          <p className="text-[11px] text-slate-400">Interests will be matched against engineering specializations to generate custom learning paths.</p>
        </div>

        <button
          type="submit"
          disabled={status === 'saving'}
          className="w-full py-4 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
        >
          <Save size={18} />
          <span>{status === 'saving' ? 'Saving profile...' : 'Save Profile & Update Agents'}</span>
        </button>

      </form>
    </div>
  );
}
