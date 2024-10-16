const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const ConversationController = require("../controllers/ConversationController");

router.post("/create-chatroom", auth, ConversationController.createChatRoom);
router.post("/create-message", auth, ConversationController.createMessage);

router.get(
  "/get-user-conversations",
  auth,
  ConversationController.getConversations
);
router.get(
  "/get-messages/:conversationId",
  auth,
  ConversationController.getMessages
);

module.exports = router;
