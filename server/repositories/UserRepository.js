
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

function isUserAdmin(userId) {
  const statement = db.prepare(`
    SELECT is_admin
    FROM users
    WHERE id = ?
  `);

  const user = statement.get(userId);

  return user?.is_admin === 1;
}

module.exports = {
  createUser,
  getUserByEmail,
  isUserAdmin,
};
