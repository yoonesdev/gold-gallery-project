
const db = require("../database/database");

function createUser({ name, email, passwordHash }) {
  const statement = db.prepare(`
    INSERT INTO users (
      name,
      email,
      password_hash,
      created_at
    )
    VALUES (?, ?, ?, ?)
  `);

  const result = statement.run(
    name,
    email,
    passwordHash,
    new Date().toISOString()
  );

  return {
    id: Number(result.lastInsertRowid),
    name,
    email,
  };
}

function getUserByEmail(email) {
  const statement = db.prepare(`
    SELECT
      id,
      name,
      email,
      password_hash
    FROM users
    WHERE email = ?
  `);

  return statement.get(email);
}

module.exports = {
  createUser,
  getUserByEmail,
};