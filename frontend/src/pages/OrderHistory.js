import React, { useEffect, useMemo, useState } from "react";
import { fetchTenantExpenses, fetchTenantOrders } from "../api/api";
import OrderCard from "../components/OrderCard";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

// register chart.js bits
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// TEMP: replace with real user context
const TENANT_ID = "TENANT123";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState(null);

  useEffect(() => {
    fetchTenantOrders(TENANT_ID).then(res => setOrders(res.data));
    fetchTenantExpenses(TENANT_ID).then(res => setExpenses(res.data));
  }, []);

  const totalSpent = useMemo(() => expenses?.overall || 0, [expenses]);

  const doughnutData = useMemo(() => ({
    labels: ["Breakfast", "Lunch", "Dinner", "Dessert"],
    datasets: [{
      label: "₱",
      data: expenses ? [expenses.breakfast, expenses.lunch, expenses.dinner, expenses.dessert] : [0,0,0,0],
      backgroundColor: ["#FFCE56", "#36A2EB", "#FF6384", "#9CCC65"]
    }]
  }), [expenses]);

  const barData = useMemo(() => {
    const byDate = {};
    orders.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString();
      byDate[d] = (byDate[d] || 0) + o.totalCost;
    });
    const labels = Object.keys(byDate);
    const values = labels.map(l => byDate[l]);
    return {
      labels,
      datasets: [{ label: "Daily Spend (₱)", data: values, backgroundColor: "#90CAF9" }]
    };
  }, [orders]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: 16 }}>
      <h2>Order History & Expenses</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3>Expense Breakdown (by meal type)</h3>
          <Doughnut data={doughnutData} />
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
          <h3>Daily Spend</h3>
          <Bar data={barData} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Orders</h3>
        <div><strong>Total spent:</strong> ₱{totalSpent.toFixed(2)}</div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {orders.map(o => <OrderCard key={o._id} order={o} />)}
        {orders.length === 0 && <div>No orders yet.</div>}
      </div>
    </div>
  );
}
