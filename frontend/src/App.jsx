import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext"; // <-- add this

import HomePage from "./Pages/Home/HomePage";
import AdminLayout from "./Components/Layout/Admin/AdminLayout";
import Dashboard from "./Pages/Admin/Dashboard";
import Payments from "./Pages/Admin/Payments/Payments";
import InvoicesTab from "./Pages/Admin/Payments/InvoicesTab";
import GenerateTab from "./Pages/Admin/Payments/GenerateTab";
import ReceiptsTab from "./Pages/Admin/Payments/ReceiptsTab";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />

          {/* Admin area */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="payments" element={<Payments />}>
              <Route index element={<Navigate to="invoices" replace />} />
              <Route path="invoices" element={<InvoicesTab />} />
              <Route path="generate" element={<GenerateTab />} />
              <Route path="receipts" element={<ReceiptsTab />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
