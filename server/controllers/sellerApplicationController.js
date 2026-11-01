
const {
  submitSellerApplication,
  getMySellerApplication,
} = require("../services/SellerApplicationService");

async function submitApplication(req, res) {
  try {
    const application = submitSellerApplication(
      req.userId,
      req.body,
    );

    return res.status(201).json({
      success: true,
      message: "Seller application submitted successfully.",
      data: application,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "You already have a pending seller application.",
      });
    }

    console.error("Seller application submission error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

function getMyApplication(req, res) {
  try {
    const application = getMySellerApplication(req.userId);

    return res.status(200).json({
      success: true,
      data: application || null,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get seller application error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = {
  submitApplication,
  getMyApplication,
};
