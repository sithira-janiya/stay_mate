import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import NotificationBell from "../NotificationBell";

export default function Topbar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>StayMate</h2>
        <div style={{ color: "#6b7280" }}>Meal Planner</div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <NotificationBell />
        {user ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ color: "#374151" }}>{user.fullName}</div>
            <button className="btn secondary" onClick={logout}>Logout</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
