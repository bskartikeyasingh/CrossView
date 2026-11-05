const Bookmark = require('../models/Bookmark');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

const getBookmarks = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid;
    let bookmarks = [];

    if (getStatus()) {
      bookmarks = await Bookmark.find({ firebaseUid }).sort({ createdAt: -1 }).lean();
    } else {
      bookmarks = Array.from(memoryStore.bookmarks.values()).filter(
        (b) => b.firebaseUid === firebaseUid
      );
      bookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({ success: true, count: bookmarks.length, bookmarks });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const createBookmark = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid;
    const { itemType = 'event', eventId, articleId, reportId, title, category, sourceCount } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required for bookmark.' });
    }

    let bookmark;
    if (getStatus()) {
      bookmark = await Bookmark.create({
        firebaseUid,
        itemType,
        eventId: eventId || null,
        articleId: articleId || null,
        reportId: reportId || null,
        title,
        category: category || 'General',
        sourceCount: sourceCount || 1,
      });
    } else {
      const id = `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      bookmark = {
        _id: id,
        firebaseUid,
        itemType,
        eventId: eventId || null,
        articleId: articleId || null,
        reportId: reportId || null,
        title,
        category: category || 'General',
        sourceCount: sourceCount || 1,
        createdAt: new Date(),
      };
      memoryStore.bookmarks.set(id, bookmark);
    }

    return res.status(201).json({ success: true, bookmark });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const firebaseUid = req.firebaseUid;

    if (getStatus()) {
      await Bookmark.findOneAndDelete({ _id: id, firebaseUid });
    } else {
      const found = memoryStore.bookmarks.get(id);
      if (found && found.firebaseUid === firebaseUid) {
        memoryStore.bookmarks.delete(id);
      }
    }

    return res.json({ success: true, message: 'Bookmark removed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getBookmarks, createBookmark, deleteBookmark };
