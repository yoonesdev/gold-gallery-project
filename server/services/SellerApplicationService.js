
const {
  createSellerApplication,
  getSellerApplicationByUserId,
} = require("../repositories/SellerApplicationRepository");

function validationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function submitSellerApplication(userId, applicationData) {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    validationError("Valid authenticated user required.", 401);
  }

  if (
    !applicationData ||
    typeof applicationData !== "object" ||
    Array.isArray(applicationData)
  ) {
    validationError("Invalid application data.");
  }

  const { shopName, city, phone, description } = applicationData;

  const fields = {
    shopName,
    city,
    phone,
    description,
  };

  for (const [field, value] of Object.entries(fields)) {
    if (typeof value !== "string" || !value.trim()) {
      validationError(`${field} is required.`);
    }
  }

  const normalizedData = {
    shopName: shopName.trim(),
    city: city.trim(),
    phone: phone.trim(),
    description: description.trim(),
  };

  if (normalizedData.shopName.length > 100) {
    validationError("Shop name must not exceed 100 characters.");
  }

  if (normalizedData.city.length > 100) {
    validationError("City must not exceed 100 characters.");
  }

  if (normalizedData.phone.length > 30) {
    validationError("Phone number must not exceed 30 characters.");
  }

  if (normalizedData.description.length > 1000) {
    validationError("Description must not exceed 1000 characters.");
  }

  const existingApplication = getSellerApplicationByUserId(userId);

  if (existingApplication?.status === "pending") {
    validationError(
      "You already have a pending seller application.",
      409,
    );
  }

  return createSellerApplication({
    userId,
    ...normalizedData,
  });
}

function getMySellerApplication(userId) {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    validationError("Valid authenticated user required.", 401);
  }

  return getSellerApplicationByUserId(userId);
}

module.exports = {
  submitSellerApplication,
  getMySellerApplication,
};
