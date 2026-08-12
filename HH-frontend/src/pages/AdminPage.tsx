import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser, UserButton } from '@clerk/clerk-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { api } from '../lib/api';
import { CardData } from '../types';
import { Shield, Download, AlertTriangle, ArrowUpRight, ExternalLink } from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

interface AdminStats {
  total: number;
  today: number;
  downloads: number;
  shares: number;
  format_a: number;
  format_b: number;
  mobile_pct: number;
}

interface TimeseriesPoint {
  ts: string;
  count: number;
}

const COLORS = ['#c5a059', '#e6ca85', '#8e723d', '#d4af37'];

export default function AdminPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentCards, setRecentCards] = useState<CardData[]>([]);
  const [trendData, setTrendData] = useState<TimeseriesPoint[]>([]);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const isAdmin = ADMIN_EMAIL ? userEmail === ADMIN_EMAIL : isSignedIn;

  useEffect(() => {
    if (!isAdmin) return;

    const fetchAdminData = async () => {
      try {
        const [statsData, trendResult] = await Promise.all([
          api.get<AdminStats>('/api/admin/stats'),
          api.get<{ data: TimeseriesPoint[] }>('/api/admin/timeseries?days=7'),
        ]);
        setStats(statsData);
        setTrendData(trendResult.data);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      }
    };
    fetchAdminData();
  }, [isAdmin]);

  // Not logged in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-md mx-auto flex flex-col justify-center items-center bg-[#0a0a0a]">
        <div className="w-full glass p-8 rounded-3xl border border-white/10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#c5a059] flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-semibold text-2xl text-white mb-1">Admin Dashboard</h2>
            <p className="text-xs font-mono text-[#d4d4d4]/70">You must be signed in to access this page.</p>
          </div>
          <button
            onClick={() => navigate('/sign-in')}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#c5a059] via-[#e6ca85] to-[#8e723d] text-[#0a0a0a] font-sans font-semibold text-sm"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 max-w-md mx-auto flex flex-col justify-center items-center bg-[#0a0a0a]">
        <div className="w-full glass p-8 rounded-3xl border border-white/10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif font-semibold text-2xl text-white mb-1">Access Denied</h2>
            <p className="text-xs font-mono text-[#d4d4d4]/70">
              Admin access is restricted. Signed in as:
            </p>
            <p className="text-sm font-mono text-[#c5a059] mt-1">{userEmail}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-full h-12 rounded-full bg-[#121212] border border-white/10 text-white font-sans font-semibold text-sm"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate('/create')}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#c5a059] to-[#8e723d] text-[#0a0a0a] font-sans font-semibold text-sm"
            >
              Create Your Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  const effectiveStats = stats || {
    total: 0, today: 0, downloads: 0, shares: 0,
    format_a: 0, format_b: 0, mobile_pct: 0,
  };

  const formatPieData = [
    { name: 'PFP Frame (A)', value: effectiveStats.format_a },
    { name: 'Builder Card (B)', value: effectiveStats.format_b },
  ];

  const displayTrend = trendData.length > 0
    ? trendData.map(d => ({ date: new Date(d.ts).toLocaleDateString('en-US', { weekday: 'short' }), count: d.count }))
    : [{ date: 'Mon', count: 0 }, { date: 'Tue', count: 0 }, { date: 'Wed', count: 0 }, { date: 'Thu', count: 0 }, { date: 'Fri', count: 0 }, { date: 'Sat', count: 0 }, { date: 'Sun', count: 0 }];

  const exportCSV = async () => {
    try {
      const blob = await api.getBlob('/api/admin/export/csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BuildPass_Generations_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      console.error('CSV export failed');
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-[#0a0a0a] text-[#d4d4d4] space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-mono text-[#c5a059] tracking-widest uppercase block mb-1">
            BUILDPASS ADMIN
          </span>
          <h1 className="text-3xl font-semibold font-serif text-white">
            Analytics & Generation Records
          </h1>
          <p className="text-xs font-mono text-[#d4d4d4]/50 mt-1">
            Signed in as {userEmail}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV}
            className="px-4 py-2 rounded-full bg-[#121212] border border-white/10 hover:border-[#c5a059] text-[#c5a059] font-mono text-xs flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /><span>Export CSV</span>
          </button>
          <button onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full bg-[#181818] text-[#d4d4d4]/70 hover:text-white font-mono text-xs">
            Home
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Cards Generated', value: effectiveStats.total.toLocaleString(), color: 'text-white', sub: 'All time' },
          { label: 'Generations Today', value: effectiveStats.today.toString(), color: 'text-[#c5a059]', sub: 'Real-time count' },
          { label: 'Downloads', value: effectiveStats.downloads.toLocaleString(), color: 'text-[#e6ca85]', sub: 'High quality PNGs' },
          { label: 'Shares to X', value: effectiveStats.shares.toLocaleString(), color: 'text-[#d4af37]', sub: '#FrameInGoa' },
        ].map((m, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-white/10">
            <span className="text-xs font-mono text-[#d4d4d4]/70 uppercase tracking-wider block mb-1">{m.label}</span>
            <div className={`text-4xl font-semibold font-serif ${m.color} mb-2`}>{m.value}</div>
            <span className="text-xs font-mono text-[#d4d4d4]/70">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass p-6 rounded-3xl border border-white/10">
          <h3 className="font-serif font-semibold text-lg text-white mb-6">Generations Trend (7 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTrend}>
                <CartesianGrid stroke="#222" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#d4d4d4', fontSize: 12 }} />
                <YAxis tick={{ fill: '#d4d4d4', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#121212', borderColor: '#333', color: '#FFF' }} />
                <Line type="monotone" dataKey="count" stroke="#c5a059" strokeWidth={3} dot={{ fill: '#c5a059', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-4 glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <h3 className="font-serif font-semibold text-lg text-white mb-4">Format Preference</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formatPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                  {formatPieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#121212', borderColor: '#333', color: '#FFF' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-mono text-[#d4d4d4]/70 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" /> A ({effectiveStats.format_a})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#e6ca85]" /> B ({effectiveStats.format_b})</span>
          </div>
        </div>
      </div>

      {/* Recent table placeholder */}
      {recentCards.length > 0 && (
        <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="font-serif font-semibold text-lg text-white">Recent Generations ({recentCards.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#d4d4d4]/70">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {recentCards.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-bold">{c.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${c.format === 'format_a' ? 'bg-[#c5a059]/10 text-[#c5a059]' : 'bg-[#e6ca85]/10 text-[#e6ca85]'}`}>
                        {c.format === 'format_a' ? 'A' : 'B'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#d4d4d4]/70">{c.title}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => navigate(`/result?id=${c.id}`)} className="text-[#c5a059] hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
