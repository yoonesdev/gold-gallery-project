
const express = require("express");

const {
  createOrder,
  getOrders,
} = require("../controllers/orderController");

const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/", requireAuth, getOrders);

module.exports = router;
