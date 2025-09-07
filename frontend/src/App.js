
// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Topbar from "./components/Layout/Topbar";
import Sidebar from "./components/Layout/Sidebar";
import RoleSwitcher from "./components/RoleSwitcher";

/* Tenant pages */
import TenantMenuPage from "./pages/Tenant/TenantMenuPage";
import TenantDashboard from "./pages/Tenant/TenantDashboard";
import TenantOrders from "./pages/Tenant/TenantOrders";
import TenantExpenses from "./pages/Tenant/TenantExpenses";

/* Supplier pages */
import SupplierLogin from "./pages/Supplier/SupplierLogin";
import SupplierDashboard from "./pages/Supplier/SupplierDashboard";
import SupplierMenuPage from "./pages/Supplier/SupplierMenuPage";
import SupplierAnalytics from "./pages/Supplier/SupplierAnalytics";

function AppShell({ children, role = "tenant" }) {
  return (
    <div className="app-shell">
      <Sidebar role={role} />
      <div style={{ flex: 1 }}>
        <div className="main">
          <Topbar />
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Default route */}
            <Route path="/" element={<Navigate to="/tenant/menu" replace />} />
            
            {/* Tenant Routes */}
            <Route path="/tenant/menu" element={
              <AppShell role="tenant">
                <TenantMenuPage />
              </AppShell>
            } />
            <Route path="/tenant/dashboard" element={
              <AppShell role="tenant">
                <TenantDashboard />
              </AppShell>
            } />
            <Route path="/tenant/orders" element={
              <AppShell role="tenant">
                <TenantOrders />
              </AppShell>
            } />
            <Route path="/tenant/expenses" element={
              <AppShell role="tenant">
                <TenantExpenses />
              </AppShell>
            } />

            {/* Supplier Routes */}
            <Route path="/supplier/login" element={<SupplierLogin />} />
            <Route path="/supplier/dashboard" element={
              <AppShell role="supplier">
                <SupplierDashboard />
              </AppShell>
            } />
            <Route path="/supplier/menu" element={
              <AppShell role="supplier">
                <SupplierMenuPage />
              </AppShell>
            } />
            <Route path="/supplier/analytics" element={
              <AppShell role="supplier">
                <SupplierAnalytics />
              </AppShell>
            } />

            {/* Catch all route */}
            <Route path="*" element={
              <div style={{ padding: 24 }}>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </Router>

        {/* 👇 Add this to quickly switch between tenant/supplier for testing */}
        <RoleSwitcher />
      </NotificationProvider>
    </AuthProvider>
  );
}
