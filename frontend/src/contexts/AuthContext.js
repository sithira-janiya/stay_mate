// src/contexts/AuthContext.js
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 🔹 Default mock user (role can be "tenant" or "supplier")
  const [user, setUser] = useState({
    _id: "mock-user-id-123",
    fullName: "Test User",
    email: "test@example.com",
    role: "tenant", // change to "supplier" if you want to test supplier pages
    allergies: ["peanuts", "shellfish"],
    dietaryPreference: "non-vegetarian",
  });

  const [token, setToken] = useState("mock-token-123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Fake login (switches role based on email)
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          _id: "mock-user-id-123",
          fullName: "Test User",
          email: email || "test@example.com",
          role: email && email.includes("supplier") ? "supplier" : "tenant",
          allergies: ["peanuts"],
          dietaryPreference: "non-vegetarian",
        };

        setUser(mockUser);
        setToken("mock-token-123");
        setLoading(false);

        resolve({ success: true });
      }, 1000); // simulate API delay
    });
  };

  // 🔹 Fake logout (resets back to tenant user instead of clearing)
  const logout = () => {
    const mockUser = {
      _id: "mock-user-id-123",
      fullName: "Test User",
      email: "test@example.com",
      role: "tenant",
      allergies: ["peanuts"],
      dietaryPreference: "non-vegetarian",
    };

    setUser(mockUser);
    setToken("mock-token-123");
  };

  // 🔹 Mock refresh
  const refreshUserData = async () => {
    return true;
  };

  // 🔹 Update user locally
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        error,
        refreshUserData,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
