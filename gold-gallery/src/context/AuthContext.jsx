
import { useState } from "react";
import { AuthContext } from "./contexts";

const API_BASE_URL = "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      console.error("Invalid user in localStorage");
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  const saveAuth = ({ user, token }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    setUser(user);
    setToken(token);
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed.");
    }

    saveAuth(result);
  };

  const register = async (name, email, password) => {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registration failed.");
    }

    saveAuth(result);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
