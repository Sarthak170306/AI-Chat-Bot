const mongoose = require('mongoose');

/**
 * Message schema for chat messages
 * - userId: reference to the User who sent/owns the message
 * - role: 'user' | 'assistant'
 * - content: message text
 * - timestamp: when the message was created
 */
const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
