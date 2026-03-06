const express = require("express");
const router = express.Router();

const { moodRecommendation } = require("../controllers/mood.controller");

router.post("/recommend", moodRecommendation);

module.exports = router;