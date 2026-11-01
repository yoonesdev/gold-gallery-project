
const db = require("../database/database");

function createSellerApplication({
  userId,
  shopName,
  city,
  phone,
  description,
}) {
  const statement = db.prepare(`
    INSERT INTO seller_applications (
      user_id,
      shop_name,
      city,
      phone,
      description,
      submitted_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    userId,
    shopName,
    city,
    phone,
    description,
    new Date().toISOString(),
  );

  return getSellerApplicationById(
    Number(result.lastInsertRowid),
  );
}

function getSellerApplicationById(applicationId) {
  const statement = db.prepare(`
    SELECT
      sa.*,
      u.name AS applicant_name,
      u.email AS applicant_email
    FROM seller_applications AS sa
    JOIN users AS u ON u.id = sa.user_id
    WHERE sa.id = ?
  `);

  return statement.get(applicationId);
}

function getSellerApplicationByUserId(userId) {
  const statement = db.prepare(`
    SELECT *
    FROM seller_applications
    WHERE user_id = ?
    ORDER BY submitted_at DESC
    LIMIT 1
  `);

  return statement.get(userId);
}

function getSellerApplications() {
  const statement = db.prepare(`
    SELECT
      sa.*,
      u.name AS applicant_name,
      u.email AS applicant_email
    FROM seller_applications AS sa
    JOIN users AS u ON u.id = sa.user_id
    ORDER BY sa.submitted_at DESC
  `);

  return statement.all();
}

function reviewSellerApplication({
  applicationId,
  adminId,
  decision,
  rejectionReason = null,
}) {
  const reviewTransaction = db.transaction(() => {
    const application = getSellerApplicationById(applicationId);

    if (!application) {
      const error = new Error("Seller application not found.");
      error.statusCode = 404;
      throw error;
    }

    if (application.status !== "pending") {
      const error = new Error(
        "This application has already been reviewed.",
      );
      error.statusCode = 409;
      throw error;
    }

    const reviewedAt = new Date().toISOString();

    if (decision === "approved") {
      const createShop = db.prepare(`
        INSERT INTO shops (
          owner_user_id,
          application_id,
          shop_name,
          city,
          phone,
          description,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      createShop.run(
        application.user_id,
        application.id,
        application.shop_name,
        application.city,
        application.phone,
        application.description,
        reviewedAt,
        reviewedAt,
      );
    }

    const updateApplication = db.prepare(`
      UPDATE seller_applications
      SET
        status = ?,
        reviewed_at = ?,
        reviewed_by = ?,
        rejection_reason = ?
      WHERE id = ? AND status = 'pending'
    `);

    const result = updateApplication.run(
      decision,
      reviewedAt,
      adminId,
      decision === "rejected" ? rejectionReason : null,
      applicationId,
    );

    if (result.changes !== 1) {
      const error = new Error(
        "This application has already been reviewed.",
      );
      error.statusCode = 409;
      throw error;
    }

    return getSellerApplicationById(applicationId);
  });

  return reviewTransaction();
}

module.exports = {
  createSellerApplication,
  getSellerApplicationById,
  getSellerApplicationByUserId,
  getSellerApplications,
  reviewSellerApplication,
};
