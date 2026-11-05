const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sourceDomain: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    imageUrl: {
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
    language: {
      type: String,
      default: 'en',
    },
    contentAvailability: {
      type: String,
      enum: ['full', 'snippet', 'headline_only'],
      default: 'snippet',
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ArticleSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
