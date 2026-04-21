import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { validateAmount, validateRequired } from '../../utils/validation.js';

const emptyForm = {
  title: '',
  amount: '',
  type: 'borrowed',
  status: 'pending',
  dueDate: '',
  description: '',
};

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/loans');
      setLoans(data);
    } catch (err) {
      toast.error(err.displayMessage || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const validateForm = () => {
    const err = {};
    const t = validateRequired(form.title, 'Title');
    if (t) err.title = t;
    const a = validateAmount(form.amount);
    if (a) err.amount = a;
    if (!form.dueDate) err.dueDate = 'Due date is required';
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
      type: form.type,
      status: form.status,
      dueDate: new Date(form.dueDate).toISOString(),
      description: (form.description || '').trim(),
    };
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await client.put(`/loans/${editingId}`, payload);
        setLoans((prev) => prev.map((x) => (x._id === editingId ? data : x)));
        toast.success('Loan updated');
      } else {
        const { data } = await client.post('/loans', payload);
        setLoans((prev) => [...prev, data].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
        toast.success('Loan added');
      }
      setForm(emptyForm);
      setEditingId(null);
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
      type: row.type,
      status: row.status,
      dueDate: row.dueDate.slice(0, 10),
      description: row.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this loan record?')) return;
    try {
      await client.delete(`/loans/${id}`);
      setLoans((prev) => prev.filter((x) => x._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.displayMessage || 'Delete failed');
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-ink-900">Loan manager</h1>
        <p className="mt-2 text-slate-600">
          Track money you borrowed or lent, mark paid vs pending, and watch due dates.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {editingId ? 'Edit loan' : 'Add loan'}
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
                <label className="text-xs font-semibold uppercase text-slate-500">Due date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                />
                {fieldErrors.dueDate && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.dueDate}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="borrowed">Borrowed</option>
                  <option value="lent">Lent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
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
              {saving ? 'Saving…' : editingId ? 'Update' : 'Add loan'}
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

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-display text-lg font-semibold text-ink-900">Your loans</h2>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading…</p>
          ) : loans.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No loans yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              <AnimatePresence>
                {loans.map((row) => (
                  <motion.li
                    key={row._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-ink-900">{row.title}</p>
                      <p className="text-xs text-slate-500">
                        Due {new Date(row.dueDate).toLocaleDateString()} ·{' '}
                        <span className="capitalize">{row.type}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={[
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          row.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800',
                        ].join(' ')}
                      >
                        {row.status}
                      </span>
                      <span className="text-sm font-bold text-ink-900">
                        ${Number(row.amount).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="text-xs font-semibold text-brand-700 hover:underline"
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
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
