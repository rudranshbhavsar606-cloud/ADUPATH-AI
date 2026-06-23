import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  Sparkles, 
  GraduationCap, 
  Compass, 
  Map, 
  Bookmark,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function Home({ profile, stats, setActivePage }) {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: "Hello! I am EduPath AI, your career and college guidance coordinator. How can I help you today? You can ask me to predict colleges, recommend engineering branches, detail placement figures, or upload notes for study tutoring!",
      agent: 'manager' 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState("manager"); // manager, predictor, career, research, study_planner, pdf_tutor
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInput("");
    setLoading(true);
    setActiveAgent("manager"); // Starts with Manager Agent routing

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile?.id || 1,
          message: text
        })
      });
      const data = await res.json();
      
      setActiveAgent(data.agent_type);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: data.response, 
        agent: data.agent_type 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "I'm having trouble connecting to the backend agent server. Please make sure the FastAPI backend is running on port 8000.",
        agent: 'manager'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getAgentLabel = (agent) => {
    switch (agent) {
      case 'predictor': return 'Predictor Agent';
      case 'career': return 'Career Agent';
      case 'research': return 'Research Agent';
      case 'study_planner': return 'Study Planner Agent';
      case 'pdf_tutor': return 'PDF Tutor Agent';
      default: return 'Manager Agent';
    }
  };

  const quickPrompts = [
    { label: "Predict colleges for my rank", icon: GraduationCap },
    { label: "Which branch has the best salaries?", icon: Compass },
    { label: "Create a computer science roadmap", icon: Map },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/10">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-sky-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold backdrop-blur-sm border border-white/5">
            <Sparkles size={12} className="animate-spin" />
            <span>AI Counseling Assistant Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">EduPath AI College Assistant</h1>
          <p className="text-sky-100 font-medium text-sm leading-relaxed">
            Get instant, personalized recommendations for engineering admission, placements, roadmaps, and exams. Start chatting below!
          </p>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Exam Details" 
          value={profile ? `${profile.exam_type} Rank` : "No Profile"} 
          subtext={profile ? `#${profile.rank || 'N/A'} (${profile.percentile || 'N/A'} %ile)` : "Setup profile first"}
          icon={GraduationCap}
          colorClass="from-sky-400 to-blue-600"
          onClick={() => setActivePage('profile')}
        />
        <DashboardCard 
          title="Predicted Options" 
          value={stats?.predictionsCount || "9+"} 
          subtext="Colleges matching cutoffs"
          icon={ShieldCheck}
          colorClass="from-emerald-400 to-teal-600"
          onClick={() => setActivePage('predictor')}
        />
        <DashboardCard 
          title="Study Roadmaps" 
          value="4-Year" 
          subtext="DSA, skills & projects"
          icon={Map}
          colorClass="from-purple-400 to-pink-600"
          onClick={() => setActivePage('roadmap')}
        />
        <DashboardCard 
          title="Saved Colleges" 
          value={stats?.savedCollegesCount || "0"} 
          subtext="Comparison checklist"
          icon={Bookmark}
          colorClass="from-amber-400 to-orange-600"
          onClick={() => setActivePage('bookmarks')}
        />
      </div>

      {/* Chat Console Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chat window */}
        <div className="lg:col-span-2 flex flex-col h-[550px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400">
                <BrainCircuit size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Orchestrated AI Chat</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Manager + 5 Specialised Agents</p>
              </div>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-full animate-pulse">
                <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <span>{getAgentLabel(activeAgent)} thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'bot' && (
                  <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                    <Bot size={16} />
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className={`
                    px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.sender === 'user' 
                      ? 'bg-sky-500 text-white rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/20 dark:border-slate-700/10'
                    }
                  `}>
                    {/* Render basic markdown-like lines */}
                    {msg.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className={line === "" ? "h-3" : "mb-1"}>{line}</p>
                    ))}
                  </div>
                  {msg.sender === 'bot' && (
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
                      {getAgentLabel(msg.agent)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-6 py-2 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800/20 bg-slate-50/50 dark:bg-slate-900/10">
            {quickPrompts.map((p, i) => {
              const Icon = p.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-xs font-semibold transition-all shadow-sm"
                >
                  <Icon size={12} className="text-slate-400" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input field */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-white dark:bg-slate-900 flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask predictor agent, placement records, roadmaps..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Info panel / agent guides */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" />
              <span>Multi-Agent System</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              EduPath AI runs a specialized multi-agent mesh. Your requests are classified and routed to specialist agents in real-time.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 text-xs">
                <div className="p-1 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 font-bold">1</div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Manager Agent</h4>
                  <p className="text-slate-400">Classifies student query intent and directs requests.</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="p-1 rounded bg-teal-50 dark:bg-teal-950 text-teal-600 font-bold">2</div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Predictor Agent</h4>
                  <p className="text-slate-400">Calculates admissions probability based on cutoff datasets.</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="p-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 font-bold">3</div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Career Agent</h4>
                  <p className="text-slate-400">Identifies suitable engineering disciplines and skills.</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="p-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 font-bold">4</div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Research & Planner Agent</h4>
                  <p className="text-slate-400">Fetches detailed college records and charts roadmaps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
