import React, { useEffect, useMemo, useState } from "react";
import { fetchAnalytics } from "../api/api";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { fetchAnalytics().then(res => setData(res.data)); }, []);

  const sentimentChart = useMemo(() => {
    const stats = data?.feedbackStats || [];
    const labels = stats.map(s => s._id);
    const counts = stats.map(s => s.count);
    return {
      labels,
      datasets: [{ data: counts, backgroundColor: ["#66BB6A","#FFA726","#EF5350"] }]
    };
  }, [data]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Supplier Analytics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3>Totals</h3>
          <p><strong>Orders:</strong> {data?.totalOrders ?? 0}</p>
          <p><strong>Revenue:</strong> ₱{(data?.totalRevenue?.[0]?.revenue || 0).toFixed(2)}</p>
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3>Feedback Sentiment</h3>
          <Doughnut data={sentimentChart} />
        </div>
      </div>
    </div>
  );
}
