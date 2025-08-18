import React, { useEffect, useState } from "react";
import { createMeal, fetchMenu, updateMeal, cancelMeal, deleteMeal } from "../api/api";
import { useNotifications } from "../context/NotificationContext";

const emptyForm = { name: "", type: "breakfast", vegetarian: false, allergens: "", price: 0 };

export default function SupplierMenuPage() {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const { push } = useNotifications();

  const load = () => fetchMenu().then(res => setMeals(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      type: form.type,
      vegetarian: form.vegetarian,
      allergens: form.allergens.split(",").map(s => s.trim()).filter(Boolean),
      price: Number(form.price)
    };
    if (editingId) {
      await updateMeal(editingId, payload);
      push("Meal updated", "menu");
    } else {
      await createMeal(payload);
      push("Meal created", "menu");
    }
    setForm(emptyForm); setEditingId(null);
    load();
  };

  const onEdit = (m) => {
    setEditingId(m._id);
    setForm({
      name: m.name, type: m.type, vegetarian: m.vegetarian,
      allergens: (m.allergens || []).join(", "), price: m.price
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 16 }}>
      <h2>Supplier — Manage Daily Menu</h2>

      <form onSubmit={submit} style={{ display: "grid", gap: 8, border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 140px 1fr 120px", gap: 8 }}>
          <input placeholder="Meal name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {["breakfast","lunch","dinner","dessert"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={form.vegetarian} onChange={e => setForm({ ...form, vegetarian: e.target.checked })} /> Veg
          </label>
          <input placeholder="Allergens (comma-separated)" value={form.allergens} onChange={e => setForm({ ...form, allergens: e.target.value })} />
          <input type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editingId ? "Update Meal" : "Add Meal"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel Edit</button>}
        </div>
      </form>

      <div style={{ border: "1px solid #eee", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={{ textAlign: "left", padding: 8 }}>Name</th>
              <th>Type</th>
              <th>Veg</th>
              <th>Allergens</th>
              <th>Price</th>
              <th>Available</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meals.map(m => (
              <tr key={m._id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{m.name}</td>
                <td style={{ textTransform: "capitalize", textAlign: "center" }}>{m.type}</td>
                <td style={{ textAlign: "center" }}>{m.vegetarian ? "Yes" : "No"}</td>
                <td style={{ fontSize: 12, color: "#666", textAlign: "center" }}>{(m.allergens || []).join(", ") || "—"}</td>
                <td style={{ textAlign: "right" }}>₱{m.price?.toFixed(2)}</td>
                <td style={{ textAlign: "center" }}>{m.available ? "✅" : "❌"}</td>
                <td style={{ textAlign: "center" }}>
                  <button onClick={() => onEdit(m)}>Edit</button>{" "}
                  {m.available ? <button onClick={async () => { await cancelMeal(m._id); push("Meal canceled", "menu"); load(); }}>Cancel</button> : null}{" "}
                  <button onClick={async () => { await deleteMeal(m._id); push("Meal deleted", "menu"); load(); }} style={{ color: "#b71c1c" }}>Delete</button>
                </td>
              </tr>
            ))}
            {meals.length === 0 && (
              <tr><td colSpan="7" style={{ padding: 12, textAlign: "center", color: "#777" }}>No meals yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
