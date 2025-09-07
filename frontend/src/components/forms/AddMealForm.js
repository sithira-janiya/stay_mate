// frontend/src/components/Supplier/AddMealForm.js
import React, { useState } from "react";
import { createMeal } from "../../api/api";

export default function AddMealForm({ onAdded }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("breakfast");
  const [price, setPrice] = useState("");
  const [ingredients, setIngredients] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const payload = { name, type, price: Number(price), ingredients: ingredients.split(",").map(s=>s.trim()).filter(Boolean) };
    const res = await createMeal(payload);
    onAdded && onAdded(res.data);
    setName(""); setPrice(""); setIngredients("");
    alert("Meal added");
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 12 }}>
      <div style={{ display:"grid", gap:8 }}>
        <label>Name <input value={name} onChange={e=>setName(e.target.value)} required /></label>
        <label>Type <select value={type} onChange={e=>setType(e.target.value)}><option>breakfast</option><option>lunch</option><option>dinner</option><option>dessert</option></select></label>
        <label>Ingredients <input value={ingredients} placeholder="comma separated" onChange={e=>setIngredients(e.target.value)} /></label>
        <label>Price <input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required /></label>
        <div><button className="btn" type="submit">Add Meal</button></div>
      </div>
    </form>
  );
}
