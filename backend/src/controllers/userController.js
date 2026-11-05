const User = require('../models/User');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

const getProfile = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res) => {
  try {
    const { name, profileImage } = req.body;
    const firebaseUid = req.firebaseUid;

    let updatedUser;
    if (getStatus()) {
      updatedUser = await User.findOneAndUpdate(
        { firebaseUid },
        {
          ...(name && { name }),
          ...(profileImage !== undefined && { profileImage }),
        },
        { new: true }
      );
    } else {
      updatedUser = memoryStore.users.get(firebaseUid);
      if (updatedUser) {
        if (name) updatedUser.name = name;
        if (profileImage !== undefined) updatedUser.profileImage = profileImage;
        updatedUser.updatedAt = new Date();
      }
    }

    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const firebaseUid = req.firebaseUid;

    if (!preferences) {
      return res.status(400).json({ success: false, error: 'Preferences object is required.' });
    }

    let updatedUser;
    if (getStatus()) {
      updatedUser = await User.findOneAndUpdate(
        { firebaseUid },
        { preferences },
        { new: true }
      );
    } else {
      updatedUser = memoryStore.users.get(firebaseUid);
      if (updatedUser) {
        updatedUser.preferences = { ...updatedUser.preferences, ...preferences };
        updatedUser.updatedAt = new Date();
      }
    }

    return res.json({ success: true, preferences: updatedUser?.preferences || preferences });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getProfile, updateProfile, updatePreferences };
