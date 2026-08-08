import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import client from '../../api/client';
import ProfileAvatar from '../../components/ProfileAvatar.jsx';

function UserCard({ user, children }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex min-w-0 items-center gap-3">
        <ProfileAvatar name={user.name} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{children}</div>
    </motion.div>
  );
}

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes, discoverRes] = await Promise.all([
        client.get('/friends'),
        client.get('/friends/requests'),
        client.get('/friends/discover'),
      ]);
      setFriends(friendsRes.data);
      setIncoming(requestsRes.data.incoming || []);
      setOutgoing(requestsRes.data.outgoing || []);
      setDiscover(discoverRes.data);
    } catch (err) {
      toast.error(err.displayMessage || 'Failed to load friends data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const acceptRequest = async (requestId) => {
    setActionId(requestId);
    try {
      const { data } = await client.post(`/friends/requests/${requestId}/accept`);
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
      setFriends((prev) => [
        {
          friendshipId: data.friendshipId,
          id: data.friend.id,
          name: data.friend.name,
          email: data.friend.email,
        },
        ...prev,
      ]);
      toast.success(`You are now friends with ${data.friend.name}`);
    } catch (err) {
      toast.error(err.displayMessage || 'Could not accept request');
    } finally {
      setActionId(null);
    }
  };

  const cancelRequest = async (requestId) => {
    setActionId(requestId);
    try {
      await client.delete(`/friends/requests/${requestId}`);
      setIncoming((prev) => prev.filter((r) => r.requestId !== requestId));
      setOutgoing((prev) => prev.filter((r) => r.requestId !== requestId));
      await load();
      toast.success('Request cancelled');
    } catch (err) {
      toast.error(err.displayMessage || 'Could not cancel request');
    } finally {
      setActionId(null);
    }
  };

  const sendRequest = async (userId) => {
    setActionId(userId);
    try {
      await client.post(`/friends/request/${userId}`);
      setDiscover((prev) => prev.filter((u) => u.id !== userId));
      await load();
      toast.success('Friend request sent');
    } catch (err) {
      toast.error(err.displayMessage || 'Could not send request');
    } finally {
      setActionId(null);
    }
  };

  const removeFriend = async (userId) => {
    if (!window.confirm('Remove this friend?')) return;
    setActionId(userId);
    try {
      await client.delete(`/friends/${userId}`);
      setFriends((prev) => prev.filter((f) => f.id !== userId));
      await load();
      toast.success('Friend removed');
    } catch (err) {
      toast.error(err.displayMessage || 'Could not remove friend');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-ink-900">Friends</h1>
        <p className="mt-2 text-slate-600">
          Manage your friends, respond to requests, and discover new people on campus.
        </p>
      </motion.div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          Friend requests
          {incoming.length > 0 && (
            <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
              {incoming.length}
            </span>
          )}
        </h2>
        {incoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No pending friend requests.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {incoming.map((req) => (
              <UserCard key={req.requestId} user={req.user}>
                <button
                  type="button"
                  disabled={actionId === req.requestId}
                  onClick={() => acceptRequest(req.requestId)}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={actionId === req.requestId}
                  onClick={() => cancelRequest(req.requestId)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </UserCard>
            ))}
          </div>
        )}
      </section>

      {outgoing.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink-900">Sent requests</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {outgoing.map((req) => (
              <UserCard key={req.requestId} user={req.user}>
                <span className="text-xs font-medium text-amber-700">Pending</span>
                <button
                  type="button"
                  disabled={actionId === req.requestId}
                  onClick={() => cancelRequest(req.requestId)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </UserCard>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink-900">My friends</h2>
        {friends.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">You have no friends yet. Send a request below.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {friends.map((friend) => (
              <UserCard key={friend.id} user={friend}>
                <button
                  type="button"
                  disabled={actionId === friend.id}
                  onClick={() => removeFriend(friend.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  Remove
                </button>
              </UserCard>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink-900">New people</h2>
        <p className="mt-1 text-sm text-slate-500">
          Students you can connect with — not yet friends and no pending request.
        </p>
        {discover.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No new people to show right now.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {discover.map((person) => (
              <UserCard key={person.id} user={person}>
                <button
                  type="button"
                  disabled={actionId === person.id}
                  onClick={() => sendRequest(person.id)}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
                >
                  Add friend
                </button>
              </UserCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
