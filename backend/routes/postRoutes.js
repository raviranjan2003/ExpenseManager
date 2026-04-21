const express = require('express');
const { body, param } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', protect, getPosts);

router.get(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid post id')],
  validate,
  getPost
);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 10000 }),
  ],
  validate,
  createPost
);

router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid post id'),
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('content').optional().trim().notEmpty().isLength({ max: 10000 }),
  ],
  validate,
  updatePost
);

router.delete(
  '/:id',
  protect,
  [param('id').isMongoId().withMessage('Invalid post id')],
  validate,
  deletePost
);

router.post(
  '/:id/like',
  protect,
  [param('id').isMongoId().withMessage('Invalid post id')],
  validate,
  toggleLike
);

module.exports = router;
