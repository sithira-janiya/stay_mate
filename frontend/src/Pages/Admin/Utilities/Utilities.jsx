import { NavLink, Outlet } from "react-router-dom";
import { HiOutlineCog6Tooth } from "react-icons/hi2"; // icon for header (optional)

const Tab = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}
  >
    {label}
  </NavLink>
);

export default function Utilities() {
  return (
    <>
      {/* Page title */}
      <div className="page-title">
        <HiOutlineCog6Tooth className="text-amber-400" size={26} />
        <span>Utilities</span>
        <span className="page-subtle">Manage bills & payments</span>
      </div>

      {/* Horizontal sub-nav for Utilities */}
      <div className="tabs">
        <Tab to="bills" label="Bills" />
        <Tab to="payments" label="Make Payment" />
        <Tab to="records" label="Payment Records" />
      </div>

      {/* Active tab content renders here */}
      <Outlet />
    </>
  );
}
