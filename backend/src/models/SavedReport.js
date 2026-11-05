const mongoose = require('mongoose');

const SavedReportSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsolidatedReport',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    headline: {
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

SavedReportSchema.index({ firebaseUid: 1, reportId: 1 }, { unique: true });

module.exports = mongoose.models.SavedReport || mongoose.model('SavedReport', SavedReportSchema);

