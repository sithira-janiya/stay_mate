// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";

// Public
import HomePage from "./Pages/Home/HomePage";

// Admin shell
import AdminLayout from "./Components/Layout/Admin/AdminLayout";

// Admin pages
import Dashboard from "./Pages/Admin/Dashboard";

// Payments (rent) module
import Payments from "./Pages/Admin/Payments/Payments";
import InvoicesTab from "./Pages/Admin/Payments/InvoicesTab";
import GenerateTab from "./Pages/Admin/Payments/GenerateTab";
import ReceiptsTab from "./Pages/Admin/Payments/ReceiptsTab";

// 🔸 Utilities module (new 3-tab wrapper + tabs)
import Utilities from "./Pages/Admin/Utilities/Utilities";
import BillsTab from "./Pages/Admin/Utilities/BillsTab";
import PaymentsTab from "./Pages/Admin/Utilities/PaymentsTab";
import RecordsTab from "./Pages/Admin/Utilities/RecordsTab";

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

            {/* Payments (rent) */}
            <Route path="payments" element={<Payments />}>
              <Route index element={<Navigate to="invoices" replace />} />
              <Route path="invoices" element={<InvoicesTab />} />
              <Route path="generate" element={<GenerateTab />} />
              <Route path="receipts" element={<ReceiptsTab />} />
            </Route>

            {/* Utilities */}
            <Route path="utilities" element={<Utilities />}>
              <Route index element={<Navigate to="bills" replace />} />
              <Route path="bills" element={<BillsTab />} />
              <Route path="payments" element={<PaymentsTab />} />
              <Route path="records" element={<RecordsTab />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
