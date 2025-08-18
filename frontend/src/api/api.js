import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// MENU
export const fetchMenu = () => API.get("/menu");

// ORDERS
export const placeOrder = (data) => API.post("/orders", data);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}`, { status });
export const fetchTenantOrders = (tenantId) => API.get(`/orders/tenant/${tenantId}`);
export const fetchTenantExpenses = (tenantId) => API.get(`/orders/tenant/${tenantId}/expenses`);

// FEEDBACK
export const addFeedback = (data) => API.post("/feedback", data);

// ANALYTICS (supplier)
export const fetchAnalytics = () => API.get("/analytics");
