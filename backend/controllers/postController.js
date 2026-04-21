const Post = require('../models/Post');
const Comment = require('../models/Comment');

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name email')
      .populate('likes', 'name')
      .sort({ createdAt: -1 })
      .lean();

    const userId = req.user?._id?.toString();
    const result = posts.map((p) => {
      const likes = p.likes || [];
      return {
        ...p,
        likeCount: likes.length,
        likedByMe: userId
          ? likes.some((id) => id.toString() === userId)
          : false,
        likes: undefined,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name email')
      .populate('likes', 'name');

    if (!post) {
      res.status(404);
      return next(new Error('Post not found'));
    }

    const userId = req.user?._id?.toString();
    const obj = post.toObject();
    const likeIds = post.likes.map((id) => id.toString());
    obj.likeCount = post.likes.length;
    obj.likedByMe = userId ? likeIds.includes(userId) : false;
    delete obj.likes;

    res.json(obj);
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      user: req.user._id,
    });
    const populated = await Post.findById(post._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!post) {
      res.status(404);
      return next(new Error('Post not found or not authorized'));
    }
    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;
    await post.save();
    const populated = await Post.findById(post._id).populate('user', 'name email');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!post) {
      res.status(404);
      return next(new Error('Post not found or not authorized'));
    }
    await Comment.deleteMany({ post: post._id });
    res.json({ message: 'Post removed' });
  } catch (err) {
    next(err);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      return next(new Error('Post not found'));
    }
    const uid = req.user._id;
    const idx = post.likes.findIndex((id) => id.equals(uid));
    if (idx >= 0) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(uid);
    }
    await post.save();
    res.json({
      likeCount: post.likes.length,
      liked: idx < 0,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
};
