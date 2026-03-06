const express = require("express");
const router = express.Router();
const { getUserProfile, updateUserProfile } = require("../controllers/user.controller");

router.get("/profile", getUserProfile);
router.post("/profile", updateUserProfile);

module.exports = router;
