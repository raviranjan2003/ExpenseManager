import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation.js';

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const err = {};
    const n = validateRequired(name, 'Name');
    if (n) err.name = n;
    if (!validateEmail(email)) err.email = 'Enter a valid email';
    const p = validatePassword(password);
    if (p) err.password = p;
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success('Welcome aboard!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.displayMessage || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50/50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-soft"
      >
        <div className="text-center">
          <Link to="/" className="font-display text-xl font-bold text-ink-900">
            EduFinance
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none ring-brand-500/30 transition focus:border-brand-400 focus:bg-white focus:ring-2"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none ring-brand-500/30 transition focus:border-brand-400 focus:bg-white focus:ring-2"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none ring-brand-500/30 transition focus:border-brand-400 focus:bg-white focus:ring-2"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
