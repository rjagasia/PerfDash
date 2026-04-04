import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, TrendingUp, Target, ClipboardList, ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from 'lucide-react';
import { employees, departmentColors, getScoreBg } from '../data/employees';

const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const avgScore = avg(employees.map((e) => e.score)).toFixed(1);
const topPerformers = employees.filter((e) => e.score >= 4.5).length;
const goalsCompleted = employees.flatMap((e) => e.goals).filter((g) => g.status === 'completed').length;
const reviewsDue = employees.filter((e) => {
  const next = new Date(e.nextReview);
  const now = new Date('2026-04-04');
  const diff = (next - now) / (1000 * 60 * 60 * 24);
  return diff <= 30 && diff >= 0;
}).length;

const deptData = Object.entries(departmentColors).map(([dept, color]) => {
  const deptEmps = employees.filter((e) => e.department === dept);
  return {
    dept,
    color,
    avg: deptEmps.length ? avg(deptEmps.map((e) => e.score)).toFixed(2) : 0,
    count: deptEmps.length,
  };
});

const scoreDistribution = [
  { label: 'Exceptional (4.5+)', count: employees.filter((e) => e.score >= 4.5).length, color: '#22c55e' },
  { label: 'Good (4.0–4.4)', count: employees.filter((e) => e.score >= 4.0 && e.score < 4.5).length, color: '#6366f1' },
  { label: 'Fair (3.5–3.9)', count: employees.filter((e) => e.score >= 3.5 && e.score < 4.0).length, color: '#f59e0b' },
  { label: 'Needs Work (<3.5)', count: employees.filter((e) => e.score < 3.5).length, color: '#ef4444' },
];

const companyTrend = [
  { quarter: 'Q1 2025', avg: 4.1 },
  { quarter: 'Q2 2025', avg: 4.2 },
  { quarter: 'Q3 2025', avg: 4.3 },
  { quarter: 'Q4 2025', avg: 4.35 },
  { quarter: 'Q1 2026', avg: Number(avgScore) },
];

const radarData = [
  { metric: 'Quality', value: Math.round(avg(employees.map((e) => e.metrics.quality))) },
  { metric: 'Velocity', value: Math.round(avg(employees.map((e) => e.metrics.velocity))) },
  { metric: 'Collab', value: Math.round(avg(employees.map((e) => e.metrics.collaboration))) },
  { metric: 'Initiative', value: Math.round(avg(employees.map((e) => e.metrics.initiative))) },
];

function KPICard({ title, value, subtitle, icon: Icon, iconBg, delta }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{subtitle}</div>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <ArrowUpRight size={14} className="text-green-500" />;
  if (trend === 'down') return <ArrowDownRight size={14} className="text-red-500" />;
  return <Minus size={14} className="text-slate-400" />;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-sm">
        <div className="font-medium text-slate-700">{label}</div>
        <div className="text-indigo-600">{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const topEmployees = [...employees].sort((a, b) => b.score - a.score).slice(0, 5);
  const recentActivity = [
    { text: 'Alice Chen completed AWS certification goal', time: '2 hours ago', type: 'goal' },
    { text: 'Q4 2025 review cycle finalized for 12 employees', time: '1 day ago', type: 'review' },
    { text: 'Clara Nguyen received exceptional rating', time: '2 days ago', type: 'rating' },
    { text: 'Frank Zhou promoted to Mid-level Sales Rep', time: '3 days ago', type: 'promotion' },
    { text: 'Henry Brooks scheduled for performance check-in', time: '4 days ago', type: 'alert' },
  ];

  const activityColors = {
    goal: 'bg-green-100 text-green-700',
    review: 'bg-blue-100 text-blue-700',
    rating: 'bg-purple-100 text-purple-700',
    promotion: 'bg-indigo-100 text-indigo-700',
    alert: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Performance Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Q1 2026 · April 4, 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Avg Performance Score"
          value={avgScore}
          subtitle="Across all 12 employees"
          icon={TrendingUp}
          iconBg="bg-indigo-500"
        />
        <KPICard
          title="Top Performers"
          value={topPerformers}
          subtitle="Score ≥ 4.5 (exceptional)"
          icon={Users}
          iconBg="bg-green-500"
        />
        <KPICard
          title="Goals Completed"
          value={goalsCompleted}
          subtitle={`Out of ${employees.flatMap((e) => e.goals).length} total goals`}
          icon={Target}
          iconBg="bg-amber-500"
        />
        <KPICard
          title="Reviews Due Soon"
          value={reviewsDue}
          subtitle="Within next 30 days"
          icon={ClipboardList}
          iconBg="bg-rose-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Company trend */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Company Performance Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={companyTrend} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={scoreDistribution} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                {scoreDistribution.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [`${val} employees`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {scoreDistribution.map((d) => (
              <div key={d.label} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="flex-1">{d.label}</span>
                <span className="font-medium">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept averages + radar */}
      <div className="grid grid-cols-3 gap-4">
        {/* Department averages */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Avg Score by Department</h2>
          <div className="space-y-3">
            {deptData.sort((a, b) => b.avg - a.avg).map((d) => (
              <div key={d.dept} className="flex items-center gap-3">
                <div className="w-24 text-sm text-slate-600">{d.dept}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${(d.avg / 5) * 100}%`, background: d.color }}
                  />
                </div>
                <div className="w-10 text-right text-sm font-semibold text-slate-700">{d.avg}</div>
                <div className="text-xs text-slate-400 w-12">{d.count} emp{d.count !== 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Avg Skill Profile</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: top performers + activity */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top performers */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Top Performers</h2>
            <Link to="/employees" className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topEmployees.map((emp, i) => (
              <Link key={emp.id} to={`/employees/${emp.id}`} className="flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div className="w-5 text-xs font-bold text-slate-400">#{i + 1}</div>
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {emp.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{emp.name}</div>
                  <div className="text-xs text-slate-400 truncate">{emp.role} · {emp.department}</div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon trend={emp.trend} />
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${getScoreBg(emp.score)}`}>
                    {emp.score}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium h-fit mt-0.5 ${activityColors[item.type]}`}>
                  {item.type}
                </span>
                <div>
                  <div className="text-sm text-slate-700">{item.text}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
