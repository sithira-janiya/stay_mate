import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import TenantDashboard from "./pages/TenantDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import AnalyticsPage from "./pages/AnalyticsPage";
import OrderHistory from "./pages/OrderHistory";
import NotificationBell from "./components/NotificationBell";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <header style={{ display: "flex", gap: 16, alignItems: "center", padding: 12, borderBottom: "1px solid #eee" }}>
          <Link to="/">Tenant</Link>
          <Link to="/orders">Order History</Link>
          <Link to="/supplier">Supplier</Link>
          <Link to="/analytics">Analytics</Link>
          <div style={{ marginLeft: "auto" }}>
            <NotificationBell />
          </div>
        </header>
        <main style={{ padding: 16 }}>
          <Routes>
            <Route path="/" element={<TenantDashboard />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/supplier" element={<SupplierDashboard />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </NotificationProvider>
  );
}
