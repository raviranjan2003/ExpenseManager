import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateRequired } from '../../utils/validation.js';

export default function ForumPost() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        client.get(`/posts/${id}`),
        client.get(`/posts/${id}/comments`),
      ]);
      setPost(pRes.data);
      setComments(cRes.data);
    } catch (err) {
      toast.error(err.displayMessage || 'Failed to load thread');
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async () => {
    try {
      const { data } = await client.post(`/posts/${id}/like`);
      setPost((prev) =>
        prev
          ? { ...prev, likeCount: data.likeCount, likedByMe: data.liked }
          : prev
      );
    } catch (err) {
      toast.error(err.displayMessage || 'Like failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const err = validateRequired(commentText, 'Comment');
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError('');
    setSubmitting(true);
    try {
      const { data } = await client.post(`/posts/${id}/comments`, {
        content: commentText.trim(),
      });
      setComments((prev) => [...prev, data]);
      setCommentText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.displayMessage || 'Could not comment');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await client.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment removed');
    } catch (err) {
      toast.error(err.displayMessage || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading thread…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">Post not found.</p>
        <Link to="/dashboard/forum" className="mt-4 inline-block text-sm font-semibold text-brand-700">
          ← Back to forum
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/dashboard/forum"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← Back to forum
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="font-display text-2xl font-bold text-ink-900">{post.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-slate-700">{post.content}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{post.user?.name}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleString()}</span>
        </div>
        <button
          type="button"
          onClick={toggleLike}
          className={[
            'mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
            post.likedByMe
              ? 'border-brand-500 bg-brand-50 text-brand-800'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200',
          ].join(' ')}
        >
          ▲ Upvote ({post.likeCount ?? 0})
        </button>
      </motion.article>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">Comments</h2>
        <form onSubmit={handleComment} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          />
          {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </form>

        <ul className="mt-6 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <li
                key={c._id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{c.content}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{c.user?.name}</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                {user?.id && String(c.user?._id) === String(user.id) && (
                  <button
                    type="button"
                    onClick={() => deleteComment(c._id)}
                    className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
