const { Schema, model } = require("mongoose");
const Joi = require("joi");

const conversationSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  chatRoomName: {
    type: String,
    required: true,
  },
});

const Conversation = model("Conversation", conversationSchema);
const schema = Joi.object({
  productId: Joi.string().required(),
  chatRoomName: Joi.string().required(),
  productOwnerId: Joi.string().required(),
});

exports.Conversation = Conversation;
exports.validation = schema;
