const { Schema, model } = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { secretToken } = require("../Env");

const userSchema = new Schema({
  fullName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  phoneNumber: String,
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location",
  },
  created_at: {
    type: Date,
    default: new Date(),
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  resetLink: {
    data: String,
    default: "",
  },
});

userSchema.methods.genAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    secretToken
  );
  return token;
  
};
userSchema.methods.genAuthToken2 = function () {
  const token1 = jwt.sign(
    { ID: this._id },
    process.env.USER_VERIFICATION_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return token1;
  
};


const User = model("User", userSchema);

const schema = Joi.object({
  fullName: Joi.string().required().min(3),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  phoneNumber: Joi.string().required(),
  location: Joi.string().required(),
});

const authSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

const updateProfileScheme = Joi.object({
  fullName: Joi.string().required().min(3),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  phoneNumber: Joi.string(),

  location: Joi.string(),
});



exports.User = User;
exports.validation = schema;
exports.authValidation = authSchema;
exports.updateProfileScheme = updateProfileScheme;
