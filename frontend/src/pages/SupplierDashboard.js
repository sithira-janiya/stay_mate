import React, { useEffect, useState } from "react";
import { fetchAnalytics } from "../api/api";

export default function SupplierDashboard() {
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    fetchAnalytics().then(res => setAnalytics(res.data));
  }, []);

  return (
    <div>
      <h2>Supplier Dashboard</h2>
      <p>Total Orders: {analytics.totalOrders}</p>
      <p>Total Revenue: ${analytics.totalRevenue?.[0]?.revenue || 0}</p>
      <h3>Feedback Sentiment</h3>
      {analytics.feedbackStats?.map(stat => (
        <p key={stat._id}>{stat._id}: {stat.count}</p>
      ))}
    </div>
  );
}
