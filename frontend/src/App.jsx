import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import './App.css';

// Admin Components
import AdminLayout from './Admin/Components/AdminLayout';
import Dashboard from './Admin/Pages/Dashboard';
import PropertyList from './Admin/Pages/Properties/PropertyList';
import RoomList from './Admin/Pages/Properties/RoomList';
import RoomDetails from './Admin/Pages/Rooms/RoomDetails';
import RoomRequestList from './Admin/Pages/Requests/RoomRequestList';
import RoomRequestDetail from './Admin/Pages/Requests/RoomRequestDetail';
import TransferRequestList from './Admin/Pages/Requests/TransferRequestList';
import TransferRequestDetail from './Admin/Pages/Requests/TransferRequestDetail';
import MoveOutRequestList from './Admin/Pages/Requests/MoveOutRequestList';
import MoveOutRequestDetail from './Admin/Pages/Requests/MoveOutRequestDetail';
import AttendanceDashboard from './Admin/Pages/Attendance/AttendanceDashboard';
import UtilitySettingsPage from './Admin/Pages/Attendance/UtilitySettingsPage';
import TenantAttendanceDetail from './Admin/Pages/Attendance/TenantAttendanceDetail';

// Rent Payments
import Payments from './Admin/Pages/Payments/RentPayments';
import RentInvoicesTab from './Admin/Pages/Payments/RentInvoicesTab';
import RentGenerateTab from './Admin/Pages/Payments/RentGenerateTab';
import RentReceiptsTab from './Admin/Pages/Payments/RentReceiptsTab';

// Utilities
import Utilities from './Admin/Pages/Utilities/Utilities';
import UtilityBillsTab from './Admin/Pages/Utilities/UtilityBillsTab';
import UtilityPaymentsTab from './Admin/Pages/Utilities/UtilityPaymentsTab';
import UtilityRecordsTab from './Admin/Pages/Utilities/UtilityRecordsTab';

// Meal Payments
import MealPayments from './Admin/Pages/MealPayments/MealPayments';
import MealInvoicesTab from './Admin/Pages/MealPayments/MealInvoicesTab';
import MealPayTab from './Admin/Pages/MealPayments/MealPayTab';
import MealReceiptsTab from './Admin/Pages/MealPayments/MealReceiptsTab';

// Finance Reports
import FinanceReports from './Admin/Pages/FinanceReports/FinanceReports';
import FinanceListTab from './Admin/Pages/FinanceReports/FinanceListTab';
import FinanceGenerateTab from './Admin/Pages/FinanceReports/FinanceGenerateTab';
import FinanceDetailTab from './Admin/Pages/FinanceReports/FinanceDetailTab';

// Feedback
import FeedbackList from './Admin/Pages/Feedback/FeedbackList';
import FeedbackDetail from './Admin/Pages/Feedback/FeedbackDetail';
import FeedbackStatistics from './Admin/Pages/Feedback/FeedbackStatistics';

// Meal Management
import MealsList from './Admin/Pages/Meals/MealsList';
import OrdersList from './Admin/Pages/Orders/OrdersList';

// User Components
import MealBrowsePage from './Pages/Tenant/MealBrowsePage';
import MealCheckoutPage from './Pages/Tenant/MealCheckoutPage';
import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';
import HomePage from './Pages/Home/HomePage';
import PropertyListingPage from './Pages/Properties/PropertyListingPage';
import PropertyDetailPage from './Pages/Properties/PropertyDetailPage';
import RoomListingPage from './Pages/Rooms/RoomListingPage';
import RoomDetailPage from './Pages/Rooms/RoomDetailPage';
import RoomRequestForm from './Pages/Rooms/RoomRequestForm';
import MyRoomPage from './Pages/Tenant/MyRoomPage';
import RegisterPage from './Pages/User/RegisterPage';
import ResetPassword from './Pages/User/ResetPassword';

// Supplier
import SupplierDashboard from './Supplier/Pages/Dashboard/SupplierDashboard';
import LoginPage from './Pages/User/LoginPage';

// Admin User Management
import UserManagement from './Admin/Pages/Users/UserManagement';
import UserProfile from './Pages/User/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<PropertyList />} />
            <Route path="properties/:propertyId/rooms" element={<RoomList />} />
            <Route path="rooms/:roomId" element={<RoomDetails />} />
            <Route path="requests/room" element={<RoomRequestList />} />
            <Route path="requests/room/:id" element={<RoomRequestDetail />} />
            <Route path="requests/transfer" element={<TransferRequestList />} />
            <Route path="requests/transfer/:id" element={<TransferRequestDetail />} />
            <Route path="requests/moveout" element={<MoveOutRequestList />} />
            <Route path="requests/moveout/:id" element={<MoveOutRequestDetail />} />
            <Route path="attendance" element={<AttendanceDashboard />} />
            <Route path="attendance/settings" element={<UtilitySettingsPage />} />
            <Route path="attendance/:tenantId" element={<TenantAttendanceDetail />} />

            {/* Feedback */}
            <Route path="feedback" element={<FeedbackList />} />
            <Route path="feedback/statistics" element={<FeedbackStatistics />} />
            <Route path="feedback/:id" element={<FeedbackDetail />} />

            {/* Meal Management */}
            <Route path="meals" element={<MealsList />} />
            <Route path="orders" element={<OrdersList />} />

            {/* User Management */}
            <Route path="users" element={<UserManagement />} />

            {/* Rent Payments */}
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

            {/* Meal Payments */}
            <Route path="meal-payments" element={<MealPayments />}>
              <Route index element={<Navigate to="invoices" replace />} />
              <Route path="invoices" element={<MealInvoicesTab />} />
              <Route path="pay" element={<MealPayTab />} />
              <Route path="receipts" element={<MealReceiptsTab />} />
            </Route>

            {/* Finance Reports */}
            <Route path="finance-reports" element={<FinanceReports />}>
              <Route index element={<Navigate to="list" replace />} />
              <Route path="list" element={<FinanceListTab />} />
              <Route path="generate" element={<FinanceGenerateTab />} />
              <Route path=":id" element={<FinanceDetailTab />} />
            </Route>
          </Route>

          {/* User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertyListingPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/rooms" element={<RoomListingPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/rooms/:id/request" element={<RoomRequestForm />} />
          <Route path="/account/room" element={<MyRoomPage />} />
          <Route path="/account/meals" element={<MealBrowsePage />} />
          <Route path="/account/meals/checkout" element={<MealCheckoutPage />} />
          <Route path="/account/reset-password" element={<ResetPassword />} />

          {/* Supplier */}
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />

          {/* Auth */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account/profile" element={<UserProfile />} />

          {/* 404 */}
          <Route path="*" element={<div className="text-center p-20 text-gray-800">404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
