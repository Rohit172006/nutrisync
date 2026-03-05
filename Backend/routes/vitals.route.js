const express = require("express");
const router = express.Router();

const { submitManualVitals } = require("../controllers/vitals.controller");
const { syncWearableVitals } = require("../controllers/vitals.controller");
// Manual vitals route
router.post("/manual", submitManualVitals);
router.post("/wearable-sync", syncWearableVitals);

module.exports = router;