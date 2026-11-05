const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['article', 'event', 'report'],
      required: true,
      default: 'event',
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsolidatedReport',
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
    },
    sourceCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({ firebaseUid: 1, eventId: 1 });
BookmarkSchema.index({ firebaseUid: 1, articleId: 1 });
BookmarkSchema.index({ firebaseUid: 1, reportId: 1 });

module.exports = mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);

