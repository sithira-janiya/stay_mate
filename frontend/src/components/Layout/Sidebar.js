import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ role = "tenant" }) {
  return (
    <div className="sidebar">
      <div style={{ marginBottom: 20 }}>
        <strong>Navigation</strong>
      </div>

      {role === "tenant" ? (
        <>
          <div style={{ marginBottom: 8 }}><Link to="/tenant/menu">Menu & Order</Link></div>
          <div style={{ marginBottom: 8 }}><Link to="/tenant/orders">My Orders</Link></div>
          <div style={{ marginBottom: 8 }}><Link to="/tenant/expenses">Expenses</Link></div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}><Link to="/supplier/menu">Manage Menu</Link></div>
          <div style={{ marginBottom: 8 }}><Link to="/supplier/analytics">Analytics</Link></div>
          <div style={{ marginBottom: 8 }}><Link to="/supplier/feedback">Feedback</Link></div>
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <small style={{ color: "#6b7280" }}>StayMate v1.0</small>
      </div>
    </div>
  );
}
