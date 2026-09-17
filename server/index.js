const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Gold Gallery backend is running",
  });
});

// Temporary development gold price
app.get("/api/gold-price", (req, res) => {
  res.json({
    success: true,
    data: {
      asset: "gold_18",
      currency: "toman",
      pricePerGram: 22000000,
      updatedAt: new Date().toISOString(),
      status: "demo",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Gold Gallery server running on http://localhost:${PORT}`);
});