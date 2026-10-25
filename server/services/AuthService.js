
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  createUser,
  getUserByEmail,
} = require("../repositories/UserRepository");

async function registerUser({ name, email, password }) {
  // 1. Validate input
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    const error = new Error(
      "Name, email, and password are required."
    );
    error.statusCode = 400;
    throw error;
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedName.length > 100) {
    const error = new Error("Name is too long.");
    error.statusCode = 400;
    throw error;
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    const error = new Error("Invalid email address.");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedEmail.length > 254) {
    const error = new Error("Email is too long.");
    error.statusCode = 400;
    throw error;
  }

  if (
    Buffer.byteLength(password, "utf8") > 72 ||
    password.length < 8
  ) {
    const error = new Error(
      "Password must be at least 8 characters and no more than 72 bytes."
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Check for an existing account
  if (getUserByEmail(normalizedEmail)) {
    const error = new Error(
      "An account with this email already exists."
    );
    error.statusCode = 409;
    throw error;
  }

  // 3. Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // 4. Save the user
  let user;

  try {
    user = createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      const duplicateError = new Error(
        "An account with this email already exists."
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }

  // 5. Create an authentication token
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const token = jwt.sign(
    { sub: String(user.id) },
    secret,
    { expiresIn: "7d" }
  );

  // 6. Return public user data and token
  return {
    user,
    token,
  };
}


async function loginUser({ email, password }) {
  // 1. Validate input
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 2. Find the user
  const user = getUserByEmail(normalizedEmail);

  // Use the same error for an unknown email or incorrect password
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 3. Verify the submitted password against the stored hash
  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // 4. Create a JWT
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const token = jwt.sign(
    { sub: String(user.id) },
    secret,
    { expiresIn: "7d" }
  );

  // 5. Return public user data, never the password hash
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

module.exports = {
  registerUser,
  loginUser,
};