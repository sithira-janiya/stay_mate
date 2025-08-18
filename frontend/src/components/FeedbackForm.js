import React, { useState } from "react";
import { addFeedback } from "../api/api";
import { useNotifications } from "../context/NotificationContext";

export default function FeedbackForm({ orderId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { push } = useNotifications();

  const submit = async (e) => {
    e.preventDefault();
    await addFeedback({ orderId, rating, comment });
    push("Thanks for your feedback!", "feedback");
    setComment("");
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8 }}>
      <label>
        Rating:{" "}
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <textarea placeholder="Any comments?" value={comment} onChange={e => setComment(e.target.value)} />
      <button type="submit">Submit Feedback</button>
    </form>
  );
}
