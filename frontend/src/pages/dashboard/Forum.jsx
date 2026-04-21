import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateRequired } from '../../utils/validation.js';

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/posts');
      setPosts(data);
    } catch (err) {
      toast.error(err.displayMessage || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const validate = () => {
    const err = {};
    const t = validateRequired(title, 'Title');
    if (t) err.title = t;
    const c = validateRequired(content, 'Content');
    if (c) err.content = c;
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Fix the highlighted fields');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await client.post('/posts', {
        title: title.trim(),
        content: content.trim(),
      });
      setPosts((prev) => [
        {
          ...data,
          likeCount: Array.isArray(data.likes) ? data.likes.length : 0,
          likedByMe: false,
        },
        ...prev,
      ]);
      setTitle('');
      setContent('');
      toast.success('Post published');
    } catch (err) {
      toast.error(err.displayMessage || 'Could not create post');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const { data } = await client.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likeCount: data.likeCount, likedByMe: data.liked }
            : p
        )
      );
    } catch (err) {
      toast.error(err.displayMessage || 'Like failed');
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-ink-900">Community forum</h1>
        <p className="mt-2 text-slate-600">
          Share tips, ask questions, and upvote helpful threads from other students.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-display text-lg font-semibold text-ink-900">New discussion</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Content</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            />
            {fieldErrors.content && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.content}</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {submitting ? 'Publishing…' : 'Publish post'}
        </button>
      </motion.form>

      <div className="mt-10 space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink-900">Recent threads</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading posts…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-500">No posts yet. Start the conversation above.</p>
        ) : (
          posts.map((p, i) => (
            <motion.article
              key={p._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link
                    to={`/dashboard/forum/${p._id}`}
                    className="font-display text-lg font-semibold text-ink-900 hover:text-brand-700"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.content}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {p.user?.name || 'Member'} · {new Date(p.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLike(p._id)}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                      p.likedByMe
                        ? 'border-brand-500 bg-brand-50 text-brand-800'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200',
                    ].join(' ')}
                  >
                    ▲ {p.likeCount ?? 0}
                  </button>
                  {user?.id && String(p.user?._id) === String(user.id) && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Delete this post?')) return;
                        try {
                          await client.delete(`/posts/${p._id}`);
                          setPosts((prev) => prev.filter((x) => x._id !== p._id));
                          toast.success('Post removed');
                        } catch (err) {
                          toast.error(err.displayMessage || 'Delete failed');
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
}
