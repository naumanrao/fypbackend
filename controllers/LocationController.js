const { Location } = require("../models/Locations");

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).send({ locations });
  } catch (error) {
    res.status(500).send({ error });
  }
};
