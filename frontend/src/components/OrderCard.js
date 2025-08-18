import React, { useState } from "react";
import FeedbackForm from "./FeedbackForm";

export default function OrderCard({ order }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const canFeedback = order.status === "delivered";

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>Order #{order._id.slice(-6)}</div>
          <div style={{ fontSize: 13, color: "#666" }}>{new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <span style={{
            padding: "2px 10px", borderRadius: 999,
            background: order.status === "delivered" ? "#e8f5e9" :
                        order.status === "out for delivery" ? "#e3f2fd" : "#fff3e0"
          }}>
            {order.status}
          </span>
        </div>
      </div>
      <ul style={{ marginTop: 8 }}>
        {order.meals.map(m => <li key={m._id}>{m.name} — ₱{m.price.toFixed(2)} <i style={{ color: "#666" }}>({m.type})</i></li>)}
      </ul>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
        <strong>Total: ₱{order.totalCost.toFixed(2)}</strong>
        {canFeedback && (
          <button onClick={() => setShowFeedback(v => !v)}>
            {showFeedback ? "Close Feedback" : "Leave Feedback"}
          </button>
        )}
      </div>
      {showFeedback && <div style={{ marginTop: 10 }}><FeedbackForm orderId={order._id} onSubmitted={() => setShowFeedback(false)} /></div>}
    </div>
  );
}
