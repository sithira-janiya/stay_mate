//FinanceReports.jsx
import { NavLink, Outlet } from "react-router-dom";
import { HiOutlineDocumentReport } from "react-icons/hi";

const Tab = ({ to, label }) => (
  <NavLink to={to} className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}>
    {label}
  </NavLink>
);

export default function FinanceReports() {
  return (
    <>
      <div className="page-title">
        <HiOutlineDocumentReport className="text-amber-400" size={26} />
        <span>Finance Reports</span>
      </div>

      <div className="tabs">
        <Tab to="list" label="Reports List" />
        <Tab to="generate" label="Generate Report" />
      </div>

      <Outlet />
    </>
  );
}