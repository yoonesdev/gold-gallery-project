import { useState, useEffect } from "react";
import { AuthContext } from "./contexts";

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

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const login = (email) => {
    const fakeUser = {
      name: "کاربر تستی",
      email,
    };

    setUser(fakeUser);
  };

  const register = (name, email) => {
    const newUser = {
      name,
      email,
    };

    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
