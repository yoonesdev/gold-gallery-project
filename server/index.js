require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { fetchGold18Price } = require("./services/GoldPriceService");

const {
  calculateProductPrice,
} = require("./services/PricingService");

const {
  getProductById,
} = require("./data/products");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Gold Gallery backend is running",
  });
});

app.get("/api/gold-price", async (req, res) => {
  try {
    const goldPrice = await fetchGold18Price();

    res.json({
      success: true,
      data: goldPrice,
    });
  } catch (error) {
    console.error("Gold price error:", error.message);

    res.status(503).json({
      success: false,
      message: "Unable to fetch the current gold price.",
    });
  }
});

app.get("/api/products/:id/price", async (req, res) => {
  try {
    const product = getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const goldPrice = await fetchGold18Price();

    const price = calculateProductPrice(
      product,
      goldPrice,
    );

    res.json({
      success: true,
      data: {
        productId: product.id,
        ...price,
      },
    });
  } catch (error) {
    console.error(
      "Product price error:",
      error.message,
    );

    res.status(503).json({
      success: false,
      message: "Unable to calculate product price.",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Gold Gallery server running on http://localhost:${PORT}`,
  );
});