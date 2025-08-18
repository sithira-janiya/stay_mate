import React from "react";

const Pill = ({ children, color = "#eee" }) => (
  <span style={{ padding: "2px 8px", borderRadius: 12, background: color, marginRight: 6, fontSize: 12 }}>
    {children}
  </span>
);

export default function MenuList({ meals, selected, setSelected, tenantAllergies = [] }) {
  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const hasAllergen = (meal) =>
    (meal.allergens || []).some(a => tenantAllergies.map(s => s.toLowerCase()).includes(a.toLowerCase()));

  const grouped = meals.reduce((acc, m) => {
    acc[m.type] = acc[m.type] || [];
    acc[m.type].push(m);
    return acc;
  }, {});

  return (
    <div>
      {["breakfast","lunch","dinner","dessert"].map(type => (
        <div key={type} style={{ marginBottom: 18 }}>
          <h3 style={{ textTransform: "capitalize" }}>{type}</h3>
          {(grouped[type] || []).map(meal => {
            const danger = hasAllergen(meal);
            return (
              <label key={meal._id}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: 10,
                         border: "1px solid #eee", borderRadius: 8, marginBottom: 8,
                         background: danger ? "#fff5f5" : "#fff" }}>
                <input
                  type="checkbox"
                  checked={selected.includes(meal._id)}
                  onChange={() => toggle(meal._id)}
                  disabled={!meal.available}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{meal.name} {meal.vegetarian ? "🥦" : "🍗"}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {meal.allergens?.length ? meal.allergens.join(", ") : "No listed allergens"}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {meal.vegetarian && <Pill color="#e8f5e9">Vegetarian</Pill>}
                    {danger && <Pill color="#ffebee">⚠ Allergen</Pill>}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>₱{meal.price.toFixed(2)}</div>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}
