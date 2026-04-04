import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { ArrowLeft, Mail, Calendar, User, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, Clock, Circle } from 'lucide-react';
import { getEmployeeById, getScoreBg } from '../data/employees';

function TrendIcon({ trend }) {
  if (trend === 'up') return <ArrowUpRight size={16} className="text-green-500" />;
  if (trend === 'down') return <ArrowDownRight size={16} className="text-red-500" />;
  return <Minus size={16} className="text-slate-400" />;
}

function GoalStatusIcon({ status }) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-green-500" />;
  if (status === 'in_progress') return <Clock size={16} className="text-indigo-400" />;
  return <Circle size={16} className="text-slate-300" />;
}

function MetricBar({ label, value }) {
  const color = value >= 90 ? 'bg-green-500' : value >= 80 ? 'bg-indigo-500' : value >= 70 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-sm text-slate-600">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <div className="w-8 text-right text-sm font-semibold text-slate-700">{value}</div>
    </div>
  );
}

const StarRating = ({ score }) => {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"
          fill={i <= full ? '#f59e0b' : (i === full + 1 && half) ? '#fcd34d' : '#e2e8f0'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold text-slate-700">{score}</span>
    </div>
  );
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = getEmployeeById(id);

  if (!emp) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-400 text-lg">Employee not found.</div>
        <Link to="/employees" className="text-indigo-600 hover:underline mt-2 inline-block">Back to list</Link>
      </div>
    );
  }

  const reviewChartData = emp.reviews.map((r) => ({ period: r.period, score: r.score }));

  const radarData = [
    { metric: 'Quality', value: emp.metrics.quality },
    { metric: 'Velocity', value: emp.metrics.velocity },
    { metric: 'Collab', value: emp.metrics.collaboration },
    { metric: 'Initiative', value: emp.metrics.initiative },
  ];

  const tenureMs = new Date('2026-04-04') - new Date(emp.hireDate);
  const tenureYears = Math.floor(tenureMs / (1000 * 60 * 60 * 24 * 365));
  const tenureMonths = Math.floor((tenureMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

  const completedGoals = emp.goals.filter((g) => g.status === 'completed').length;

  const isReviewSoon = (() => {
    const next = new Date(emp.nextReview);
    const now = new Date('2026-04-04');
    return (next - now) / (1000 * 60 * 60 * 24) <= 30;
  })();

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back + Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 text-xl font-bold flex items-center justify-center flex-shrink-0">
            {emp.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{emp.name}</h1>
                <div className="text-slate-500 text-sm mt-0.5">{emp.role} · {emp.department}</div>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon trend={emp.trend} />
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreBg(emp.score)}`}>
                  {emp.score} / 5.0
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Mail size={14} />
                <a href={`mailto:${emp.email}`} className="hover:text-indigo-600">{emp.email}</a>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>Reports to <Link to={`/employees`} className="text-indigo-600 hover:underline">{emp.manager}</Link></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Joined {emp.hireDate} ({tenureYears > 0 ? `${tenureYears}y ` : ''}{tenureMonths}m tenure)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{emp.reviews.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Reviews completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{completedGoals}/{emp.goals.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Goals achieved</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${isReviewSoon ? 'text-rose-600' : 'text-slate-800'}`}>
              {emp.nextReview}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Next review{isReviewSoon ? ' ⚡ soon' : ''}
            </div>
          </div>
          <div className="text-center">
            <StarRating score={emp.score} />
            <div className="text-xs text-slate-400 mt-0.5">Current rating</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Score history */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Performance Score History</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={reviewChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(v) => [v, 'Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skill radar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Skill Profile</h2>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Competency Scores</h2>
        <div className="space-y-3">
          <MetricBar label="Quality" value={emp.metrics.quality} />
          <MetricBar label="Velocity" value={emp.metrics.velocity} />
          <MetricBar label="Collaboration" value={emp.metrics.collaboration} />
          <MetricBar label="Initiative" value={emp.metrics.initiative} />
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Goals</h2>
        <div className="space-y-3">
          {emp.goals.map((goal) => (
            <div key={goal.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <GoalStatusIcon status={goal.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-slate-700">{goal.title}</div>
                  <div className="text-xs text-slate-400 flex-shrink-0">Due {goal.dueDate}</div>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{goal.progress}%</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    goal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {goal.status === 'completed' ? 'Completed' : 'In progress'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review history */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Review History</h2>
        <div className="space-y-3">
          {[...emp.reviews].reverse().map((review, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-center flex-shrink-0">
                <div className="text-lg font-bold text-indigo-600">{review.score}</div>
                <div className="text-xs text-slate-400">/ 5.0</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">{review.period}</div>
                  <div className="text-xs text-slate-400">Reviewed by {review.reviewer}</div>
                </div>
                <div className="text-sm text-slate-600 mt-1">{review.notes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
