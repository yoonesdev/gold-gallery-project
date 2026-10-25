
const {
  registerUser,
  loginUser,
} = require("../services/AuthService");

async function register(req, res) {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      message: "Registration successful.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred.",
    });
  }
}


async function login(req, res) {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      message: "Login successful.",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      message: "An unexpected error occurred.",
    });
  }
}

module.exports = {
  register,
  login,
};