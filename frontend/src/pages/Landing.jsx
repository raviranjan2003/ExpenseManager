import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(45,212,191,0.35),transparent)]" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-bold tracking-tight">EduFinance</span>
        <div className="flex items-center gap-3">
          <Link
            to="/signin"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 shadow-soft transition hover:bg-brand-50"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
        <motion.div custom={0} initial="hidden" animate="show" variants={fade}>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
            Built for students
          </p>
        </motion.div>
        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl"
        >
          Your money,{' '}
          <span className="bg-gradient-to-r from-brand-300 to-emerald-200 bg-clip-text text-transparent">
            campus-ready
          </span>
          .
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-5 max-w-xl text-lg text-slate-400"
        >
          Track spending, manage loans, and learn from peers in a focused community forum—all in
          one calm, modern workspace.
        </motion.p>
        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            to="/signup"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-8 py-3.5 text-sm font-semibold text-ink-950 shadow-glow transition hover:bg-brand-400"
          >
            Create free account
          </Link>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            I already have an account
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fade}
          className="mt-20 grid gap-6 md:grid-cols-3"
        >
          {[
            {
              t: 'Expense intelligence',
              d: 'Categories, edits, and monthly charts so you see patterns before they snowball.',
            },
            {
              t: 'Loan clarity',
              d: 'Borrowed or lent, pending or paid—due dates stay visible on your timeline.',
            },
            {
              t: 'Peer forum',
              d: 'Posts, comments, and upvotes for real financial discussions among students.',
            },
          ].map((card) => (
            <div
              key={card.t}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
            >
              <h3 className="font-display text-lg font-semibold text-white">{card.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.d}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
