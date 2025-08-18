import React, { useEffect, useMemo, useState } from "react";
import { fetchMenu, placeOrder } from "../api/api";
import MenuList from "../components/MenuList";
import { useNotifications } from "../context/NotificationContext";

// TEMP: mock tenant from Registration module (replace with real auth/user context)
const mockTenant = {
  _id: "TENANT123",
  name: "Alex Tenant",
  allergies: ["peanut", "dairy"],
};

export default function TenantDashboard() {
  const [menu, setMenu] = useState([]);
  const [selected, setSelected] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { push } = useNotifications();

  useEffect(() => {
    fetchMenu().then(res => setMenu(res.data));
  }, []);

  const selectedMeals = useMemo(
    () => menu.filter(m => selected.includes(m._id)),
    [menu, selected]
  );

  const allergenHits = useMemo(() => {
    const aSet = mockTenant.allergies.map(x => x.toLowerCase());
    return selectedMeals.filter(m => (m.allergens || []).some(al => aSet.includes(al.toLowerCase())));
  }, [selectedMeals]);

  const total = selectedMeals.reduce((s, m) => s + m.price, 0);

  const submitOrder = async () => {
    const res = await placeOrder({ tenantId: mockTenant._id, mealIds: selected });
    push("Order placed successfully!", "order");
    setSelected([]);
    setConfirmOpen(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>Today's Menu</h2>
      </div>

      <MenuList
        meals={menu}
        selected={selected}
        setSelected={setSelected}
        tenantAllergies={mockTenant.allergies}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: 12, borderTop: "1px dashed #eee", marginTop: 12 }}>
        <div><strong>Total:</strong> ₱{total.toFixed(2)}</div>
        <button
          disabled={selected.length === 0}
          onClick={() => setConfirmOpen(true)}
          style={{ padding: "10px 18px" }}
        >
          Proceed to Confirm
        </button>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "grid", placeItems: "center" }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 20, width: 520 }}>
            <h3>Confirm Your Order</h3>
            {allergenHits.length > 0 && (
              <div style={{ background: "#fff3cd", color: "#664d03", padding: 10, borderRadius: 6, marginBottom: 10 }}>
                ⚠ We found allergens in:{" "}
                <strong>{allergenHits.map(m => m.name).join(", ")}</strong>
              </div>
            )}
            <ul>
              {selectedMeals.map(m => (<li key={m._id}>{m.name} — ₱{m.price.toFixed(2)}</li>))}
            </ul>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button onClick={submitOrder} style={{ background: "#111", color: "#fff", padding: "8px 14px" }}>
                Confirm & Place (₱{total.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
