
const {
  getSellerApplications,
  reviewSellerApplication,
} = require("../repositories/SellerApplicationRepository");

function validationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function getAllSellerApplications() {
  return getSellerApplications();
}

function reviewApplication(applicationId, adminId, data) {
  if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
    validationError("Invalid application ID.");
  }

  if (!Number.isSafeInteger(adminId) || adminId <= 0) {
    validationError("Valid admin account required.", 401);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    validationError("Invalid review data.");
  }

  const { decision, rejectionReason } = data;

  if (decision !== "approved" && decision !== "rejected") {
    validationError(
      'Decision must be either "approved" or "rejected".',
    );
  }

  let normalizedReason = null;

  if (decision === "rejected") {
    if (
      typeof rejectionReason !== "string" ||
      !rejectionReason.trim()
    ) {
      validationError("A rejection reason is required.");
    }

    normalizedReason = rejectionReason.trim();

    if (normalizedReason.length > 1000) {
      validationError(
        "Rejection reason must not exceed 1000 characters.",
      );
    }
  }

  return reviewSellerApplication({
    applicationId,
    adminId,
    decision,
    rejectionReason: normalizedReason,
  });
}

module.exports = {
  getAllSellerApplications,
  reviewApplication,
};
