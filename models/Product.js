const { Schema, model } = require("mongoose");
const Joi = require("joi");

const productSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location",
  },
  status: {
    type: Boolean,
    default: 0,
  },
  stock: String,
  unit: String,
  voucher: String,
  voucherPercentage: String,
  voucherAvailableTimes: Number,
  created_at: {
    type: Date,
    default: new Date(),
  },
});

const Product = model("Product", productSchema);
const schema = Joi.object({
  name: Joi.string().required().min(3),
  price: Joi.string().required(),
  description: Joi.string().required(),
  userId: Joi.string(),
  image: Joi.string(),
  status: Joi.boolean(),
  stock: Joi.string(),
  unit: Joi.string(),
  voucher: Joi.string().allow(null),
  voucherPercentage: Joi.string().allow(null),
  voucherAvailableTimes: Joi.string().allow(null),
});

exports.Product = Product;
exports.validation = schema;
