const { Schema, model } = require("mongoose");

const productsSoldSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: String,
  total: String,
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const SoldProduct = model("SoldProducts", productsSoldSchema);

exports.SoldProduct = SoldProduct;
