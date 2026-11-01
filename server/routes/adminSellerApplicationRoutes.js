
const express = require("express");

const requireAuth = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
  getApplications,
  review,
} = require("../controllers/adminSellerApplicationController");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/seller-applications", getApplications);
router.patch("/seller-applications/:id", review);

module.exports = router;
