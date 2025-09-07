// frontend/src/pages/TenantOrderPage.js
import React, { useEffect, useState } from "react";
import { fetchTenantOrders } from "../../api/api";
import OrderCard from "../../components/OrderCard";

export default function TenantOrders(){
  const [orders, setOrders] = useState([]);
  useEffect(()=>{ fetchTenantOrders().then(r=>setOrders(r.data)).catch(console.error); },[]);
  return (<div><h2>My Orders</h2>{orders.map(o=> <OrderCard key={o._id} order={o} />)}</div>);
}
