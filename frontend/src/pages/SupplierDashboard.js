import React, { useEffect, useState } from "react";
import { fetchAnalytics } from "../api/api";
import AnnouncementPanel from "../components/AnnouncementPanel";
import ChatWindow from "../components/ChatWindow";

export default function SupplierDashboard() {
  const [analytics, setAnalytics] = useState({});
  useEffect(() => { fetchAnalytics().then(res => setAnalytics(res.data)); }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Supplier Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3>Totals</h3>
          <p>Total Orders: {analytics.totalOrders}</p>
          <p>Total Revenue: ₱{analytics.totalRevenue?.[0]?.revenue?.toFixed?.(2) || 0}</p>
        </div>
        <AnnouncementPanel />
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        <h3>Direct Chat (sample tenant thread)</h3>
        {/* In a real app you'd select a tenant from a list of active chats */}
        <ChatWindow role="supplier" tenantId="TENANT123" displayName="Supplier" />
      </div>
    </div>
  );
}
