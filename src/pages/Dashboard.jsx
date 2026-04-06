import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, BarChart2, AlertTriangle, ChevronRight, MessageSquare, RefreshCw, Search, X } from 'lucide-react';
import { teamLeads, tierColors, isAtRisk } from '../data/strategists';

// Flatten all strategists with their pod info
const allStrategists = teamLeads.flatMap((tl) =>
  tl.strategists.map((s) => ({ ...s, pod: tl }))
);
const totalCases = teamLeads.reduce((a, tl) => a + (tl.totalCases || 0), 0);
const atRiskCount = allStrategists.filter(isAtRisk).length;
const avgCapacity = (allStrategists.reduce((a, s) => a + s.capacity, 0) / allStrategists.length).toFixed(1);

function KPICard({ title, value, sub, icon: Icon, iconBg, warn }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${warn ? 'border-rose-200' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}

function CapacityBar({ capacity }) {
  const pct = Math.min((capacity / 50) * 100, 100);
  const color = capacity >= 40 ? 'bg-indigo-400' : capacity >= 20 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-5 text-right">{capacity}</span>
    </div>
  );
}

export default function Dashboard() {
  const [slackData, setSlackData] = useState(null);
  const [search, setSearch] = useState('');
  const [podFilter, setPodFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}slack-data.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setSlackData(d))
      .catch(() => {});
  }, []);

  const slackConfigured = slackData && Object.keys(slackData.strategists || {}).length > 0;
  const lastSynced = slackData?.lastUpdated
    ? new Date(slackData.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  const filtered = allStrategists.filter((s) => {
    if (riskFilter && !isAtRisk(s)) return false;
    if (podFilter !== 'all' && s.pod.id !== Number(podFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.pod.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Strategist Overview</h1>
          <p className="text-slate-500 text-sm mt-1">2026 · {allStrategists.length} strategists across {teamLeads.length} pods</p>
        </div>
        {slackConfigured && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <RefreshCw size={11} />
            Slack synced {lastSynced}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Total Strategists"
          value={allStrategists.length}
          sub={`Across ${teamLeads.length} pods`}
          icon={Users}
          iconBg="bg-indigo-500"
        />
        <KPICard
          title="Total Cases"
          value={totalCases.toLocaleString()}
          sub="2026 combined capacity"
          icon={BarChart2}
          iconBg="bg-blue-500"
        />
        <KPICard
          title="Avg Capacity"
          value={avgCapacity}
          sub="Cases per strategist"
          icon={BarChart2}
          iconBg="bg-teal-500"
        />
        <KPICard
          title="At-Risk"
          value={atRiskCount}
          sub="Flagged in pod notes"
          icon={AlertTriangle}
          iconBg={atRiskCount > 0 ? 'bg-rose-500' : 'bg-slate-400'}
          warn={atRiskCount > 0}
        />
      </div>

      {/* Pod summary strip */}
      <div className="grid grid-cols-6 gap-3">
        {teamLeads.map((tl) => {
          const tc = tierColors[tl.tier];
          const risk = tl.strategists.filter(isAtRisk).length;
          return (
            <Link
              key={tl.id}
              to={`/team/${tl.id}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {tl.avatar}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 truncate">{tl.name}</div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tc.bg} ${tc.text}`}>{tl.tier}</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-1">{tl.strategists.length} strategists</div>
              <div className="text-xs text-slate-400">{tl.totalCases ?? '—'} cases</div>
              {risk > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  <AlertTriangle size={11} className="text-rose-400" />
                  <span className="text-xs text-rose-500 font-medium">{risk} at risk</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Strategist table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search strategists..."
              className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={podFilter}
            onChange={(e) => setPodFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-600 bg-white"
          >
            <option value="all">All pods</option>
            {teamLeads.map((tl) => (
              <option key={tl.id} value={tl.id}>{tl.name}'s pod</option>
            ))}
          </select>

          <button
            onClick={() => setRiskFilter(!riskFilter)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
              riskFilter
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300'
            }`}
          >
            <AlertTriangle size={13} />
            At-risk only
          </button>

          <span className="text-xs text-slate-400 ml-auto">{filtered.length} of {allStrategists.length}</span>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Strategist</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Pod</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-32">2026 Capacity</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">2026 PR</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</th>
              {slackConfigured && (
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Slack (7d)</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No strategists match your filters.</td>
              </tr>
            ) : filtered.map((s, i) => {
              const risk = isAtRisk(s);
              const tc = tierColors[s.pod.tier];
              // Lookup Slack activity by userId (preferred) or name fallback
              const slackEntry = slackData
                ? s.slackUserId
                  ? slackData.strategists?.[s.slackUserId]
                  : (() => {
                      const fn = s.name.split(' ')[0].toLowerCase();
                      return Object.values(slackData.strategists || {}).find((e) => {
                        const dn = (e.displayName || '').toLowerCase();
                        const rn = (e.realName || '').toLowerCase();
                        return dn === s.name.toLowerCase() || rn === s.name.toLowerCase() || dn === fn || rn.startsWith(fn + ' ');
                      });
                    })()
                : null;

              return (
                <tr
                  key={i}
                  className={`border-b border-slate-50 ${risk ? 'bg-rose-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {risk && <AlertTriangle size={13} className="text-rose-500 flex-shrink-0" />}
                      <span className="text-sm font-medium text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/team/${s.pod.id}`}
                      className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
                    >
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tc.bg} ${tc.text}`}>
                        {s.pod.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <CapacityBar capacity={s.capacity} />
                  </td>
                  <td className="px-5 py-3">
                    {s.pr
                      ? <span className="text-sm font-bold text-indigo-600">{s.pr}</span>
                      : <span className="text-xs text-slate-300 italic">—</span>}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 max-w-xs">
                    {risk
                      ? <span className="text-rose-600 font-medium">{s.notes}</span>
                      : s.notes || '—'}
                  </td>
                  {slackConfigured && (
                    <td className="px-5 py-3">
                      {slackEntry ? (
                        <div className="flex items-center gap-1.5">
                          <MessageSquare size={12} className="text-slate-400" />
                          <span className="text-sm font-semibold text-slate-700">{slackEntry.messagesLast7Days ?? '—'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
