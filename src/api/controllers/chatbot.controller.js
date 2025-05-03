const { successResponse, errorResponse } = require("../../common/utils/response");
const ChatbotService = require("../../services/chatbot");

/**
 * Handle incoming chat messages and stream responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return errorResponse(res, "Messages array is required", null, 400);
    }

    const response = await ChatbotService.processChatRequest(messages);
    successResponse(res, "Chat processed successfully", response);
  } catch (error) {
    console.error("Error processing chat:", error);
    errorResponse(res, "Failed to get response from AI", error, 500);
  }
};

module.exports = {
  processChat
};