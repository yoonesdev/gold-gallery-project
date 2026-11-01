
const express = require("express");

const requireAuth = require("../middleware/authMiddleware");

const {
  submitApplication,
  getMyApplication,
} = require("../controllers/sellerApplicationController");

const router = express.Router();

router.post("/", requireAuth, submitApplication);

router.get("/me", requireAuth, getMyApplication);

module.exports = router;
