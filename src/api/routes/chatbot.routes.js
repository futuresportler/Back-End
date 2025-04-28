const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.controller");

// Chat endpoint
router.post("/chat", chatbotController.processChat);

module.exports = router;