const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generateAIResponse } = require('../services/aiService');
const chatController = require('../controllers/chatController');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');

/**
 * @route   POST /api/chat
 * @desc    Get AI response and optionally persist chat messages
 * @access  Private (Clerk Authenticated)
 */
router.post('/', authMiddleware, async (req, res) => {
  console.log("Incoming Request Auth State:", req.auth);
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ success: false, error: "Clerk verification failed on Backend. userId is missing." });
  }
  try {
    const { message, sessionId, image } = req.body;
    const userId = String(req.auth.userId);

    // Validate message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'The "message" field is required and must be a string.'
      });
    }

    // Helper to persist a message
    const saveMessage = async (sid, role, content, img = null) => {
      await Message.create({ sessionId: sid, role, content, image: img });
    };

    let currentSessionId = sessionId;

    // If no sessionId supplied, create a new session for this user
    if (!currentSessionId) {
      const newSession = await ChatSession.create({ userId: String(userId) });
      currentSessionId = newSession._id;
    } else {
      // Verify that the session belongs to the user
      const session = await ChatSession.findById(currentSessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: 'Chat session not found.' });
      }
      if (session.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Forbidden: session does not belong to user.' });
      }
    }

    // Persist user message
    await saveMessage(currentSessionId, 'user', message, image);

    // Generate AI response
    const aiResponse = await generateAIResponse(message, image);

    // Persist assistant response
    await saveMessage(currentSessionId, 'assistant', aiResponse);

    // Return response with session identifier
    return res.status(200).json({ success: true, response: aiResponse, sessionId: currentSessionId });
  } catch (error) {
    console.error('Error in POST /api/chat:', error.message);
    const isClientError = error.message.includes('missing') || error.message.includes('validation');
    const statusCode = isClientError ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Internal server error during AI response generation.'
    });
  }
});

// New session creation endpoint
router.post('/session', authMiddleware, chatController.createNewSession);

// Retrieve all sessions for the authenticated user
router.get('/sessions', authMiddleware, (req, res) => {
  console.log("Incoming Request Auth State:", req.auth);
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ success: false, error: "Clerk verification failed on Backend. userId is missing." });
  }
  return chatController.getUserSessions(req, res);
});

// Retrieve message history for a specific session
router.get('/history/:sessionId', authMiddleware, chatController.getSessionMessages);

module.exports = router;
