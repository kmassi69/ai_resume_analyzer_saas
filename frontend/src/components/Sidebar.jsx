import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/history', label: 'Resume History', icon: '📁' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 min-h-[calc(100vh-56px)] p-4">
      <ul className="space-y-1">
        {navItems.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
