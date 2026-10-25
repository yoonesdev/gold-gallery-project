
const test = require("node:test");
const assert = require("node:assert/strict");

const { buildOrder } = require("./OrderService");
const { getProductById } = require("../data/products");

function createDependencies() {
  return {
    saveOrder: (order) => order,
    getProductById,
    fetchGold18Price: async () => ({ status: "live" }),
    calculateProductPrice: () => ({
      priceToman: 1000,
      mode: "fixed",
    }),
  };
}

test("builds an order using server-calculated prices", async () => {
  const order = await buildOrder(
    [{ productId: 1, quantity: 2 }],
    1,
    createDependencies(),
  );

  assert.equal(order.userId, 1);
  assert.equal(order.items[0].unitPriceToman, 1000);
  assert.equal(order.totalPriceToman, 2000);
  assert.equal(order.status, "pending");
  assert.match(
    order.id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
});

test("rejects an empty order", async () => {
  await assert.rejects(
    buildOrder([], 1, createDependencies()),
    /at least one item/,
  );
});

test("rejects an invalid quantity", async () => {
  await assert.rejects(
    buildOrder(
      [{ productId: 1, quantity: 0 }],
      1,
      createDependencies(),
    ),
    /Quantity must be between/,
  );
});

test("rejects duplicate product IDs", async () => {
  await assert.rejects(
    buildOrder(
      [
        { productId: 1, quantity: 1 },
        { productId: 1, quantity: 2 },
      ],
      1,
      createDependencies(),
    ),
    /only once/,
  );
});

test("rejects unknown products", async () => {
  await assert.rejects(
    buildOrder(
      [{ productId: 999999, quantity: 1 }],
      1,
      createDependencies(),
    ),
    { statusCode: 404 },
  );
});

test("rejects an invalid user ID", async () => {
  await assert.rejects(
    buildOrder(
      [{ productId: 1, quantity: 1 }],
      0,
      createDependencies(),
    ),
    { statusCode: 401 },
  );
});
