const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const LocationController = require("../controllers/LocationController");

router.get("/", LocationController.getLocations);

module.exports = router;
