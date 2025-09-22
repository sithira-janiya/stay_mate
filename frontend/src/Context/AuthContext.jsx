// src/Context/AuthContext.jsx
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Demo state: logged-in admin; change/null this as needed
  const [user, setUser] = useState({
    id: "demo-user-1",
    name: "user12345",
    role: "admin",
    avatar: "", // optional
  });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login: (u) => setUser(u),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
