const mongoose = require('mongoose');

const ConsolidatedReportSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      default: 'General',
      index: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    overview: {
      type: String,
      required: true,
    },
    whatHappened: {
      type: String,
      required: true,
    },
    sharedInformation: [
      {
        type: String,
      },
    ],
    differences: [
      {
        type: String,
      },
    ],
    disputedClaims: [
      {
        type: String,
      },
    ],
    missingContext: [
      {
        type: String,
      },
    ],
    eventContext: {
      type: String,
      default: '',
    },
    sourceReferences: [
      {
        sourceName: String,
        sourceDomain: String,
        title: String,
        url: String,
        publishedAt: String,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    model: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    reportVersion: {
      type: String,
      default: '1.0',
    },
    disclaimer: {
      type: String,
      default:
        'AI-generated consolidated report based on available source material. This report is a synthesis of published coverage and is not independently verified journalism.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.ConsolidatedReport ||
  mongoose.model('ConsolidatedReport', ConsolidatedReportSchema);

