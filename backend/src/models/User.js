const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    preferences: {
      categories: {
        type: [String],
        default: ['World', 'Technology', 'Business', 'Politics', 'Science'],
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      alertFrequency: {
        type: String,
        enum: ['realtime', 'daily', 'weekly'],
        default: 'daily',
      },
      defaultPerspectiveView: {
        type: String,
        enum: ['side-by-side', 'consolidated', 'timeline'],
        default: 'consolidated',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

