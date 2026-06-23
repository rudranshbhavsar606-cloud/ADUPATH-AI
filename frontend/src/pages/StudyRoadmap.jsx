import React, { useState, useEffect } from 'react';
import { Map, BookOpen, Wrench, FolderGit2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StudyRoadmap({ profile, setActivePage }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeYear, setActiveYear] = useState("year_1");
  const [completedItems, setCompletedItems] = useState(() => {
    const saved = localStorage.getItem('roadmap_progress');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!profile) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch('http://127.0.0.1:8000/api/roadmap');
        if (!res.ok) throw new Error("Failed to load customized study roadmap.");
        const data = await res.json();
        setRoadmap(data);
      } catch (err) {
        setError(err.message || "Failed to load study plan.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [profile]);

  const handleToggleItem = (itemKey) => {
    const updated = {
      ...completedItems,
      [itemKey]: !completedItems[itemKey]
    };
    setCompletedItems(updated);
    localStorage.setItem('roadmap_progress', JSON.stringify(updated));
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center p-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-5">
        <Map size={48} className="mx-auto text-pink-500 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Student Profile Configured</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set up your academic profile first to generate a custom 4-year study path geared to your interests.
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

  const years = [
    { id: 'year_1', label: 'Year 1: Foundations' },
    { id: 'year_2', label: 'Year 2: Development' },
    { id: 'year_3', label: 'Year 3: Specialization' },
    { id: 'year_4', label: 'Year 4: Placements' },
  ];

  const activeYearData = roadmap ? roadmap[activeYear] : null;

  // Calculate year completion progress
  const getYearProgress = (yearId) => {
    if (!roadmap || !roadmap[yearId]) return 0;
    const yData = roadmap[yearId];
    const total = (yData.skills?.length || 0) + (yData.courses?.length || 0) + (yData.projects?.length || 0) + (yData.certifications?.length || 0);
    if (total === 0) return 0;
    
    let completedCount = 0;
    const categories = ['skills', 'courses', 'projects', 'certifications'];
    categories.forEach(cat => {
      yData[cat]?.forEach(item => {
        const key = `${yearId}_${cat}_${item}`;
        if (completedItems[key]) completedCount++;
      });
    });
    return Math.round((completedCount / total) * 100);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-500 text-white shadow-lg shadow-pink-500/20">
            <Map size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">4-Year Skill Roadmap</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Custom engineering study milestone guide mapped for **{roadmap?.branch || 'Your Branch'}**.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Assembling skills, courses, and certifications...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-500 rounded-xl text-center text-sm border border-rose-100">
          {error}
        </div>
      ) : activeYearData ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation vertical list on large screens, horizontal on small */}
          <div className="lg:col-span-1 space-y-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-3 lg:gap-0">
            {years.map((y) => {
              const progress = getYearProgress(y.id);
              return (
                <button
                  key={y.id}
                  onClick={() => setActiveYear(y.id)}
                  className={`
                    w-full text-left px-5 py-4 rounded-2xl font-bold text-xs shrink-0 transition-all border
                    ${activeYear === y.id
                      ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-500/10 border-transparent'
                      : 'bg-white dark:bg-slate-900 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-slate-350 border-slate-200/50 dark:border-slate-800/40'
                    }
                  `}
                >
                  <div className="space-y-1">
                    <span>{y.label}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${activeYear === y.id ? 'bg-white' : 'bg-sky-500'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className={`text-[10px] block ${activeYear === y.id ? 'text-white/80' : 'text-slate-400'}`}>
                      {progress}% Complete
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active year milestone cards */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Year description banner */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-1">
              <span className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Active Milestones</span>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{activeYearData.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {activeYearData.description}
              </p>
            </div>

            {/* Checklist items in cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Skills */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Wrench size={14} className="text-sky-500" />
                  <span>Key Skills to Master</span>
                </h4>
                <div className="space-y-2.5">
                  {activeYearData.skills?.map((item, idx) => {
                    const key = `${activeYear}_skills_${item}`;
                    const isDone = !!completedItems[key];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleItem(key)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-850 text-left transition-all text-xs font-semibold"
                      >
                        <span className={isDone ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}>{item}</span>
                        <CheckCircle2 size={16} className={isDone ? "text-emerald-500 fill-emerald-500/10" : "text-slate-300 dark:text-slate-700"} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Courses */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={14} className="text-indigo-500" />
                  <span>Recommended Courses</span>
                </h4>
                <div className="space-y-2.5">
                  {activeYearData.courses?.map((item, idx) => {
                    const key = `${activeYear}_courses_${item}`;
                    const isDone = !!completedItems[key];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleItem(key)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-850 text-left transition-all text-xs font-semibold"
                      >
                        <span className={isDone ? "line-through text-slate-400 font-medium" : "text-slate-700 dark:text-slate-300"}>{item}</span>
                        <CheckCircle2 size={16} className={isDone ? "text-emerald-500 fill-emerald-500/10" : "text-slate-300 dark:text-slate-700"} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Projects */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FolderGit2 size={14} className="text-pink-500" />
                  <span>Portfolio Mini-Projects</span>
                </h4>
                <div className="space-y-2.5">
                  {activeYearData.projects?.map((item, idx) => {
                    const key = `${activeYear}_projects_${item}`;
                    const isDone = !!completedItems[key];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleItem(key)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-850 text-left transition-all text-xs font-semibold"
                      >
                        <span className={isDone ? "line-through text-slate-400 font-medium" : "text-slate-700 dark:text-slate-300"}>{item}</span>
                        <CheckCircle2 size={16} className={isDone ? "text-emerald-500 fill-emerald-500/10" : "text-slate-300 dark:text-slate-700"} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Certifications */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} className="text-amber-500" />
                  <span>Target Certifications</span>
                </h4>
                <div className="space-y-2.5">
                  {activeYearData.certifications?.map((item, idx) => {
                    const key = `${activeYear}_certifications_${item}`;
                    const isDone = !!completedItems[key];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleItem(key)}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-850 text-left transition-all text-xs font-semibold"
                      >
                        <span className={isDone ? "line-through text-slate-400 font-medium" : "text-slate-700 dark:text-slate-300"}>{item}</span>
                        <CheckCircle2 size={16} className={isDone ? "text-emerald-500 fill-emerald-500/10" : "text-slate-300 dark:text-slate-700"} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
