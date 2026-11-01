
const {
  getAllSellerApplications,
  reviewApplication,
} = require("../services/AdminSellerApplicationService");

function getApplications(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: getAllSellerApplications(),
    });
  } catch (error) {
    console.error("Get seller applications error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

function review(req, res) {
  try {
    const applicationId = Number(req.params.id);

    const application = reviewApplication(
      applicationId,
      req.userId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: `Seller application ${application.status}.`,
      data: application,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Review seller application error:", error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = {
  getApplications,
  review,
};
