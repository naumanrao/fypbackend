require("dotenv").config({ path: "../.env" });

const { UserType } = require("../models/UserTypes");
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDb... ", err));

const userTypes = ["Seller", "Buyer"];

userTypes.map(async (item, index) => {
  const userType = new UserType({ name: item });
  await userType.save();
  if (index === userTypes.length - 1) {
    console.log("DONE!");
    mongoose.disconnect();
  }
});
