// src/api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export const authRegister = (data) => API.post("/auth/register", data);
export const authLogin = (data) => API.post("/auth/login", data);

// meals
export const fetchMenu = (date) => {
  const params = date ? { date: date.toISOString().split('T')[0] } : {};
  return API.get("/meals", { params });
};
export const fetchSupplierMeals = (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate.toISOString().split('T')[0];
  if (endDate) params.endDate = endDate.toISOString().split('T')[0];
  return API.get("/meals/supplier", { params });
};
export const createMeal = (data) => API.post("/meals", data);
export const updateMeal = (id, data) => API.put(`/meals/${id}`, data);
export const deleteMeal = (id) => API.delete(`/meals/${id}`);

// orders
export const placeOrder = (data) => API.post("/orders", data);
export const confirmOrderWithAllergies = (data) => API.post("/orders/confirm-with-allergies", data);
export const fetchTenantOrders = () => API.get("/orders");
export const updateOrderStatus = (id, status) => API.patch(`/orders/${id}/status`, { status });
export const fetchExpenseAnalytics = (range) => API.get(`/expenses/analytics?range=${range}`);

// feedback
export const addFeedback = (data) => API.post("/feedback", data);
export const getSupplierFeedback = () => API.get("/feedback");
export const replyToFeedback = (id, reply) => API.put(`/feedback/${id}/reply`, { reply });

// notifications
export const fetchNotifications = (page = 1, limit = 20) => API.get(`/notifications?page=${page}&limit=${limit}`);
export const markNotificationAsRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.patch("/notifications/read-all");
export const getUnreadCount = () => API.get("/notifications/unread-count");

// announcements
export const createAnnouncement = (data) => API.post("/announcements", data);
export const listAnnouncements = () => API.get("/announcements");

// analytics
export const fetchSupplierAnalytics = (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate.toISOString().split('T')[0];
  if (endDate) params.endDate = endDate.toISOString().split('T')[0];
  return API.get("/analytics/supplier", { params });
};
export const fetchMonthlyIncome = (year) => API.get(`/analytics/monthly-income?year=${year}`);

export default API;