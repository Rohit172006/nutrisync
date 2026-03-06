// routes/food.routes.js
const express = require("express");
const router = express.Router();
const { analyzeFood, shuffleMeal, analyzeFridgeImage } = require("../controllers/food.controller");

router.post("/analyze", analyzeFood);
router.get("/shuffle", shuffleMeal);
router.post("/vision", analyzeFridgeImage);

module.exports = router;