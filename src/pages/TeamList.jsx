import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertTriangle, ChevronRight } from 'lucide-react';
import { teamLeads, tierColors, isAtRisk } from '../data/strategists';

function CapacityBar({ cases }) {
  const max = 700;
  const pct = Math.min((cases / max) * 100, 100);
  const color = cases > 600 ? 'bg-rose-400' : cases > 400 ? 'bg-indigo-500' : 'bg-teal-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-24">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700">{cases ?? '—'}</span>
    </div>
  );
}

export default function TeamList() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');

  const filtered = teamLeads.filter((tl) => {
    const q = search.toLowerCase();
    const matchSearch = tl.name.toLowerCase().includes(q) || tl.role.toLowerCase().includes(q);
    const matchTier = tierFilter === 'All' || tl.tier === tierFilter;
    return matchSearch && matchTier;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Team Leads</h1>
        <p className="text-slate-500 text-sm mt-0.5">{filtered.length} of {teamLeads.length} team leads</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search team leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="All">All Tiers</option>
          <option>Principal</option>
          <option>Senior</option>
          <option>Junior</option>
        </select>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((tl) => {
          const tc = tierColors[tl.tier];
          const atRiskMembers = tl.strategists.filter(isAtRisk);
          const avgCap = tl.strategists.length
            ? (tl.strategists.reduce((a, s) => a + s.capacity, 0) / tl.strategists.length).toFixed(1)
            : '—';

          return (
            <Link
              key={tl.id}
              to={`/team/${tl.id}`}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {tl.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">
                      {tl.name}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.bg} ${tc.text}`}>
                      {tl.tier}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-300 group-hover:text-indigo-400 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>

              <div className="text-xs text-slate-400 mt-3 line-clamp-1">{tl.responsibilities}</div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-lg font-bold text-slate-800">{tl.strategists.length}</div>
                  <div className="text-xs text-slate-400">Strategists</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{tl.totalCases ?? '—'}</div>
                  <div className="text-xs text-slate-400">Cases</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${tl.performanceRating ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {tl.performanceRating ?? 'TBD'}
                  </div>
                  <div className="text-xs text-slate-400">2026 PR</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">Avg capacity per strategist: {avgCap}</div>
                <CapacityBar cases={tl.totalCases || 0} />
              </div>

              {atRiskMembers.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-1.5">
                  <AlertTriangle size={13} />
                  {atRiskMembers.length} at-risk strategist{atRiskMembers.length > 1 ? 's' : ''}: {atRiskMembers.map((s) => s.name).join(', ')}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
