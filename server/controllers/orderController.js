
const {
  getOrdersByUserId,
} = require("../repositories/OrderRepository");

const { buildOrder } = require("../services/OrderService");

async function createOrder(req, res) {
  try {
    const { items } = req.body;

    // The user ID comes from the verified JWT middleware.
    const order = await buildOrder(items, req.userId);

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? "Unable to create order."
          : error.message,
    });
  }
}

async function getOrders(req, res) {
  try {
    // Fetch only orders belonging to the authenticated user.
    const orders = getOrdersByUserId(req.userId);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders.",
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
};
