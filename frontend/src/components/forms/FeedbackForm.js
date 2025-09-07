// frontend/src/components/Supplier/FeedbackList.js
import React, { useState } from "react";
import { addFeedback } from "../../api/api";

export default function FeedbackForm({ orderId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await addFeedback({ order: orderId, rating, comment });
    alert("Feedback submitted");
    setComment("");
    onSubmitted && onSubmitted();
  };

  return (
    <form onSubmit={submit} style={{ display:"grid", gap:8 }}>
      <label>Rating
        <select value={rating} onChange={e=>setRating(Number(e.target.value))}>
          {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <label>Comment <textarea value={comment} onChange={e=>setComment(e.target.value)} /></label>
      <button className="btn" type="submit">Submit</button>
    </form>
  );
}
