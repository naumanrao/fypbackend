const { Schema, model } = require("mongoose");
const Joi = require("joi");

const userConversationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
  },
  conversationParticipant: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const UserConversation = model("UserConversation", userConversationSchema);
const schema = Joi.object({
  userId: Joi.string().required(),
  conversationParticipant: Joi.string().required(),
});

exports.UserConversation = UserConversation;
exports.userConversationValidation = schema;
