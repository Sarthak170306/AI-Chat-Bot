const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generateAIResponse } = require('../services/aiService');

/**
 * @route   POST /api/chat
 * @desc    Get AI response from Google Generative AI (Gemini)
 * @access  Private (Clerk Authenticated)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    // Validate the input message
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'The "message" field is required and must be a string.'
      });
    }

    // Process the AI response
    const aiResponse = await generateAIResponse(message);

    // Return the response in the specified format
    return res.status(200).json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    console.error('Error in POST /api/chat:', error.message);
    
    // Check if error is due to missing config or API issue to respond with appropriate status codes
    const isClientError = error.message.includes('missing') || error.message.includes('validation');
    const statusCode = isClientError ? 400 : 500;
    
    return res.status(statusCode).json({
      success: false,
      error: error.message || 'Internal server error during AI response generation.'
    });
  }
});

module.exports = router;
