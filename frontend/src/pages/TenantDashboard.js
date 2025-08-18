import React, { useEffect, useState } from "react";
import { fetchMenu, placeOrder } from "../api/api";

export default function TenantDashboard() {
  const [menu, setMenu] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);

  useEffect(() => {
    fetchMenu().then(res => setMenu(res.data));
  }, []);

  const handleOrder = async () => {
    const res = await placeOrder({ tenantId: "TENANT123", mealIds: selectedMeals });
    alert("Order placed successfully!");
  };

  return (
    <div>
      <h2>Today's Menu</h2>
      {menu.map(meal => (
        <div key={meal._id}>
          <input type="checkbox" value={meal._id}
            onChange={(e) => setSelectedMeals([...selectedMeals, e.target.value])} />
          {meal.name} - ${meal.price}
        </div>
      ))}
      <button onClick={handleOrder}>Place Order</button>
    </div>
  );
}
