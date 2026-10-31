
const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { randomUUID } = require("node:crypto");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET =
  process.env.JWT_SECRET || "local-integration-test-secret";

const app = require("../index");
const db = require("../database/database");
const { getOrderById } = require("../repositories/OrderRepository");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, "listening");

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  server.closeAllConnections();

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

function createToken(userId) {
  return jwt.sign(
    { sub: String(userId) },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );
}

test("GET /api/orders rejects requests without a token", async () => {
  const response = await fetch(`${baseUrl}/api/orders`);

  assert.equal(response.status, 401);

  const body = await response.json();
  assert.equal(body.message, "Authentication required.");
});

test("GET /api/orders rejects an invalid token", async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    headers: {
      Authorization: "Bearer invalid-token",
    },
  });

  assert.equal(response.status, 401);

  const body = await response.json();
  assert.equal(body.message, "Invalid or expired token.");
});

test("GET /api/orders accepts a valid token", async () => {
  const token = createToken(999999999);

  const response = await fetch(`${baseUrl}/api/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 200);

  const body = await response.json();

  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data));
});

test("users can only access their own orders", async () => {
  const userAEmail = `test-a-${randomUUID()}@example.com`;
  const userBEmail = `test-b-${randomUUID()}@example.com`;

  let userAId;
  let userBId;

  const orderAId = randomUUID();
  const orderBId = randomUUID();

  try {
    // Create two temporary users.
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    userAId = Number(
      insertUser.run(
        "Test User A",
        userAEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    userBId = Number(
      insertUser.run(
        "Test User B",
        userBEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    // Give each user one separate order.
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        id,
        user_id,
        items,
        total_price_toman,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      orderAId,
      userAId,
      "[]",
      1000000,
      "pending",
      new Date().toISOString(),
    );

    insertOrder.run(
      orderBId,
      userBId,
      "[]",
      2000000,
      "pending",
      new Date().toISOString(),
    );

    // Authenticate as User A.
    const responseA = await fetch(`${baseUrl}/api/orders`, {
      headers: {
        Authorization: `Bearer ${createToken(userAId)}`,
      },
    });

    assert.equal(responseA.status, 200);

    const bodyA = await responseA.json();

    assert.deepEqual(
      bodyA.data.map((order) => order.id),
      [orderAId],
    );

    // Authenticate as User B.
    const responseB = await fetch(`${baseUrl}/api/orders`, {
      headers: {
        Authorization: `Bearer ${createToken(userBId)}`,
      },
    });

    assert.equal(responseB.status, 200);

    const bodyB = await responseB.json();

    assert.deepEqual(
      bodyB.data.map((order) => order.id),
      [orderBId],
    );

    // User A must not retrieve User B's order by ID.
    assert.equal(
      getOrderById(orderBId, userAId),
      undefined,
    );

    // User B can retrieve their own order.
    assert.equal(
      getOrderById(orderBId, userBId).id,
      orderBId,
    );
  } finally {
    // Remove only the temporary test records.
    db.prepare("DELETE FROM orders WHERE id IN (?, ?)").run(
      orderAId,
      orderBId,
    );

    if (userAId && userBId) {
      db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(
        userAId,
        userBId,
      );
    }
  }
});
