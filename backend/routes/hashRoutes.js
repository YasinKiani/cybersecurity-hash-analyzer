const express = require("express");
const hashController = require("../controllers/hashController");

const router = express.Router();

// Hash generation routes
router.post("/generate", hashController.generateHash);
router.post("/visual", hashController.visualizeHash);
router.post("/crack", hashController.crackPassword);
router.post("/time-estimates", hashController.getTimeEstimates);
router.post("/sample-password", hashController.generateSamplePassword);

module.exports = router;
