import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext"; // <-- add this

import HomePage from "./Pages/Home/HomePage";
import AdminLayout from "./Components/Layout/Admin/AdminLayout";
import Dashboard from "./Pages/Admin/Dashboard";
import Payments from "./Pages/Admin/Payments/Payments";
import InvoicesTab from "./Pages/Admin/Payments/InvoicesTab";
import GenerateTab from "./Pages/Admin/Payments/GenerateTab";
import ReceiptsTab from "./Pages/Admin/Payments/ReceiptsTab";
import UtilitiesTab from "./Pages/Admin/Payments/UtilitiesTab";



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

            {/* Payments module */}
            <Route path="payments" element={<Payments />}>
              <Route index element={<Navigate to="invoices" replace />} />
              <Route path="invoices" element={<InvoicesTab />} />
              <Route path="generate" element={<GenerateTab />} />
              <Route path="receipts" element={<ReceiptsTab />} />
            </Route>

            

            {/* Utilities module */}
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
