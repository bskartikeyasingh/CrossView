const Claim = require('../models/Claim');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

const getAllClaims = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (getStatus()) {
      const filter = {};
      if (status && status !== 'All') filter.evidenceStatus = status;
      if (type && type !== 'All') filter.claimType = type;

      const total = await Claim.countDocuments(filter);
      const claims = await Claim.find(filter)
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      return res.json({
        success: true,
        claims,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    } else {
      let list = Array.from(memoryStore.claims.values());
      if (status && status !== 'All') {
        list = list.filter((c) => c.evidenceStatus === status);
      }
      if (type && type !== 'All') {
        list = list.filter((c) => c.claimType === type);
      }

      list.sort((a, b) => new Date(b.lastUpdatedDate || Date.now()) - new Date(a.lastUpdatedDate || Date.now()));
      const total = list.length;
      const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.json({
        success: true,
        claims: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    let claim = null;

    if (getStatus()) {
      claim = await Claim.findById(id).lean();
    } else {
      claim = memoryStore.claims.get(id);
    }

    if (!claim) {
      return res.status(404).json({ success: false, error: 'Claim not found.' });
    }

    return res.json({ success: true, claim });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getEventClaims = async (req, res) => {
  try {
    const { id } = req.params;
    let claims = [];

    if (getStatus()) {
      claims = await Claim.find({ eventId: id }).sort({ confidenceScore: -1 }).lean();
    } else {
      claims = Array.from(memoryStore.claims.values()).filter((c) => c.eventId === id);
    }

    return res.json({ success: true, count: claims.length, claims });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAllClaims, getClaimById, getEventClaims };

