import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { validateAmount, validateRequired } from '../../utils/validation.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Utilities',
  'Health',
  'Other',
];

const emptyForm = {
  title: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().slice(0, 10),
  description: '',
};

export default function Expenses() {
  const [items, setItems] = useState([]);
  const [overview, setOverview] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, ovRes] = await Promise.all([
        client.get('/expenses'),
        client.get('/expenses/overview?months=6'),
      ]);
      setItems(expRes.data);
      setOverview(ovRes.data);
    } catch (err) {
      toast.error(err.displayMessage || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = useMemo(
    () => ({
      labels: overview.labels,
      datasets: [
        {
          label: 'Spending',
          data: overview.data,
          backgroundColor: 'rgba(13, 148, 136, 0.75)',
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }),
    [overview]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Monthly overview',
          font: { family: 'Outfit', size: 14, weight: '600' },
          color: '#0f172a',
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', maxRotation: 45 },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.25)' },
          ticks: { color: '#64748b' },
        },
      },
    }),
    []
  );

  const validateForm = () => {
    const err = {};
    const t = validateRequired(form.title, 'Title');
    if (t) err.title = t;
    const a = validateAmount(form.amount);
    if (a) err.amount = a;
    if (!form.category) err.category = 'Pick a category';
    if (!form.date) err.date = 'Date is required';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Fix the highlighted fields');
      return;
    }
    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: new Date(form.date).toISOString(),
      description: (form.description || '').trim(),
    };
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await client.put(`/expenses/${editingId}`, payload);
        setItems((prev) => prev.map((x) => (x._id === editingId ? data : x)));
        toast.success('Expense updated');
      } else {
        const { data } = await client.post('/expenses', payload);
        setItems((prev) => [data, ...prev]);
        toast.success('Expense added');
      }
      setForm(emptyForm);
      setEditingId(null);
      const ov = await client.get('/expenses/overview?months=6');
      setOverview(ov.data);
    } catch (err) {
      toast.error(err.displayMessage || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row._id);
    setForm({
      title: row.title,
      amount: String(row.amount),
      category: row.category,
      date: row.date.slice(0, 10),
      description: row.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await client.delete(`/expenses/${id}`);
      setItems((prev) => prev.filter((x) => x._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      toast.success('Deleted');
      const ov = await client.get('/expenses/overview?months=6');
      setOverview(ov.data);
    } catch (err) {
      toast.error(err.displayMessage || 'Delete failed');
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-ink-900">Expense tracker</h1>
        <p className="mt-2 text-slate-600">
          Log spending with categories and review a six-month bar chart for trends.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {editingId ? 'Edit expense' : 'Add expense'}
          </h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                />
                {fieldErrors.amount && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.amount}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                />
                {fieldErrors.date && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Notes</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add expense'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
          <h2 className="px-2 font-display text-lg font-semibold text-ink-900">Monthly chart</h2>
          <div className="mt-4 h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading chart…
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-display text-lg font-semibold text-ink-900">Recent expenses</h2>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No expenses yet. Add your first entry above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {items.map((row) => (
                    <motion.tr
                      key={row._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td className="px-4 py-3 font-medium text-ink-900">{row.title}</td>
                      <td className="px-4 py-3 text-slate-600">{row.category}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink-900">
                        ${Number(row.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="mr-2 text-xs font-semibold text-brand-700 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(row._id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
