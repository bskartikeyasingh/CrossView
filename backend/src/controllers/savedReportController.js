const SavedReport = require('../models/SavedReport');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

const getSavedReports = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid;
    let saved = [];

    if (getStatus()) {
      saved = await SavedReport.find({ firebaseUid }).populate('reportId').sort({ createdAt: -1 }).lean();
    } else {
      saved = Array.from(memoryStore.savedReports.values()).filter(
        (s) => s.firebaseUid === firebaseUid
      );
      saved.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({ success: true, count: saved.length, savedReports: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const createSavedReport = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid;
    const { reportId, eventId, headline, category, sourceCount } = req.body;

    if (!reportId || !eventId) {
      return res.status(400).json({ success: false, error: 'ReportId and EventId are required.' });
    }

    let saved;
    if (getStatus()) {
      saved = await SavedReport.findOneAndUpdate(
        { firebaseUid, reportId },
        {
          firebaseUid,
          reportId,
          eventId,
          headline: headline || 'Consolidated Intelligence Report',
          category: category || 'General',
          sourceCount: sourceCount || 1,
        },
        { upsert: true, new: true }
      );
    } else {
      const id = `sr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      saved = {
        _id: id,
        firebaseUid,
        reportId,
        eventId,
        headline: headline || 'Consolidated Intelligence Report',
        category: category || 'General',
        sourceCount: sourceCount || 1,
        createdAt: new Date(),
      };
      memoryStore.savedReports.set(id, saved);
    }

    return res.status(201).json({ success: true, savedReport: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const deleteSavedReport = async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUid = req.firebaseUid;

    if (getStatus()) {
      await SavedReport.findOneAndDelete({ _id: id, firebaseUid });
    } else {
      const found = memoryStore.savedReports.get(id);
      if (found && found.firebaseUid === firebaseUid) {
        memoryStore.savedReports.delete(id);
      }
    }

    return res.json({ success: true, message: 'Saved report deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getSavedReports, createSavedReport, deleteSavedReport };

