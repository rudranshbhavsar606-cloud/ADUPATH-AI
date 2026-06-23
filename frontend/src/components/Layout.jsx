import React, { useState } from 'react';
import { 
  Compass, 
  GraduationCap, 
  TrendingUp, 
  Map, 
  FileText, 
  Bookmark, 
  User, 
  Home, 
  Menu, 
  X, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children, activePage, setActivePage, profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Dashboard Hub', icon: Home },
    { id: 'profile', label: 'Student Profile', icon: User },
    { id: 'predictor', label: 'College Predictor', icon: GraduationCap },
    { id: 'career', label: 'Career Paths', icon: Compass },
    { id: 'placements', label: 'Placements Analysis', icon: TrendingUp },
    { id: 'roadmap', label: 'Study Roadmap', icon: Map },
    { id: 'pdftutor', label: 'PDF AI Tutor', icon: FileText },
    { id: 'bookmarks', label: 'Saved Colleges', icon: Bookmark },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200/60 dark:border-slate-800/40 
        bg-white dark:bg-slate-900 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">EduPath AI</span>
              <p className="text-[10px] text-slate-400 font-semibold dark:text-slate-500 uppercase tracking-widest">Student Agent</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-400 border-l-4 border-sky-500 dark:bg-sky-950/20' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'
                  }
                `}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={18} className={isActive ? "text-sky-500" : "text-slate-400"} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-sky-500" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header bar */}
        <header className="h-20 glass sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200/50 dark:border-slate-800/20">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* Header Greeting */}
            <div>
              <h2 className="text-slate-800 dark:text-slate-200 font-bold text-lg hidden sm:block">
                Welcome, {profile?.name || 'Aspirant'} 👋
              </h2>
              {profile && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {profile.exam_type} Rank: #{profile.rank || 'N/A'} (Percentile: {profile.percentile ? `${profile.percentile}%` : 'N/A'})
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* Avatar Mock */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-0.5 shadow-md shadow-indigo-500/10">
              <div className="h-full w-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm">
                {(profile?.name || 'S').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages wrapper */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
