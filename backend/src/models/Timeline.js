const mongoose = require('mongoose');

const TimelineEntrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      required: true,
    },
    eventDate: {
      type: Date,
      default: null, // Distinguishes publication date from actual event occurrence date
    },
    sourceName: {
      type: String,
      default: '',
    },
    articleUrl: {
      type: String,
      default: '',
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
    category: {
      type: String,
      enum: ['first_report', 'official_statement', 'development', 'update', 'rebuttal', 'conclusion'],
      default: 'development',
    },
  },
  { _id: true }
);

const TimelineSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
      index: true,
    },
    entries: [TimelineEntrySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema);

