const { Conversation, validation } = require("../models/Conversations");
const { Message, messageValidate } = require("../models/Message");
const { UserConversation } = require("../models/UserConvesations");

exports.createChatRoom = async (req, res) => {
  try {
    const { error } = validation.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const { chatRoomName, productId, productOwnerId } = req.body;

    const existinguserConversation = await UserConversation.find({
      userId: req.user._id,
    }).populate("conversationId");

    let conversation = null;

    existinguserConversation.map((userConvo) => {
      if (userConvo.conversationId.productId == productId) {
        conversation = userConvo.conversationId;
      }
    });

    if (conversation) {
      return res.status(200).send({
        message: "Conversation already exists",
        conversation,
      });
    }

    const newConversation = new Conversation({
      productId,
      chatRoomName,
    });
    await newConversation.save();

    const userConversation = new UserConversation({
      conversationId: newConversation._id,
      userId: req.user._id,
      conversationParticipant: productOwnerId,
    });

    await userConversation.save();

    const productOwnerConversation = new UserConversation({
      conversationId: newConversation._id,
      userId: productOwnerId,
      conversationParticipant: req.user._id,
    });

    await productOwnerConversation.save();

    res.status(200).send({
      message: "Conversation created",
      conversation: newConversation,
    });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await UserConversation.find({
      userId: req.user._id,
    })
      .populate("conversationId")
      .populate("conversationParticipant", "-password");
    res.status(200).send({ conversations });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { error } = messageValidate.validate(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const { message, conversationId } = req.body;

    const messageCreated = new Message({
      message,
      conversationId,
      userId: req.user._id,
    });

    await messageCreated.save();
    const io = req.app.get("socketio");

    const createdMessage = await Message.findById({
      _id: messageCreated._id,
    }).populate("userId", "-password");

    io.emit(`Conversation-${conversationId}`, createdMessage);

    res.status(200).send({ messageCreated: createdMessage });
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate("userId", "-password");
    res.status(200).send({ messages });
  } catch (error) {
    res.status(500).send({ error });
  }
};
