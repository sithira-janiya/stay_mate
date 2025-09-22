// src/Pages/Admin/Utilities/Utilities.jsx
import { NavLink, Outlet } from "react-router-dom";

const Tab = ({ to, children }) => (
  <NavLink to={to} className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}>
    {children}
  </NavLink>
);

export default function Utilities() {
  return (
    <>
      <div className="page-title">
        <span className="text-amber-400 text-2xl">⚙️</span>
        <span>Utilities</span>
      </div>

      <div className="tabs">
        <Tab to="bills">Bills</Tab>
        <Tab to="payments">Pay Bills</Tab>
        <Tab to="records">Records</Tab>
      </div>

      <Outlet />
    </>
  );
}
