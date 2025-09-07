import React, { useEffect, useState } from "react";
import { fetchSupplierMeals } from "../../api/api";
import AddMealForm from "../../components/forms/AddMealForm";

export default function SupplierMenuPage(){
  const [meals, setMeals] = useState([]);
  useEffect(()=>{ load(); },[]);
  const load = async()=>{ const r = await fetchSupplierMeals(); setMeals(r.data||[]); };
  return (<div><h2>Manage Menu</h2><AddMealForm onAdded={(m)=>setMeals(prev=>[...prev,m])} /><div className="card"><table className="table"><thead><tr><th>Name</th><th>Type</th><th>Price</th></tr></thead><tbody>{meals.map(m=><tr key={m._id}><td>{m.name}</td><td>{m.type}</td><td>₱{Number(m.price).toFixed(2)}</td></tr>)}</tbody></table></div></div>);
}
