import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { teamLeads, tierColors, isAtRisk } from '../data/strategists';

const totalCases = teamLeads.reduce((a, tl) => a + (tl.totalCases || 0), 0);
const totalStrategists = teamLeads.reduce((a, tl) => a + tl.strategists.length, 0);
const atRiskTotal = teamLeads.flatMap((tl) => tl.strategists).filter(isAtRisk).length;

const capData = teamLeads.map((tl) => ({
  name: tl.name,
  cases: tl.totalCases || 0,
  strategists: tl.strategists.length,
  avgCap: tl.strategists.length
    ? Number((tl.strategists.reduce((a, s) => a + s.capacity, 0) / tl.strategists.length).toFixed(1))
    : 0,
  color: tierColors[tl.tier].dot,
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-sm">
        <div className="font-medium text-slate-700">{label}</div>
        {payload.map((p) => (
          <div key={p.dataKey} style={{ color: p.fill || '#6366f1' }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-600 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Reports() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Capacity and team analytics · 2026</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Team Leads" value={teamLeads.length} sub="Your direct reports" />
        <StatCard label="Total Strategists" value={totalStrategists} sub="Across all pods" />
        <StatCard label="Total Cases" value={totalCases.toLocaleString()} sub="2026 capacity" />
        <StatCard label="At-Risk Strategists" value={atRiskTotal} sub="Flagged in pod notes" />
      </div>

      {/* Cases by team lead */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Total Cases by Team Lead</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={capData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cases" name="Cases" radius={[6, 6, 0, 0]}>
              {capData.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Avg capacity per strategist */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Avg Capacity per Strategist</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={capData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgCap" name="Avg Cap" radius={[6, 6, 0, 0]}>
              {capData.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pod breakdown table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Pod Breakdown</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Team Lead', 'Tier', 'Strategists', 'Total Cases', 'Avg Capacity', 'At-Risk', '2026 PR'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamLeads.map((tl) => {
              const tc = tierColors[tl.tier];
              const atRisk = tl.strategists.filter(isAtRisk).length;
              const avg = tl.strategists.length
                ? (tl.strategists.reduce((a, s) => a + s.capacity, 0) / tl.strategists.length).toFixed(1)
                : '—';
              return (
                <tr key={tl.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        {tl.avatar}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{tl.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.bg} ${tc.text}`}>{tl.tier}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{tl.strategists.length}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-700">{tl.totalCases ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{avg}</td>
                  <td className="px-5 py-3">
                    {atRisk > 0 ? (
                      <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">{atRisk}</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {tl.performanceRating ? (
                      <span className="text-sm font-bold text-indigo-600">{tl.performanceRating}</span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">TBD</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
