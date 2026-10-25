
const db = require("../database/database");

function saveOrder(order) {
  const statement = db.prepare(`
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

  statement.run(
    order.id,
    order.userId,
    JSON.stringify(order.items),
    order.totalPriceToman,
    order.status,
    order.createdAt,
  );

  return order;
}

function getOrderById(id, userId) {
  const statement = db.prepare(`
    SELECT *
    FROM orders
    WHERE id = ? AND user_id = ?
  `);

  const row = statement.get(String(id), Number(userId));

  if (!row) {
    return undefined;
  }

  return {
    id: row.id,
    userId: row.user_id,
    items: JSON.parse(row.items),
    totalPriceToman: row.total_price_toman,
    status: row.status,
    createdAt: row.created_at,
  };
}

function getOrdersByUserId(userId) {
  const statement = db.prepare(`
    SELECT *
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `);

  const rows = statement.all(Number(userId));

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    items: JSON.parse(row.items),
    totalPriceToman: row.total_price_toman,
    status: row.status,
    createdAt: row.created_at,
  }));
}

module.exports = {
  saveOrder,
  getOrderById,
  getOrdersByUserId,
};
