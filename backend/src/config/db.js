const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  MONGODB_URI is not defined in .env. Running in resilient mock/in-memory mode for development and testing.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('\x1b[33m%s\x1b[0m', `⚠️  Could not connect to MongoDB Atlas (${error.message}). Falling back to resilient storage.`);
    isConnected = false;
    return false;
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };
