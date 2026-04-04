import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, AlertTriangle, MessageSquare, Send, Trash2, Users, BarChart2, Star } from 'lucide-react';
import { getTeamLeadById, tierColors, isAtRisk } from '../data/strategists';
import { useFeedback } from '../hooks/useFeedback';

function CapacityBar({ capacity }) {
  const pct = Math.min((capacity / 50) * 100, 100);
  const color = capacity >= 40 ? 'bg-indigo-500' : capacity >= 20 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-6 text-right">{capacity}</span>
    </div>
  );
}

function PRBadge({ pr }) {
  if (!pr) return <span className="text-xs text-slate-300 italic">Not set</span>;
  return <span className="text-sm font-bold text-indigo-600">{pr}</span>;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tl = getTeamLeadById(id);
  const { entries, addEntry, deleteEntry } = useFeedback(id);
  const [feedbackText, setFeedbackText] = useState('');
  const [prValue, setPrValue] = useState(tl?.performanceRating ?? '');
  const [showPrEdit, setShowPrEdit] = useState(false);

  if (!tl) {
    return (
      <div className="text-center py-20 text-slate-400">
        Team lead not found.
      </div>
    );
  }

  const tc = tierColors[tl.tier];
  const atRiskMembers = tl.strategists.filter(isAtRisk);
  const totalCap = tl.strategists.reduce((a, s) => a + s.capacity, 0);
  const avgCap = (totalCap / tl.strategists.length).toFixed(1);

  const handleFeedback = () => {
    if (!feedbackText.trim()) return;
    addEntry(feedbackText);
    setFeedbackText('');
  };

  return (
    <div className="space-y-5 max-w-4xl">
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
            {tl.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-800">{tl.name}</h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc.bg} ${tc.text}`}>
                    {tl.tier}
                  </span>
                </div>
                <div className="text-slate-500 text-sm mt-0.5">{tl.role} · Reports to Ria</div>
                <div className="text-xs text-slate-400 mt-1">{tl.responsibilities}</div>
              </div>

              {/* 2026 PR */}
              <div className="text-right">
                <div className="text-xs text-slate-400 mb-1">2026 Performance Rating</div>
                {showPrEdit ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prValue}
                      onChange={(e) => setPrValue(e.target.value)}
                      placeholder="e.g. Exceeds"
                      className="text-sm border border-slate-200 rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={() => setShowPrEdit(false)}
                      className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPrEdit(true)}
                    className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                  >
                    <Star size={14} className="text-amber-400" />
                    <PRBadge pr={prValue || tl.performanceRating} />
                    <span className="text-xs text-indigo-400 ml-1">edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-slate-400" />
                <div>
                  <div className="text-lg font-bold text-slate-800">{tl.strategists.length}</div>
                  <div className="text-xs text-slate-400">Strategists in pod</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-slate-400" />
                <div>
                  <div className="text-lg font-bold text-slate-800">{tl.totalCases ?? '—'}</div>
                  <div className="text-xs text-slate-400">Total cases</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-slate-400" />
                <div>
                  <div className="text-lg font-bold text-slate-800">{avgCap}</div>
                  <div className="text-xs text-slate-400">Avg capacity / strategist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* At-risk alert */}
      {atRiskMembers.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={15} className="text-rose-500" />
            <span className="text-sm font-semibold text-rose-700">At-risk strategists in this pod</span>
          </div>
          <div className="space-y-1">
            {atRiskMembers.map((s) => (
              <div key={s.name} className="text-sm text-rose-700">
                <strong>{s.name}</strong> — {s.notes}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pod roster */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Pod Roster — {tl.strategists.length} Strategists</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MessageSquare size={13} />
            <span>Slack activity — coming soon</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">2026 Capacity</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">2026 PR</th>
              <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</th>
            </tr>
          </thead>
          <tbody>
            {tl.strategists.map((s, i) => {
              const risk = isAtRisk(s);
              return (
                <tr key={i} className={`border-b border-slate-50 ${risk ? 'bg-rose-50' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {risk && <AlertTriangle size={13} className="text-rose-500 flex-shrink-0" />}
                      <span className="text-sm font-medium text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 w-40">
                    <CapacityBar capacity={s.capacity} />
                  </td>
                  <td className="px-5 py-3">
                    <PRBadge pr={s.pr} />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 max-w-xs">{s.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50">
              <td className="px-5 py-2.5 text-xs font-semibold text-slate-600">Total</td>
              <td className="px-5 py-2.5 text-xs font-semibold text-slate-800">{totalCap}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Manager Feedback */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Manager Feedback</h2>

        {/* Input */}
        <div className="flex gap-3">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleFeedback();
            }}
            placeholder={`Add feedback about ${tl.name}... (Cmd/Ctrl + Enter to submit)`}
            rows={3}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
          <button
            onClick={handleFeedback}
            disabled={!feedbackText.trim()}
            className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-start"
          >
            <Send size={15} />
            <span className="text-sm font-medium">Add</span>
          </button>
        </div>

        {/* Entries */}
        <div className="mt-4 space-y-3">
          {entries.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-6">
              No feedback yet — add your first note above.
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  RI
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 mb-1">{formatDate(entry.timestamp)}</div>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap">{entry.text}</div>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="flex-shrink-0 text-slate-300 hover:text-rose-400 transition-colors self-start"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
