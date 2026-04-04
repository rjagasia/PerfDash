import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { employees, departments, getScoreBg } from '../data/employees';

function TrendIcon({ trend }) {
  if (trend === 'up') return <ArrowUpRight size={14} className="text-green-500" />;
  if (trend === 'down') return <ArrowDownRight size={14} className="text-red-500" />;
  return <Minus size={14} className="text-slate-400" />;
}

function ScoreBar({ score }) {
  const pct = (score / 5) * 100;
  const color = score >= 4.5 ? 'bg-green-500' : score >= 4.0 ? 'bg-indigo-500' : score >= 3.5 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700">{score}</span>
    </div>
  );
}

function GoalProgress({ goals }) {
  const completed = goals.filter((g) => g.status === 'completed').length;
  const pct = Math.round((completed / goals.length) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
        <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500">{completed}/{goals.length}</span>
    </div>
  );
}

export default function EmployeeList() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [sortField, setSortField] = useState('score');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = employees
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchDept = deptFilter === 'All' || e.department === deptFilter;
      const matchScore =
        scoreFilter === 'All' ||
        (scoreFilter === 'exceptional' && e.score >= 4.5) ||
        (scoreFilter === 'good' && e.score >= 4.0 && e.score < 4.5) ||
        (scoreFilter === 'fair' && e.score >= 3.5 && e.score < 4.0) ||
        (scoreFilter === 'needs_work' && e.score < 3.5);
      return matchSearch && matchDept && matchScore;
    })
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortBtn = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 uppercase tracking-wide"
    >
      {label}
      {sortField === field ? (
        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      ) : (
        <span className="w-3" />
      )}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-slate-500 text-sm mt-0.5">{filtered.length} of {employees.length} employees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          >
            <option value="All">All Scores</option>
            <option value="exceptional">Exceptional (4.5+)</option>
            <option value="good">Good (4.0–4.4)</option>
            <option value="fair">Fair (3.5–3.9)</option>
            <option value="needs_work">Needs Work (&lt;3.5)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3"><SortBtn field="name" label="Employee" /></th>
              <th className="text-left px-5 py-3"><SortBtn field="department" label="Department" /></th>
              <th className="text-left px-5 py-3"><SortBtn field="score" label="Score" /></th>
              <th className="text-left px-5 py-3 hidden lg:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Goals</span>
              </th>
              <th className="text-left px-5 py-3 hidden xl:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trend</span>
              </th>
              <th className="text-left px-5 py-3 hidden xl:table-cell">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Next Review</span>
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No employees match your filters.</td>
              </tr>
            ) : filtered.map((emp) => {
              const isReviewSoon = (() => {
                const next = new Date(emp.nextReview);
                const now = new Date('2026-04-04');
                const diff = (next - now) / (1000 * 60 * 60 * 24);
                return diff <= 30 && diff >= 0;
              })();

              return (
                <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {emp.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{emp.name}</div>
                        <div className="text-xs text-slate-400">{emp.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600">{emp.department}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <ScoreBar score={emp.score} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreBg(emp.score)}`}>
                        {emp.score >= 4.5 ? 'Exceptional' : emp.score >= 4.0 ? 'Good' : emp.score >= 3.5 ? 'Fair' : 'Needs Work'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <GoalProgress goals={emp.goals} />
                  </td>
                  <td className="px-5 py-3.5 hidden xl:table-cell">
                    <div className="flex items-center gap-1">
                      <TrendIcon trend={emp.trend} />
                      <span className="text-xs text-slate-500 capitalize">{emp.trend}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden xl:table-cell">
                    <span className={`text-xs ${isReviewSoon ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                      {emp.nextReview}
                      {isReviewSoon && ' ⚡'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/employees/${emp.id}`}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 text-sm font-medium"
                    >
                      View <ChevronRight size={14} />
                    </Link>
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
