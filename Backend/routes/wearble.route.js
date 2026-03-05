const express = require("express");
const router = express.Router();

const { getDeviceData } = require("../controllers/wearable.controller");

router.get("/device-data", getDeviceData);

module.exports = router;                    