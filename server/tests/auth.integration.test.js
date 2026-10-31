
const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const jwt = require("jsonwebtoken");

// Set a test secret before loading the Express app.
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "local-integration-test-secret";

const app = require("../index");

let server;
let baseUrl;

before(async () => {
  // Port 0 lets the operating system choose an available port.
  server = app.listen(0);

  await once(server, "listening");

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  server.closeAllConnections();

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

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
  const token = jwt.sign(
    { sub: "999999999" },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );

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
