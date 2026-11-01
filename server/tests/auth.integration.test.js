const requireAdmin = require("../middleware/adminMiddleware");
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


test("requireAdmin allows administrators and rejects regular users", async () => {
  const adminEmail = `admin-${randomUUID()}@example.com`;
  const regularEmail = `regular-${randomUUID()}@example.com`;

  let adminId;
  let regularId;

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    adminId = Number(
      insertUser.run(
        "Test Admin",
        adminEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    regularId = Number(
      insertUser.run(
        "Test Regular User",
        regularEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    // Promote only the temporary admin test account.
    db.prepare(`
      UPDATE users
      SET is_admin = 1
      WHERE id = ?
    `).run(adminId);

    function runMiddleware(userId) {
      const response = {
        statusCode: 200,
        body: null,

        status(code) {
          this.statusCode = code;
          return this;
        },

        json(body) {
          this.body = body;
          return this;
        },
      };

      let nextCalled = false;

      requireAdmin(
        { userId },
        response,
        () => {
          nextCalled = true;
        },
      );

      return { response, nextCalled };
    }

    // An administrator should be allowed through.
    const adminResult = runMiddleware(adminId);

    assert.equal(adminResult.nextCalled, true);
    assert.equal(adminResult.response.statusCode, 200);

    // A regular user should be rejected.
    const regularResult = runMiddleware(regularId);

    assert.equal(regularResult.nextCalled, false);
    assert.equal(regularResult.response.statusCode, 403);
    assert.equal(
      regularResult.response.body.message,
      "Admin access required.",
    );
  } finally {
    if (adminId && regularId) {
      db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(
        adminId,
        regularId,
      );
    }
  }
});

test("requireAdmin rejects requests without an authenticated user", () => {
  const response = {
    statusCode: 200,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(body) {
      this.body = body;
      return this;
    },
  };

  let nextCalled = false;

  requireAdmin(
    {},
    response,
    () => {
      nextCalled = true;
    },
  );

  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 401);
  assert.equal(
    response.body.message,
    "Authentication required.",
  );
});


test("seller application endpoints reject regular users", async () => {
  const email = `seller-test-${randomUUID()}@example.com`;
  let userId;

  try {
    userId = Number(
      db.prepare(`
        INSERT INTO users (name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `).run(
        "Regular User",
        email,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    const response = await fetch(
      `${baseUrl}/api/admin/seller-applications`,
      {
        headers: {
          Authorization: `Bearer ${createToken(userId)}`,
        },
      },
    );

    assert.equal(response.status, 403);
  } finally {
    if (userId) {
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    }
  }
});

test("admin can approve an application and create a shop", async () => {
  const adminEmail = `admin-${randomUUID()}@example.com`;
  const sellerEmail = `seller-${randomUUID()}@example.com`;

  let adminId;
  let sellerId;
  let applicationId;

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    adminId = Number(
      insertUser.run(
        "Temporary Admin",
        adminEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    sellerId = Number(
      insertUser.run(
        "Temporary Seller",
        sellerEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?")
      .run(adminId);

    applicationId = Number(
      db.prepare(`
        INSERT INTO seller_applications (
          user_id, shop_name, city, phone, description, submitted_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        sellerId,
        "Test Jewelry Shop",
        "Neqab",
        "09120000000",
        "Temporary integration test shop",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    const response = await fetch(
      `${baseUrl}/api/admin/seller-applications/${applicationId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${createToken(adminId)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision: "approved" }),
      },
    );

    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.data.status, "approved");

    const shop = db.prepare(`
      SELECT *
      FROM shops
      WHERE application_id = ?
    `).get(applicationId);

    assert.ok(shop);
    assert.equal(shop.owner_user_id, sellerId);
    assert.equal(shop.shop_name, "Test Jewelry Shop");

    // Sellers must not become platform administrators.
    const seller = db.prepare(`
      SELECT is_admin FROM users WHERE id = ?
    `).get(sellerId);

    assert.equal(seller.is_admin, 0);
  } finally {
    if (applicationId) {
      db.prepare("DELETE FROM shops WHERE application_id = ?")
        .run(applicationId);

      db.prepare("DELETE FROM seller_applications WHERE id = ?")
        .run(applicationId);
    }

    if (adminId && sellerId) {
      db.prepare("DELETE FROM users WHERE id IN (?, ?)")
        .run(adminId, sellerId);
    }
  }
});

test("admin rejection saves the reason and cannot be repeated", async () => {
  const adminEmail = `admin-${randomUUID()}@example.com`;
  const sellerEmail = `seller-${randomUUID()}@example.com`;

  let adminId;
  let sellerId;
  let applicationId;

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    adminId = Number(
      insertUser.run(
        "Temporary Admin",
        adminEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    sellerId = Number(
      insertUser.run(
        "Temporary Seller",
        sellerEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?")
      .run(adminId);

    applicationId = Number(
      db.prepare(`
        INSERT INTO seller_applications (
          user_id, shop_name, city, phone, description, submitted_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        sellerId,
        "Rejected Test Shop",
        "Neqab",
        "09120000001",
        "Temporary rejection test",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    const url =
      `${baseUrl}/api/admin/seller-applications/${applicationId}`;

    const headers = {
      Authorization: `Bearer ${createToken(adminId)}`,
      "Content-Type": "application/json",
    };

    const firstResponse = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        decision: "rejected",
        rejectionReason: "Please correct the shop information.",
      }),
    });

    assert.equal(firstResponse.status, 200);

    const application = db.prepare(`
      SELECT status, rejection_reason, reviewed_by, reviewed_at
      FROM seller_applications
      WHERE id = ?
    `).get(applicationId);

    assert.equal(application.status, "rejected");
    assert.equal(
      application.rejection_reason,
      "Please correct the shop information.",
    );
    assert.equal(application.reviewed_by, adminId);
    assert.ok(application.reviewed_at);

    const secondResponse = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        decision: "approved",
      }),
    });

    assert.equal(secondResponse.status, 409);

    const shop = db.prepare(`
      SELECT id FROM shops WHERE application_id = ?
    `).get(applicationId);

    assert.equal(shop, undefined);
  } finally {
    if (applicationId) {
      db.prepare("DELETE FROM shops WHERE application_id = ?")
        .run(applicationId);

      db.prepare("DELETE FROM seller_applications WHERE id = ?")
        .run(applicationId);
    }

    if (adminId && sellerId) {
      db.prepare("DELETE FROM users WHERE id IN (?, ?)")
        .run(adminId, sellerId);
    }
  }
});



test("admin cannot reject an application without a reason", async () => {
  const adminEmail = `admin-${randomUUID()}@example.com`;
  const sellerEmail = `seller-${randomUUID()}@example.com`;

  let adminId;
  let sellerId;
  let applicationId;

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    adminId = Number(
      insertUser.run(
        "Temporary Admin",
        adminEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    sellerId = Number(
      insertUser.run(
        "Temporary Seller",
        sellerEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?")
      .run(adminId);

    applicationId = Number(
      db.prepare(`
        INSERT INTO seller_applications (
          user_id, shop_name, city, phone, description, submitted_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        sellerId,
        "Test Shop",
        "Neqab",
        "09120000002",
        "Test description",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    const response = await fetch(
      `${baseUrl}/api/admin/seller-applications/${applicationId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${createToken(adminId)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision: "rejected" }),
      },
    );

    assert.equal(response.status, 400);

    const application = db.prepare(`
      SELECT status, reviewed_at, reviewed_by
      FROM seller_applications
      WHERE id = ?
    `).get(applicationId);

    assert.equal(application.status, "pending");
    assert.equal(application.reviewed_at, null);
    assert.equal(application.reviewed_by, null);
  } finally {
    if (applicationId) {
      db.prepare("DELETE FROM seller_applications WHERE id = ?")
        .run(applicationId);
    }

    if (adminId && sellerId) {
      db.prepare("DELETE FROM users WHERE id IN (?, ?)")
        .run(adminId, sellerId);
    }
  }
});



test("failed shop creation does not approve an application", async () => {
  const adminEmail = `admin-${randomUUID()}@example.com`;
  const sellerEmail = `seller-${randomUUID()}@example.com`;

  let adminId;
  let sellerId;
  let existingApplicationId;
  let applicationId;

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);

    adminId = Number(
      insertUser.run(
        "Temporary Admin",
        adminEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    sellerId = Number(
      insertUser.run(
        "Temporary Seller",
        sellerEmail,
        "test-hash",
        new Date().toISOString(),
      ).lastInsertRowid,
    );

    db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?")
      .run(adminId);

    const now = new Date().toISOString();

    // Create an existing approved application and its shop.
    existingApplicationId = Number(
      db.prepare(`
        INSERT INTO seller_applications (
          user_id, shop_name, city, phone, description,
          status, submitted_at, reviewed_at, reviewed_by
        )
        VALUES (?, ?, ?, ?, ?, 'approved', ?, ?, ?)
      `).run(
        sellerId,
        "Existing Shop",
        "Neqab",
        "09120000003",
        "Existing test shop",
        now,
        now,
        adminId,
      ).lastInsertRowid,
    );

    db.prepare(`
      INSERT INTO shops (
        owner_user_id, application_id, shop_name,
        city, phone, description, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sellerId,
      existingApplicationId,
      "Existing Shop",
      "Neqab",
      "09120000003",
      "Existing test shop",
      now,
      now,
    );

    // Create another pending application for the same seller.
    applicationId = Number(
      db.prepare(`
        INSERT INTO seller_applications (
          user_id, shop_name, city, phone, description, submitted_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        sellerId,
        "Second Shop",
        "Neqab",
        "09120000004",
        "Second test shop",
        now,
      ).lastInsertRowid,
    );

    const response = await fetch(
      `${baseUrl}/api/admin/seller-applications/${applicationId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${createToken(adminId)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision: "approved" }),
      },
    );

    assert.equal(response.status, 500);

    const application = db.prepare(`
      SELECT status, reviewed_at, reviewed_by
      FROM seller_applications
      WHERE id = ?
    `).get(applicationId);

    assert.equal(application.status, "pending");
    assert.equal(application.reviewed_at, null);
    assert.equal(application.reviewed_by, null);

    const shops = db.prepare(`
      SELECT id FROM shops WHERE owner_user_id = ?
    `).all(sellerId);

    assert.equal(shops.length, 1);
  } finally {
    if (applicationId) {
      db.prepare("DELETE FROM seller_applications WHERE id = ?")
        .run(applicationId);
    }

    if (existingApplicationId) {
      db.prepare("DELETE FROM shops WHERE application_id = ?")
        .run(existingApplicationId);

      db.prepare("DELETE FROM seller_applications WHERE id = ?")
        .run(existingApplicationId);
    }

    if (adminId && sellerId) {
      db.prepare("DELETE FROM users WHERE id IN (?, ?)")
        .run(adminId, sellerId);
    }
  }
});
