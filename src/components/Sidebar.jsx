import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Target, BarChart2, Bell } from 'lucide-react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen fixed left-0 top-0 z-10">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">PerfDash</div>
            <div className="text-slate-400 text-xs">Performance Tracker</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer">
          <Bell size={18} />
          <span className="text-sm font-medium">Notifications</span>
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">SK</div>
          <div>
            <div className="text-sm font-medium text-white">Sarah Kim</div>
            <div className="text-xs text-slate-400">CEO</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
