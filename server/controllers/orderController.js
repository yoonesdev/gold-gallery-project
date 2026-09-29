const {
  getProductById,
} = require("../data/products");

const {
  fetchGold18Price,
} = require("../services/GoldPriceService");

const {
  calculateProductPrice,
} = require("../services/PricingService");

async function createOrder(req, res) {
  try {
    const { items } = req.body;

    // 1. Validate the request shape
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item.",
      });
    }

    // 2. Validate each cart item
    for (const item of items) {
      if (
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid productId or quantity.",
        });
      }
    }

    // 3. Get the current market price once
    const goldPrice = await fetchGold18Price();

    // 4. Rebuild the order using backend data
    const orderItems = items.map((item) => {
      const product = getProductById(item.productId);

      if (!product) {
        throw new Error(
          `Product ${item.productId} not found.`
        );
      }

      const price = calculateProductPrice(
        product,
        goldPrice
      );

      return {
        productId: product.id,
        title: product.title,
        quantity: item.quantity,
        unitPriceToman: price.priceToman,
        totalPriceToman:
          price.priceToman * item.quantity,
        pricingMode: price.mode,
      };
    });

    // 5. Calculate the final order total
    const totalPriceToman = orderItems.reduce(
      (sum, item) =>
        sum + item.totalPriceToman,
      0
    );

    const order = {
      id: Date.now(),
      items: orderItems,
      totalPriceToman,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create order.",
    });
  }
}

module.exports = {
  createOrder,
};