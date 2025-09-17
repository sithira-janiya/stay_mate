// src/Pages/Admin/Payments/Payments.jsx
import { NavLink, Outlet } from "react-router-dom";
import { HiOutlineCurrencyDollar } from "react-icons/hi";

const tabLink = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `tab ${isActive ? "tab-active" : ""}`
    }
  >
    {label}
  </NavLink>
);

export default function Payments() {
  return (
    <>
      <div className="page-title">
        <HiOutlineCurrencyDollar className="text-amber-400" size={26} />
        <span>Payments</span>
      </div>

      {/* sub nav */}
      <div className="tabs">
        {tabLink({ to: "invoices", label: "Invoices" })}
        {tabLink({ to: "generate", label: "Generate" })}
        {tabLink({ to: "receipts", label: "Receipts" })}
      </div>

      {/* current tab content */}
      <Outlet />
    </>
  );
}
