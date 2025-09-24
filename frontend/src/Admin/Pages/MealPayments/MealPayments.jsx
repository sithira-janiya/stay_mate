// src/Pages/Admin/MealPayments/MealPayments.jsx
import { NavLink, Outlet } from "react-router-dom";
import { MdReceiptLong } from "react-icons/md";

const Tab = ({ to, label }) => (
  <NavLink to={to} className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}>
    {label}
  </NavLink>
);

export default function MealPayments() {
  return (
    <>
      <div className="page-title">
        <MdReceiptLong className="text-amber-400" size={26} />
        <span>Meal Payments</span>
      </div>

      <div className="tabs">
        <Tab to="invoices" label="Meal Invoices" />
        <Tab to="pay" label="Pay Invoice" />
        <Tab to="receipts" label="Receipts" />
      </div>

      <Outlet />
    </>
  );
}