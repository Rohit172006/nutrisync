// routes/food.routes.js
const express = require("express");
const router = express.Router();
const { analyzeFood } = require("../controllers/food.controller");

router.post("/analyze", analyzeFood);

module.exports = router;