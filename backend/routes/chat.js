const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generateAIResponse, generateChatTitle } = require('../services/aiService');
const chatController = require('../controllers/chatController');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');

/**
 * @route   POST /api/chat
 * @desc    Get AI response and optionally persist chat messages
 * @access  Private (Clerk Authenticated)
 */
router.post('/', authMiddleware, async (req, res) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ success: false, error: "Clerk verification failed on Backend. userId is missing." });
  }
  try {
    const { message, sessionId, image, audio } = req.body;
    const userId = String(req.auth.userId);

    // Validate message - can be empty if image or audio is attached
    if ((!message || typeof message !== 'string') && !image && !audio) {
      return res.status(400).json({
        success: false,
        error: 'The "message" field is required (or an image/audio attachment must be provided).'
      });
    }

    const promptMessage = message || "";

    // Helper to persist a message
    const saveMessage = async (sid, role, content, img = null, aud = null) => {
      await Message.create({ sessionId: sid, role, content, image: img, audio: aud });
    };

    let currentSessionId = sessionId;
    let isFirstMessage = false;

    // If no sessionId supplied, create a new session for this user
    if (!currentSessionId) {
      const newSession = await ChatSession.create({ userId: String(userId) });
      currentSessionId = newSession._id;
      isFirstMessage = true;
    } else {
      // Verify that the session belongs to the user
      const session = await ChatSession.findById(currentSessionId);
      if (!session) {
        return res.status(404).json({ success: false, error: 'Chat session not found.' });
      }
      if (session.userId !== userId) {
        return res.status(403).json({ success: false, error: 'Forbidden: session does not belong to user.' });
      }
      // If the session exists but still has its default title, treat it as the first message
      if (!session.title || session.title === 'New Chat') {
        isFirstMessage = true;
      }
    }

    // Persist user message
    await saveMessage(currentSessionId, 'user', promptMessage, image, audio);

    // Generate AI response
    const aiResponse = await generateAIResponse(promptMessage, image, audio);

    // Persist assistant response
    await saveMessage(currentSessionId, 'assistant', aiResponse);

    // Auto-rename chat session based on first message
    if (isFirstMessage) {
      try {
        const titleInput = promptMessage.trim() || (image ? "Image Analysis" : (audio ? "Audio Message" : "New Chat"));
        if (titleInput !== "New Chat") {
          const generatedTitle = await generateChatTitle(titleInput);
          await ChatSession.findByIdAndUpdate(currentSessionId, { title: generatedTitle });
        }
      } catch (titleErr) {
        console.error('Failed to auto-name chat session:', titleErr);
      }
    }

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
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ success: false, error: "Clerk verification failed on Backend. userId is missing." });
  }
  return chatController.getUserSessions(req, res);
});

// Retrieve message history for a specific session
router.get('/history/:sessionId', authMiddleware, chatController.getSessionMessages);

module.exports = router;
