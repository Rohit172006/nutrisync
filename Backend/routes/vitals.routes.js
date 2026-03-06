const express = require("express");
const router = express.Router();

const { submitManualVitals, syncWearableVitals, getVitalsHistory } = require("../controllers/vitals.controller");

router.post("/manual", submitManualVitals);
router.post("/wearable-sync", syncWearableVitals);
router.get("/history", getVitalsHistory);

module.exports = router;