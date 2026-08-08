const express = require('express');
const { param } = require('express-validator');
const {
  getFriends,
  getRequests,
  getDiscover,
  sendRequest,
  acceptRequest,
  cancelOrDeclineRequest,
  removeFriend,
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/', getFriends);
router.get('/requests', getRequests);
router.get('/discover', getDiscover);

router.post(
  '/request/:userId',
  [param('userId').isMongoId().withMessage('Invalid user id')],
  validate,
  sendRequest
);

router.post(
  '/requests/:id/accept',
  [param('id').isMongoId().withMessage('Invalid request id')],
  validate,
  acceptRequest
);

router.delete(
  '/requests/:id',
  [param('id').isMongoId().withMessage('Invalid request id')],
  validate,
  cancelOrDeclineRequest
);

router.delete(
  '/:userId',
  [param('userId').isMongoId().withMessage('Invalid user id')],
  validate,
  removeFriend
);

module.exports = router;
