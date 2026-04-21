import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../../api/client';

export default function Overview() {
  const [stats, setStats] = useState({ expenseSum: 0, loanPending: 0, posts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [expRes, loanRes, postRes] = await Promise.all([
          client.get('/expenses'),
          client.get('/loans'),
          client.get('/posts'),
        ]);
        if (cancelled) return;
        const expenses = expRes.data;
        const loans = loanRes.data;
        const expenseSum = expenses.reduce((s, e) => s + (e.amount || 0), 0);
        const loanPending = loans.filter((l) => l.status === 'pending').length;
        setStats({
          expenseSum,
          loanPending,
          posts: postRes.data.length,
        });
      } catch {
        if (!cancelled) setStats({ expenseSum: 0, loanPending: 0, posts: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: 'Total recorded expenses',
      value: loading ? '—' : `$${stats.expenseSum.toFixed(2)}`,
      hint: 'Across all categories',
      to: '/dashboard/expenses',
    },
    {
      title: 'Active loans',
      value: loading ? '—' : String(stats.loanPending),
      hint: 'Pending repayment or collection',
      to: '/dashboard/loans',
    },
    {
      title: 'Forum posts',
      value: loading ? '—' : String(stats.posts),
      hint: 'Community discussions',
      to: '/dashboard/forum',
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          A quick snapshot of your spending, loans, and forum activity. Use the sidebar to dive
          deeper into each area.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={c.to}
              className="block h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {c.title}
              </p>
              <p className="mt-3 font-display text-3xl font-bold text-ink-900">{c.value}</p>
              <p className="mt-2 text-sm text-slate-500">{c.hint}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700">
                Open section →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
