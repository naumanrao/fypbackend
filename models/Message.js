const { Schema, model } = require("mongoose");
const Joi = require("joi");

const messageSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: "Conversation",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Message = model("Message", messageSchema);
const schema = Joi.object({
  message: Joi.string().required(),
  conversationId: Joi.string().required(),
});

exports.Message = Message;
exports.messageValidate = schema;
