const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const auth = require("../middlewares/auth");

router.post("/register", UserController.storeUser);
router.post("/login", UserController.loginUser);
router.get("/get-user", auth, UserController.getUser);
router.put("/update-profile", auth, UserController.updateUser);
router.get('/verify_email/:id',UserController.verifyEmail)

module.exports = router;
