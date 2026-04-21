const Comment = require('../models/Comment');
const Post = require('../models/Post');

const getComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404);
      return next(new Error('Post not found'));
    }
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'name email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404);
      return next(new Error('Post not found'));
    }
    const comment = await Comment.create({
      post: req.params.postId,
      user: req.user._id,
      content: req.body.content,
    });
    const populated = await Comment.findById(comment._id).populate(
      'user',
      'name email'
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      res.status(404);
      return next(new Error('Comment not found'));
    }
    if (!comment.user.equals(req.user._id)) {
      res.status(403);
      return next(new Error('Not authorized to delete this comment'));
    }
    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, createComment, deleteComment };
