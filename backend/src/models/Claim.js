const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    claimText: {
      type: String,
      required: true,
      trim: true,
    },
    claimType: {
      type: String,
      enum: ['factual', 'quote', 'statistic', 'policy', 'assertion'],
      default: 'factual',
    },
    sourceArticleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
    supportingEvidence: [
      {
        sourceName: String,
        articleId: String,
        url: String,
        quote: String,
      },
    ],
    contradictingEvidence: [
      {
        sourceName: String,
        articleId: String,
        url: String,
        quote: String,
      },
    ],
    evidenceStatus: {
      type: String,
      enum: [
        'Corroborated by multiple independent sources',
        'Supported by one available source',
        'Disputed by available reports',
        'Unverified or insufficient evidence',
      ],
      required: true,
      index: true,
    },
    confidenceScore: {
      type: Number,
      default: 0.8,
    },
    firstReportedDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);

