// backend/models/ChatSession.js

const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk UID
  title: { type: String, default: 'New Chat' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
