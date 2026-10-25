
const { randomUUID } = require("crypto");

const { saveOrder } = require("../repositories/OrderRepository");
const { getProductById } = require("../data/products");
const { fetchGold18Price } = require("./GoldPriceService");
const { calculateProductPrice } = require("./PricingService");

const MAX_ORDER_ITEMS = 50;
const MAX_QUANTITY = 99;

function validationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

async function buildOrder(items, userId, dependencies = {}) {
  const save = dependencies.saveOrder ?? saveOrder;
  const findProduct = dependencies.getProductById ?? getProductById;
  const fetchPrice = dependencies.fetchGold18Price ?? fetchGold18Price;
  const calculatePrice =
    dependencies.calculateProductPrice ?? calculateProductPrice;

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    validationError("Valid authenticated user required.", 401);
  }

  if (!Array.isArray(items) || items.length === 0) {
    validationError("Order must contain at least one item.");
  }

  if (items.length > MAX_ORDER_ITEMS) {
    validationError("Too many items in order.");
  }

  const seen = new Set();
  const validatedItems = [];

  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      validationError("Invalid order item.");
    }

    const { productId, quantity } = item;

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      validationError("Invalid product ID.");
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      validationError("Quantity must be between 1 and 99.");
    }

    if (seen.has(productId)) {
      validationError("Each product must appear only once in an order.");
    }

    seen.add(productId);

    const product = findProduct(productId);

    if (!product) {
      validationError(`Product ${productId} not found.`, 404);
    }

    validatedItems.push({ product, quantity });
  }

  const goldPrice = await fetchPrice();

  const orderItems = validatedItems.map(({ product, quantity }) => {
    const price = calculatePrice(product, goldPrice);

    if (
      !Number.isSafeInteger(price.priceToman) ||
      price.priceToman < 0
    ) {
      throw new Error("Invalid calculated product price.");
    }

    const totalPriceToman = price.priceToman * quantity;

    if (!Number.isSafeInteger(totalPriceToman)) {
      throw new Error("Order item total is too large.");
    }

    return {
      productId: product.id,
      title: product.title,
      quantity,
      unitPriceToman: price.priceToman,
      totalPriceToman,
      pricingMode: price.mode,
    };
  });

  const totalPriceToman = orderItems.reduce(
    (sum, item) => sum + item.totalPriceToman,
    0,
  );

  if (!Number.isSafeInteger(totalPriceToman)) {
    throw new Error("Order total is too large.");
  }

  const order = {
    id: randomUUID(),
    userId,
    items: orderItems,
    totalPriceToman,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return save(order);
}

module.exports = { buildOrder };
