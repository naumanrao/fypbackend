const {
  User,
  validation,
  authValidation,
  updateProfileScheme,
} = require("../models/User");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.storeUser = async (req, res) => {
  const { error } = validation.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { fullName, email, password, phoneNumber, location } = req.body;

  const userCheck = await User.findOne({ email: email });
  if (userCheck) return res.status(400).send("This email is taken.");

  let user = new User({
    fullName: fullName,
    email: email,
    password: password,
    phoneNumber: phoneNumber,
    location: location,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const createdUser = await User.findById({ _id: user._id }).populate(
    "location"
  );

  let sendUser = _.pick(createdUser, [
    "_id",
    "fullName",
    "email",
    "phoneNumber",
    "location",
    "created_at",
  ]);
  const token1 = user.genAuthToken2();

  // Create token
  const token = jwt.sign({ user_id: user._id, email }, "mySecretKey", {
    expiresIn: "5h",
  });

  // save user token
  user.token = token;
  transporter.sendMail({
    to: email,
    from: process.env.EMAIL_USERNAME,
    // Subject of Email
    subject: "Email Verification",
    text: `Hi ! There, You have recently visited 
     our website and entered your email.
     Please follow the given link to verify your email
     http://localhost:5006/api/user/verify_email/${token1} 
     Thanks`,
  });
  return res.status(201).send(`Sent a verification email to ${email}`);
  return res.status(201).send({
    user: sendUser,
    message: "Your account has been sucessfully created!",
  });
};

exports.verifyEmail = async (req, res) => {
  const { id } = req.params;
  // Check we have an id
  if (!id) {
    try {
      return res.status(422).send({
        message: "Missing Token",
      });
    } catch (err) {
      return res.status(404).send({
        message: "err",
      });
    }
  }
  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(id, process.env.USER_VERIFICATION_TOKEN_SECRET);
  } catch (err) {
    return res.status(500).send(err);
  }
  try {
    // Step 2 - Find user with matching ID
    const user = await User.findOne({ _id: payload.ID }).exec();
    if (!user) {
      return res.status(404).send({
        message: "User does not  exists",
      });
    }
    // Step 3 - Update user verification status to true
    user.verified = true;
    await user.save();
    return res.redirect("http://localhost:3000/login");
  } catch (err) {
    return res.status(500).send(err);
  }
};

exports.loginUser = async (req, res) => {
  const { error } = authValidation.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email }).populate("location");
  if (!user) return res.status(400).send({ error: "User does not exist" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send({ error: "Wrong password" });
  if (!user.verified) {
    return res.status(403).send("Verify your Account.");
  } else {
    const token = user.genAuthToken();
    let sendUser = _.pick(user, [
      "_id",
      "fullName",
      "email",
      "phoneNumber",
      "userType",
      "location",
    ]);

    res.status(200).send({ token, user: sendUser });
  }
};

exports.getUser = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById({ _id: _id })
    .select("-password")
    .populate("location");

  res.status(200).send({ user });
};

exports.updateUser = async (req, res) => {
  const { _id } = req.user;

  let newPassword = "";
  const { error } = updateProfileScheme.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { fullName, email, phoneNumber, location, password } = req.body;

  const user = await User.findOne({ _id });

  user.fullName = fullName;
  user.email = email;
  user.phoneNumber = phoneNumber;
  user.location - location;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(password, salt);
    user.password = newPassword;
  }
  await user.save();

  let sendUser = _.pick(user, [
    "_id",
    "fullName",
    "email",
    "phoneNumber",
    "location",
    "created_at",
  ]);

  res.status(200).send({ user: sendUser, message: "Updated sucessfully!" });
};
