const express = require('express');
const { body, param } = require('express-validator');
const {
  getComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get(
  '/',
  [param('postId').isMongoId().withMessage('Invalid post id')],
  validate,
  getComments
);

router.post(
  '/',
  [
    param('postId').isMongoId().withMessage('Invalid post id'),
    body('content').trim().notEmpty().withMessage('Comment is required').isLength({ max: 2000 }),
  ],
  validate,
  createComment
);

module.exports = router;
