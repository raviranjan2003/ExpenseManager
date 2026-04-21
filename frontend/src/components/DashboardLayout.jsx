import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const nav = [
  { to: '/dashboard', end: true, label: 'Overview', icon: '◆' },
  { to: '/dashboard/expenses', label: 'Expenses', icon: '◇' },
  { to: '/dashboard/loans', label: 'Loans', icon: '◎' },
  { to: '/dashboard/forum', label: 'Forum', icon: '✦' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/40">
      <div className="mx-auto flex max-w-[1400px] gap-0 lg:gap-6">
        <motion.aside
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="sticky top-0 z-20 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white/90 px-4 py-6 backdrop-blur lg:flex"
        >
          <div className="mb-8 px-2">
            <p className="font-display text-lg font-bold tracking-tight text-ink-900">
              EduFinance
            </p>
            <p className="mt-1 text-xs text-slate-500">Student Finance Manager</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white shadow-glow'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                <span className="text-base opacity-90">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              Log out
            </button>
          </div>
        </motion.aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
            <span className="font-display font-bold text-ink-900">EduFinance</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-brand-700"
            >
              Log out
            </button>
          </header>
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200/80 bg-white/80 px-2 py-2 backdrop-blur lg:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold',
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-600',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
