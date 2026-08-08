const mongoose = require('mongoose');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

const getRelatedUserIds = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const records = await FriendRequest.find({
    status: { $in: ['pending', 'accepted'] },
    $or: [{ from: uid }, { to: uid }],
  }).select('from to status');

  const friendIds = new Set();
  const pendingIds = new Set();

  records.forEach((r) => {
    const other =
      r.from.toString() === userId.toString() ? r.to.toString() : r.from.toString();
    if (r.status === 'accepted') {
      friendIds.add(other);
    } else if (r.status === 'pending') {
      pendingIds.add(other);
    }
  });

  return { friendIds: [...friendIds], pendingIds: [...pendingIds] };
};

const getFriends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const accepted = await FriendRequest.find({
      status: 'accepted',
      $or: [{ from: userId }, { to: userId }],
    })
      .populate('from', 'name email')
      .populate('to', 'name email')
      .sort({ updatedAt: -1 });

    const friends = accepted.map((r) => {
      const friend =
        r.from._id.toString() === userId.toString() ? r.to : r.from;
      return {
        friendshipId: r._id,
        ...formatUser(friend),
        friendsSince: r.updatedAt,
      };
    });

    res.json(friends);
  } catch (err) {
    next(err);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const incoming = await FriendRequest.find({
      to: userId,
      status: 'pending',
    })
      .populate('from', 'name email')
      .sort({ createdAt: -1 });

    const outgoing = await FriendRequest.find({
      from: userId,
      status: 'pending',
    })
      .populate('to', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      incoming: incoming.map((r) => ({
        requestId: r._id,
        user: formatUser(r.from),
        createdAt: r.createdAt,
      })),
      outgoing: outgoing.map((r) => ({
        requestId: r._id,
        user: formatUser(r.to),
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const getDiscover = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { friendIds, pendingIds } = await getRelatedUserIds(userId);

    const exclude = [
      new mongoose.Types.ObjectId(userId),
      ...friendIds.map((id) => new mongoose.Types.ObjectId(id)),
      ...pendingIds.map((id) => new mongoose.Types.ObjectId(id)),
    ];

    const users = await User.find({ _id: { $nin: exclude } })
      .select('name email')
      .sort({ name: 1 })
      .limit(50);

    res.json(users.map(formatUser));
  } catch (err) {
    next(err);
  }
};

const sendRequest = async (req, res, next) => {
  try {
    const fromId = req.user._id;
    const toId = req.params.userId;

    if (fromId.toString() === toId) {
      res.status(400);
      return next(new Error('You cannot send a friend request to yourself'));
    }

    const target = await User.findById(toId);
    if (!target) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const existing = await FriendRequest.findOne({
      $or: [
        { from: fromId, to: toId },
        { from: toId, to: fromId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        res.status(400);
        return next(new Error('You are already friends'));
      }
      if (existing.status === 'pending') {
        if (existing.from.toString() === fromId.toString()) {
          res.status(400);
          return next(new Error('Friend request already sent'));
        }
        existing.status = 'accepted';
        await existing.save();
        const populated = await FriendRequest.findById(existing._id)
          .populate('from', 'name email')
          .populate('to', 'name email');
        const friend =
          populated.from._id.toString() === fromId.toString()
            ? populated.to
            : populated.from;
        return res.status(200).json({
          message: 'Friend request accepted automatically',
          friend: formatUser(friend),
        });
      }
      existing.status = 'pending';
      existing.from = fromId;
      existing.to = toId;
      await existing.save();
      const populated = await existing.populate('to', 'name email');
      return res.status(201).json({
        requestId: populated._id,
        user: formatUser(populated.to),
      });
    }

    const request = await FriendRequest.create({
      from: fromId,
      to: toId,
      status: 'pending',
    });
    const populated = await request.populate('to', 'name email');
    res.status(201).json({
      requestId: populated._id,
      user: formatUser(populated.to),
    });
  } catch (err) {
    next(err);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const request = await FriendRequest.findOne({
      _id: req.params.id,
      to: req.user._id,
      status: 'pending',
    }).populate('from', 'name email');

    if (!request) {
      res.status(404);
      return next(new Error('Friend request not found'));
    }

    request.status = 'accepted';
    await request.save();

    res.json({
      friendshipId: request._id,
      friend: formatUser(request.from),
    });
  } catch (err) {
    next(err);
  }
};

const cancelOrDeclineRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const request = await FriendRequest.findOne({
      _id: req.params.id,
      status: 'pending',
      $or: [{ from: userId }, { to: userId }],
    });

    if (!request) {
      res.status(404);
      return next(new Error('Friend request not found'));
    }

    await request.deleteOne();
    res.json({ message: 'Friend request removed' });
  } catch (err) {
    next(err);
  }
};

const removeFriend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const friendId = req.params.userId;

    const friendship = await FriendRequest.findOne({
      status: 'accepted',
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    });

    if (!friendship) {
      res.status(404);
      return next(new Error('Friendship not found'));
    }

    await friendship.deleteOne();
    res.json({ message: 'Friend removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFriends,
  getRequests,
  getDiscover,
  sendRequest,
  acceptRequest,
  cancelOrDeclineRequest,
  removeFriend,
};
