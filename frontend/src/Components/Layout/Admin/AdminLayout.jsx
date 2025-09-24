// src/Components/Layout/Admin/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar"; // your teammate's file

export default function AdminLayout() {
  return (
    <div className="page-wrap">
      <div className="admin-shell">
        <Sidebar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}