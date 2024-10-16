const { Schema, model } = require("mongoose");

const userTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  created_at: {
    type: Date,
    default: new Date(),
  },
});

const UserType = model("UserType", userTypeSchema);

exports.UserType = UserType;
