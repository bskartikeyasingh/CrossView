const { verifyIdToken } = require('../config/firebase');
const User = require('../models/User');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Authorization Bearer token required.',
      });
    }

    const token = authHeader.split('Bearer ')[1].trim();
    const decodedToken = await verifyIdToken(token);

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired authentication token.',
      });
    }

    let user;
    if (getStatus()) {
      // Find or create in MongoDB Atlas
      user = await User.findOne({ firebaseUid: decodedToken.uid });
      if (!user) {
        user = await User.create({
          firebaseUid: decodedToken.uid,
          name: decodedToken.name || decodedToken.email.split('@')[0],
          email: decodedToken.email,
          profileImage: decodedToken.picture || '',
          role: 'USER',
        });
      }
    } else {
      // Find or create in memory store
      user = memoryStore.users.get(decodedToken.uid);
      if (!user) {
        user = {
          _id: `usr_${Date.now()}`,
          firebaseUid: decodedToken.uid,
          name: decodedToken.name || decodedToken.email.split('@')[0],
          email: decodedToken.email,
          profileImage: decodedToken.picture || '',
          role: 'USER',
          preferences: {
            categories: ['World', 'Technology', 'Business', 'Politics', 'Science'],
            emailNotifications: true,
            alertFrequency: 'daily',
            defaultPerspectiveView: 'consolidated',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memoryStore.users.set(decodedToken.uid, user);
      }
    }

    req.user = user;
    req.firebaseUid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Please sign in again.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split('Bearer ')[1].trim();
    const decodedToken = await verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
      if (getStatus()) {
        req.user = await User.findOne({ firebaseUid: decodedToken.uid });
      } else {
        req.user = memoryStore.users.get(decodedToken.uid);
      }
      req.firebaseUid = decodedToken.uid;
    }
  } catch (_) {
    // Continue unauthenticated if token check fails
  }
  next();
};

module.exports = { requireAuth, optionalAuth };

