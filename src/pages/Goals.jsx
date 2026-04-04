import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, CheckCircle2, Clock, Circle, ChevronRight } from 'lucide-react';
import { employees } from '../data/employees';

const allGoals = employees.flatMap((emp) =>
  emp.goals.map((goal) => ({ ...goal, employee: emp }))
);

function GoalStatusIcon({ status }) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-green-500" />;
  if (status === 'in_progress') return <Clock size={16} className="text-indigo-400" />;
  return <Circle size={16} className="text-slate-300" />;
}

function ProgressBar({ progress, status }) {
  const color = status === 'completed' ? 'bg-green-500' : progress >= 75 ? 'bg-indigo-500' : progress >= 50 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{progress}%</span>
    </div>
  );
}

export default function Goals() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const totalGoals = allGoals.length;
  const completed = allGoals.filter((g) => g.status === 'completed').length;
  const inProgress = allGoals.filter((g) => g.status === 'in_progress').length;
  const avgProgress = Math.round(allGoals.reduce((a, g) => a + g.progress, 0) / totalGoals);

  const overdue = allGoals.filter((g) => {
    if (g.status === 'completed') return false;
    return new Date(g.dueDate) < new Date('2026-04-04');
  }).length;

  const departments = ['all', ...new Set(employees.map((e) => e.department))];

  const filtered = allGoals.filter((g) => {
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchDept = deptFilter === 'all' || g.employee.department === deptFilter;
    return matchStatus && matchDept;
  });

  const grouped = filtered.reduce((acc, g) => {
    const dept = g.employee.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Goals</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track progress across all employee goals</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Goals', value: totalGoals, color: 'bg-indigo-50 text-indigo-700', icon: Target },
          { label: 'Completed', value: completed, color: 'bg-green-50 text-green-700', icon: CheckCircle2 },
          { label: 'In Progress', value: inProgress, color: 'bg-blue-50 text-blue-700', icon: Clock },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'bg-amber-50 text-amber-700', icon: Target },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {overdue > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
          <strong>{overdue} goal{overdue !== 1 ? 's are' : ' is'} overdue</strong> — review and update employee goals.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        >
          {departments.map((d) => (
            <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
          ))}
        </select>
        <div className="ml-auto text-sm text-slate-500 self-center">{filtered.length} goals</div>
      </div>

      {/* Goals grouped by department */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([dept, goals]) => (
          <div key={dept} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">{dept}</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {goals.map((goal) => {
                const isOverdue = goal.status !== 'completed' && new Date(goal.dueDate) < new Date('2026-04-04');
                return (
                  <div key={`${goal.employee.id}-${goal.id}`} className="px-5 py-3.5 flex items-center gap-4">
                    <GoalStatusIcon status={goal.status} />
                    <div className="w-40 flex-shrink-0">
                      <Link to={`/employees/${goal.employee.id}`} className="flex items-center gap-2 hover:text-indigo-600 group">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {goal.employee.avatar}
                        </div>
                        <span className="text-sm text-slate-700 group-hover:text-indigo-600 truncate">{goal.employee.name}</span>
                      </Link>
                    </div>
                    <div className="flex-1 text-sm text-slate-700">{goal.title}</div>
                    <div className="w-40 flex-shrink-0">
                      <ProgressBar progress={goal.progress} status={goal.status} />
                    </div>
                    <div className={`text-xs flex-shrink-0 w-24 text-right ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                      {isOverdue ? '⚠ ' : ''}Due {goal.dueDate}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      goal.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {goal.status === 'completed' ? 'Done' : 'Active'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
