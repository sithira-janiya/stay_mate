import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const fetchMenu = () => API.get("/menu");
export const placeOrder = (data) => API.post("/orders", data);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}`, { status });
export const addFeedback = (data) => API.post("/feedback", data);
export const fetchAnalytics = () => API.get("/analytics");
