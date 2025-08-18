import axios from "axios";
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// MENU
export const fetchMenu = () => API.get("/menu");
export const createMeal = (data) => API.post("/menu", data);
export const updateMeal = (id, data) => API.put(`/menu/${id}`, data);
export const cancelMeal = (id) => API.patch(`/menu/${id}/cancel`);
export const deleteMeal = (id) => API.delete(`/menu/${id}`);

// ORDERS
export const placeOrder = (data) => API.post("/orders", data);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}`, { status });
export const fetchTenantOrders = (tenantId) => API.get(`/orders/tenant/${tenantId}`);
export const fetchTenantExpenses = (tenantId) => API.get(`/orders/tenant/${tenantId}/expenses`);

// FEEDBACK
export const addFeedback = (data) => API.post("/feedback", data);

// ANALYTICS
export const fetchAnalytics = () => API.get("/analytics");

// ANNOUNCEMENTS
export const createAnnouncement = (data) => API.post("/announcements", data);
export const listAnnouncements = () => API.get("/announcements");

// CHAT
export const fetchTenantThread = (tenantId) => API.get(`/chat/tenant/${tenantId}`);
