// src/Pages/Admin/Payments/RentPayments.jsx
import { NavLink, Outlet } from "react-router-dom";
import { HiOutlineCurrencyDollar } from "react-icons/hi";

const Tab = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}
  >
    {label}
  </NavLink>
);

export default function RentPayments() {
  return (
    <>
      <div className="page-title">
        <HiOutlineCurrencyDollar className="text-amber-400" size={26} />
        <span>Rent Payments</span>
      </div>

      <div className="tabs">
        <Tab to="generate" label="Generate Rent Invoices" />
        <Tab to="invoices" label="Rent Invoices" />
        <Tab to="unpaid" label="Unpaid Invoices" />  
        <Tab to="receipts" label="Rent Receipts" />
      </div>

      <Outlet />
    </>
  );
}
