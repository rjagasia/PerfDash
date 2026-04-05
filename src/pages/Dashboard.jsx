import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Users, BarChart2, AlertTriangle, ChevronRight, MessageSquare, RefreshCw } from 'lucide-react';
import { teamLeads, tierColors, isAtRisk } from '../data/strategists';

const totalStrategists = teamLeads.reduce((a, tl) => a + tl.strategists.length, 0);
const totalCases = teamLeads.reduce((a, tl) => a + (tl.totalCases || 0), 0);
const atRiskCount = teamLeads.flatMap((tl) => tl.strategists).filter(isAtRisk).length;
const ratedCount = teamLeads.filter((tl) => tl.performanceRating !== null).length;

const casesByTL = teamLeads.map((tl) => ({
  name: tl.name,
  cases: tl.totalCases || 0,
  color: tierColors[tl.tier].dot,
}));

const tierDist = Object.entries(
  teamLeads.reduce((acc, tl) => {
    acc[tl.tier] = (acc[tl.tier] || 0) + 1;
    return acc;
  }, {})
).map(([tier, count]) => ({ tier, count, color: tierColors[tier].dot }));

function KPICard({ title, value, sub, icon: Icon, iconBg }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-sm">
        <div className="font-medium text-slate-700">{label}</div>
        <div className="text-indigo-600">{payload[0].value} cases</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [slackData, setSlackData] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}slack-data.json`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setSlackData(d))
      .catch(() => {});
  }, []);

  const atRiskMembers = teamLeads.flatMap((tl) =>
    tl.strategists.filter(isAtRisk).map((s) => ({ ...s, teamLead: tl }))
  );

  const slackConfigured = slackData && Object.keys(slackData.strategists || {}).length > 0;
  const totalMessages7d = slackConfigured
    ? Object.values(slackData.strategists).reduce((a, s) => a + (s.messagesLast7Days || 0), 0)
    : null;
  const lastSynced = slackData?.lastUpdated
    ? new Date(slackData.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">2026 · Team overview for Ria</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Team Leads"
          value={teamLeads.length}
          sub="Your direct reports"
          icon={Users}
          iconBg="bg-indigo-500"
        />
        <KPICard
          title="Total Strategists"
          value={totalStrategists}
          sub="Across all pods"
          icon={Users}
          iconBg="bg-teal-500"
        />
        <KPICard
          title="Total Cases"
          value={totalCases.toLocaleString()}
          sub="2026 capacity across team"
          icon={BarChart2}
          iconBg="bg-blue-500"
        />
        <KPICard
          title="At-Risk Strategists"
          value={atRiskCount}
          sub="Flagged in pod notes"
          icon={AlertTriangle}
          iconBg={atRiskCount > 0 ? 'bg-rose-500' : 'bg-slate-400'}
        />
      </div>

      {/* PR Rating banner */}
      {ratedCount < teamLeads.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <span className="text-sm text-amber-800">
            <strong>2026 PR ratings not yet entered</strong> — click any team lead to add their performance rating.
          </span>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Cases by team lead */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">2026 Cases by Team Lead</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={casesByTL} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cases" radius={[6, 6, 0, 0]}>
                {casesByTL.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Team Lead Tiers</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={tierDist} dataKey="count" nameKey="tier" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                {tierDist.map((d) => (
                  <Cell key={d.tier} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [`${v}`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {tierDist.map((d) => (
              <div key={d.tier} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="flex-1">{d.tier}</span>
                <span className="font-semibold">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team leads summary + at-risk */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team leads list */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Team Leads</h2>
            <Link to="/team" className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {teamLeads.map((tl) => {
              const tc = tierColors[tl.tier];
              const atRisk = tl.strategists.filter(isAtRisk).length;
              return (
                <Link
                  key={tl.id}
                  to={`/team/${tl.id}`}
                  className="flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {tl.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{tl.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tc.bg} ${tc.text}`}>
                        {tl.tier}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {tl.strategists.length} strategists · {tl.totalCases ?? '—'} cases
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {atRisk > 0 && (
                      <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full font-medium">
                        {atRisk} at risk
                      </span>
                    )}
                    {tl.performanceRating ? (
                      <span className="text-sm font-bold text-indigo-600">{tl.performanceRating}</span>
                    ) : (
                      <span className="text-xs text-slate-300">PR: —</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* At-risk strategists */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            At-Risk Strategists
            {atRiskCount > 0 && (
              <span className="ml-2 bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {atRiskCount}
              </span>
            )}
          </h2>
          {atRiskMembers.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">No at-risk strategists flagged.</div>
          ) : (
            <div className="space-y-3">
              {atRiskMembers.map((s, i) => (
                <Link
                  key={i}
                  to={`/team/${s.teamLead.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors"
                >
                  <AlertTriangle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{s.name}</div>
                    <div className="text-xs text-slate-500">Pod: {s.teamLead.name} · Cap: {s.capacity}</div>
                    <div className="text-xs text-rose-600 mt-0.5">{s.notes}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Slack activity summary */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {slackConfigured ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <MessageSquare size={13} />
                  <span><strong>{totalMessages7d}</strong> messages across student channels (last 7d)</span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <RefreshCw size={11} /> {lastSynced}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MessageSquare size={13} />
                <span>Slack sync not configured — see setup instructions in repo.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
