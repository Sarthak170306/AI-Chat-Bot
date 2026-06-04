const { GoogleGenerativeAI } = require('@google/generative-ai');

// Alias GoogleGenerativeAI to GoogleGenAI to match the expected interface and standard naming
const GoogleGenAI = GoogleGenerativeAI;

// Validate that the API key is configured
if (!process.env.AI_API_KEY) {
  console.warn('WARNING: AI_API_KEY is not defined in your environment variables.');
}

// Initialize the Google Generative AI client
// We initialize this lazily or globally depending on key availability
let model = null;
try {
  if (process.env.AI_API_KEY) {
    const genAI = new GoogleGenAI(process.env.AI_API_KEY);
    // Using the recommended 'gemini-2.5-flash' model as 1.5-flash is deprecated/unavailable in this environment
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
} catch (error) {
  console.error('Failed to initialize Google Generative AI client:', error);
}

/**
 * Generates an AI text response using the Gemini model (multimodal supported).
 * 
 * @param {string} userMessage - The text message prompt from the user.
 * @param {string} [image] - Optional Base64 data string (e.g. data:image/png;base64,...)
 * @returns {Promise<string>} The generated AI text response.
 * @throws {Error} If the API key is missing or the generation fails.
 */
async function generateAIResponse(userMessage, image) {
  // Enforce API key check at runtime
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI API Key is missing. Please define AI_API_KEY in your .env file.');
  }

  // Ensure model is initialized (e.g. if key was populated post-startup or init failed)
  if (!model) {
    try {
      const genAI = new GoogleGenAI(apiKey);
      model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } catch (initErr) {
      throw new Error(`Failed to initialize Gemini Model: ${initErr.message}`);
    }
  }

  try {
    const contentParts = [userMessage];
    if (image) {
      // Extract mimeType and base64 data
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        contentParts.push({
          inlineData: {
            data: matches[2],
            mimeType: matches[1]
          }
        });
      }
    }

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Received an empty response from Gemini.');
    }
    
    return text;
  } catch (error) {
    console.error('Error generating response from Google Generative AI:', error);
    throw new Error(`AI Service error: ${error.message || error}`);
  }
}

module.exports = {
  GoogleGenAI, // Exporting the class alias as requested
  generateAIResponse
};
