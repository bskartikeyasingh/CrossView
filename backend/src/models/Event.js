const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    country: {
      type: String,
      default: 'global',
    },
    articleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
    sourceCount: {
      type: Number,
      default: 1,
    },
    firstReportedAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastUpdatedAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'developing', 'resolved', 'archived'],
      default: 'active',
      index: true,
    },
    confidenceScore: {
      type: Number,
      default: 0.85,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ title: 'text', summary: 'text' });

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
