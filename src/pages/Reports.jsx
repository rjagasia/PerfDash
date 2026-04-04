import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LineChart, Line, Legend,
} from 'recharts';
import { employees, departmentColors } from '../data/employees';

const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const deptStats = Object.entries(departmentColors).map(([dept]) => {
  const emps = employees.filter((e) => e.department === dept);
  if (!emps.length) return null;
  return {
    dept,
    avgScore: Number(avg(emps.map((e) => e.score)).toFixed(2)),
    avgQuality: Math.round(avg(emps.map((e) => e.metrics.quality))),
    avgVelocity: Math.round(avg(emps.map((e) => e.metrics.velocity))),
    avgCollab: Math.round(avg(emps.map((e) => e.metrics.collaboration))),
    avgInitiative: Math.round(avg(emps.map((e) => e.metrics.initiative))),
    headcount: emps.length,
    topPerformers: emps.filter((e) => e.score >= 4.5).length,
    goalsCompleted: emps.flatMap((e) => e.goals).filter((g) => g.status === 'completed').length,
    totalGoals: emps.flatMap((e) => e.goals).length,
  };
}).filter(Boolean);

const quarterlyData = [
  { quarter: 'Q1 2025', Engineering: 4.35, Design: 4.6, Marketing: 4.1, Sales: 3.95, HR: 3.8, Finance: 4.0 },
  { quarter: 'Q2 2025', Engineering: 4.45, Design: 4.6, Marketing: 4.3, Sales: 4.15, HR: 3.7, Finance: 4.2 },
  { quarter: 'Q3 2025', Engineering: 4.55, Design: 4.55, Marketing: 4.5, Sales: 4.25, HR: 3.5, Finance: 4.3 },
  { quarter: 'Q4 2025', Engineering: 4.5, Design: 4.55, Marketing: 4.5, Sales: 4.2, HR: 3.5, Finance: 4.35 },
];

const scatterData = employees.map((e) => ({
  name: e.name,
  tenure: Math.floor((new Date('2026-04-04') - new Date(e.hireDate)) / (1000 * 60 * 60 * 24 * 365)),
  score: e.score,
  dept: e.department,
}));

const DEPT_COLORS = Object.values(departmentColors);

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-700 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <div className="font-semibold text-slate-800">{d.name}</div>
        <div className="text-slate-500">{d.dept}</div>
        <div>Tenure: {d.tenure} yr{d.tenure !== 1 ? 's' : ''}</div>
        <div>Score: {d.score}</div>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const totalEmps = employees.length;
  const overallAvg = avg(employees.map((e) => e.score)).toFixed(2);
  const totalGoals = employees.flatMap((e) => e.goals).length;
  const completedGoals = employees.flatMap((e) => e.goals).filter((g) => g.status === 'completed').length;
  const goalCompletion = Math.round((completedGoals / totalGoals) * 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Analytics and insights across the organization</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={totalEmps} sub="Active headcount" />
        <StatCard label="Overall Avg Score" value={overallAvg} sub="Scale of 1–5" />
        <StatCard label="Goal Completion" value={`${goalCompletion}%`} sub={`${completedGoals} of ${totalGoals} goals done`} />
        <StatCard label="Top Performers" value={employees.filter((e) => e.score >= 4.5).length} sub="Score ≥ 4.5" />
      </div>

      {/* Quarterly trend by department */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Quarterly Performance Trend by Department</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {Object.entries(departmentColors).map(([dept, color]) => (
              <Line key={dept} type="monotone" dataKey={dept} stroke={color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dept comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Avg Score by Department</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptStats} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [v, 'Avg Score']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                {deptStats.map((d) => (
                  <rect key={d.dept} fill={departmentColors[d.dept]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tenure vs Score */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Tenure vs. Performance Score</h2>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="tenure" name="Tenure (yrs)" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} label={{ value: 'Years', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="score" domain={[3, 5]} name="Score" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <ZAxis range={[40, 40]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department detail table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Department Breakdown</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Department', 'Headcount', 'Avg Score', 'Quality', 'Velocity', 'Collab', 'Initiative', 'Goal %'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deptStats.sort((a, b) => b.avgScore - a.avgScore).map((d) => {
              const goalPct = d.totalGoals ? Math.round((d.goalsCompleted / d.totalGoals) * 100) : 0;
              return (
                <tr key={d.dept} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: departmentColors[d.dept] }} />
                      <span className="text-sm font-medium text-slate-700">{d.dept}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{d.headcount}</td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold" style={{ color: departmentColors[d.dept] }}>{d.avgScore}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{d.avgQuality}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{d.avgVelocity}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{d.avgCollab}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{d.avgInitiative}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{goalPct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
