// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";

// Public
import HomePage from "./Pages/Home/HomePage";

// Admin shell
import AdminLayout from "./Components/Layout/Admin/AdminLayout";

// Admin pages
import Dashboard from "./Pages/Admin/Dashboard";

//Admin Payments (rent) module
import Payments from "./Pages/Admin/Payments/RentPayments";
import RentInvoicesTab from "./Pages/Admin/Payments/RentInvoicesTab";
import RentGenerateTab from "./Pages/Admin/Payments/RentGenerateTab";
import RentReceiptsTab from "./Pages/Admin/Payments/RentReceiptsTab";

//Admin Utilities module 
import Utilities from "./Pages/Admin/Utilities/Utilities";
import UtilityBillsTab from "./Pages/Admin/Utilities/UtilityBillsTab";
import UtilityPaymentsTab from "./Pages/Admin/Utilities/UtilityPaymentsTab";
import UtilityRecordsTab from "./Pages/Admin/Utilities/UtilityRecordsTab";

//Admin MealPayments module
import MealPayments from "./Pages/Admin/MealPayments/MealPayments";
import MealInvoicesTab from "./Pages/Admin/MealPayments/MealInvoicesTab";
import MealPayTab from "./Pages/Admin/MealPayments/MealPayTab";
import MealReceiptsTab from "./Pages/Admin/MealPayments/MealReceiptsTab";

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
              <Route path="invoices" element={<RentInvoicesTab />} />
              <Route path="generate" element={<RentGenerateTab />} />
              <Route path="receipts" element={<RentReceiptsTab />} />
            </Route>

            {/* Utilities */}
            <Route path="utilities" element={<Utilities />}>
              <Route index element={<Navigate to="bills" replace />} />
              <Route path="bills" element={<UtilityBillsTab />} />
              <Route path="payments" element={<UtilityPaymentsTab />} />
              <Route path="records" element={<UtilityRecordsTab />} />
            </Route>
          

          <Route path="meal-payments" element={<MealPayments />}>
            <Route index element={<Navigate to="invoices" replace />} />
            <Route path="invoices" element={<MealInvoicesTab />} />
            <Route path="pay" element={<MealPayTab />} />
            <Route path="receipts" element={<MealReceiptsTab />} />
          </Route>
        </Route>
          

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
