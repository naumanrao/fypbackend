const { Schema, model } = require("mongoose");

const locationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Location = model("Location", locationSchema);

exports.Location = Location;
