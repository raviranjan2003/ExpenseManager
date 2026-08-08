const mongoose = require('mongoose');

const STATUSES = ['pending', 'accepted', 'declined'];

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be pending, accepted, or declined',
      },
      default: 'pending',
    },
  },
  { timestamps: true }
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
friendRequestSchema.index({ to: 1, status: 1 });
friendRequestSchema.index({ from: 1, status: 1 });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
module.exports.STATUSES = STATUSES;
