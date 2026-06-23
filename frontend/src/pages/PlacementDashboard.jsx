import React, { useState, useEffect } from 'react';
import { TrendingUp, Landmark, ShieldAlert } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

export default function PlacementDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/placements');
        if (!res.ok) throw new Error("Could not load placement analysis data.");
        const json = await res.json();
        
        // Map backend naming to Chart keys
        const mapped = json.map(item => ({
          name: item.college_name.split(",")[0].replace("Indian Institute of Technology", "IIT").replace("National Institute of Technology", "NIT"),
          average: item.average_package,
          highest: item.highest_package,
          fees: item.fees / 100000, // Show in Lakhs for comparison
          recruiters: item.top_recruiters
        }));
        setData(mapped);
      } catch (err) {
        setError(err.message || "Failed to load placements data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlacements();
  }, []);

  const COLORS = ['#38bdf8', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
          <TrendingUp size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Placement & Package Analysis</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Compare average salaries, highest packages, and return on investment (ROI) across engineering institutions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Rendering comparative analytics charts...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 text-rose-500 rounded-xl text-center text-sm border border-rose-100">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Average Package Comparison Chart */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">Average Package comparison (LPA)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} unit=" L" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                    />
                    <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROI Comparison Chart (Fees vs Avg Package) */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 uppercase tracking-wider">Salary vs Annual Fees (Lakhs)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} unit=" L" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="average" name="Average Salary" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fees" name="Annual Fees" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Detailed Institutional Statistics</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-500 dark:text-slate-400">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <th className="px-6 py-4">College Name</th>
                    <th className="px-6 py-4">Avg Package</th>
                    <th className="px-6 py-4">Highest Package</th>
                    <th className="px-6 py-4">Annual Fees</th>
                    <th className="px-6 py-4">Top Recruiters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                      <td className="px-6 py-4 text-emerald-500 font-extrabold">{item.average} LPA</td>
                      <td className="px-6 py-4 font-extrabold text-slate-700 dark:text-slate-300">{item.highest} LPA</td>
                      <td className="px-6 py-4">₹{(item.fees * 100000).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.recruiters.slice(0, 3).map((rec, rIdx) => (
                            <span 
                              key={rIdx}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400"
                            >
                              {rec}
                            </span>
                          ))}
                          {item.recruiters.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold self-center">+{item.recruiters.length - 3} more</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
