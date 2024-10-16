require("dotenv").config({ path: "../.env" });

const { Location } = require("../models/Locations");
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDb... ", err));

const locations = ["Lahore", "Rawalpindi", "Karachi"];

locations.map(async (item, index) => {
  const location = new Location({ name: item });
  await location.save();
  if (index === locations.length - 1) {
    console.log("DONE!");
    mongoose.disconnect();
  }
});
