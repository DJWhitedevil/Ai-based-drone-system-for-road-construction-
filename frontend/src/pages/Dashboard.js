import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Crosshair, MapPin } from 'lucide-react';
import { statsAPI, reportsAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes, reportsRes] = await Promise.all([
          statsAPI.getSummary(),
          statsAPI.getTrends(),
          reportsAPI.getAll({ limit: 5 })
        ]);

        setStats(statsRes.data);
        setTrends(trendsRes.data || []);
        setRecentReports(reportsRes.data || []);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
      </div>
    );
  }

  const pieData = stats?.damageTypeBreakdown ? [
    { name: 'Cracks', value: stats.damageTypeBreakdown.cracks },
    { name: 'Potholes', value: stats.damageTypeBreakdown.potholes },
    { name: 'Undamaged', value: stats.damageTypeBreakdown.undamaged },
  ] : [];

  const severityData = stats?.severityBreakdown ? [
    { name: 'High', value: stats.severityBreakdown.high },
    { name: 'Medium', value: stats.severityBreakdown.medium },
    { name: 'Low', value: stats.severityBreakdown.low },
  ] : [];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-gray-400 mt-2 text-sm max-w-2xl">
            Monitor real-time drone data, inspect road conditions, and track recent anomalies detected by the AI model. All metrics are currently active.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inspections"
          value={stats?.totalSessions || 0}
          icon={<Crosshair size={24} className="text-blue-400" />}
          gradient="from-blue-600/20 to-blue-900/20"
          borderColor="border-blue-500/30"
          trend="+12% this week"
          trendPositive={true}
        />
        <StatCard
          title="Damages Detected"
          value={stats?.totalReports || 0}
          icon={<AlertTriangle size={24} className="text-red-400" />}
          gradient="from-red-600/20 to-red-900/20"
          borderColor="border-red-500/30"
          trend="+5% this week"
          trendPositive={false}
        />
        <StatCard
          title="Severe Issues"
          value={stats?.severityBreakdown?.high || 0}
          icon={<Activity size={24} className="text-orange-400" />}
          gradient="from-orange-600/20 to-orange-900/20"
          borderColor="border-orange-500/30"
          trend="Action required"
          trendPositive={false}
        />
        <StatCard
          title="Resolved"
          value={stats?.statusBreakdown?.resolved || 0}
          icon={<CheckCircle2 size={24} className="text-emerald-400" />}
          gradient="from-emerald-600/20 to-emerald-900/20"
          borderColor="border-emerald-500/30"
          trend="+18% this week"
          trendPositive={true}
        />
      </div>

      {/* Charts Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Takes 2 columns) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Detection Trends</h2>
              <p className="text-xs text-gray-400 mt-1">30-day overview of identified road issues</p>
            </div>
            <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-gray-700">
              Export Report
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#374151', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#fff' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Detections" />
                <Area type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" name="High Severity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 h-[calc(50%-12px)] flex flex-col">
            <h2 className="text-sm font-bold text-gray-200 mb-2">Severity Breakdown</h2>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 h-[calc(50%-12px)] flex flex-col">
            <h2 className="text-sm font-bold text-gray-200 mb-2">Damage Types</h2>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Damages Table-like List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Detections</h2>
            <p className="text-xs text-gray-400 mt-1">Latest anomalies flagged by the AI engine</p>
          </div>
          <button className="flex items-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            View All <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="divide-y divide-gray-800">
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <div key={report._id} className="p-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                    report.severity === 'high' ? 'bg-red-500/20 text-red-400 shadow-red-500/20' :
                    report.severity === 'medium' ? 'bg-orange-500/20 text-orange-400 shadow-orange-500/20' :
                    'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20'
                  }`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200 capitalize group-hover:text-blue-400 transition-colors">{report.damageType}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        report.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        report.severity === 'medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {report.severity}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1 gap-3">
                      <span className="flex items-center"><MapPin size={12} className="mr-1" /> {report.location?.lat?.toFixed(5)}, {report.location?.lng?.toFixed(5)}</span>
                      <span>•</span>
                      <span>Confidence: {((report.confidence || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-300">
                    {new Date(report.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex w-16 h-16 rounded-full bg-gray-800 items-center justify-center mb-3">
                <CheckCircle2 size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 font-medium">No recent damages detected</p>
              <p className="text-sm text-gray-500 mt-1">The system hasn't logged any anomalies recently.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, borderColor, trend, trendPositive }) {
  return (
    <div className={`glass-card rounded-2xl p-6 border-t-4 ${borderColor} relative overflow-hidden group`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</h3>
          </div>
          <div className="p-2.5 bg-gray-800/50 rounded-xl border border-gray-700 shadow-inner">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs">
          <span className={`font-medium ${trendPositive ? 'text-emerald-400' : trendPositive === false ? 'text-red-400' : 'text-gray-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
