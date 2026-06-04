// backend/controllers/chatController.js

const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');

/**
 * Create a new chat session for the authenticated user.
 */
exports.createNewSession = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    const session = await ChatSession.create({ userId: String(userId) });
    return res.status(201).json({ success: true, sessionId: session._id, title: session.title });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return res.status(500).json({ success: false, error: 'Failed to create chat session' });
  }
};

/**
 * Get all chat sessions for the authenticated user, sorted newest first.
 */
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
};

/**
 * Get all messages for a specific session, after verifying ownership.
 */
exports.getSessionMessages = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    if (session.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching session messages:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
};
