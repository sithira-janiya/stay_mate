// frontend/src/services/api.js
import axios from 'axios';

// ---------------- Base axios instance ----------------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- Teammates' APIs ----------------
export const propertyAPI = {
  getAllProperties: () => api.get('/properties'),
  getProperty: (id) => api.get(`/properties/${id}`),
  createProperty: (propertyData) => api.post('/properties', propertyData),
  updateProperty: (id, propertyData) => api.patch(`/properties/${id}`, propertyData),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  getPropertyRooms: (id) => api.get(`/properties/${id}/rooms`),
  getPropertyStats: (id) => api.get(`/properties/${id}/stats`),
};

export const roomAPI = {
  getAllRooms: (params) => api.get('/rooms', { params }),
  getRoom: (id) => api.get(`/rooms/${id}`),
  createRoom: (roomData) => api.post('/rooms', roomData),
  updateRoom: (id, roomData) => api.patch(`/rooms/${id}`, roomData),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
  allocateRoom: (data) => api.post('/rooms/allocate', data),
  removeTenant: (data) => api.post('/rooms/remove-tenant', data),
  createTransferRequest: (data) => api.post('/rooms/transfer-request', data),
  updateTransferRequest: (data) => api.patch('/rooms/transfer-request', data),
  getUnassignedTenants: () => api.get('/rooms/allocation/unassigned'),
  smartAllocation: () => api.get('/rooms/allocation/smart'),
};

// ---------------- Your APIs (modular) ----------------
export * as rentAPI from './rentApi';
export * as utilityAPI from './utilityApi';
export * as financeAPI from './financeApi';
// add more if needed: 
// export * as mealSupplierAPI from './mealSupplierApi';

export default api;
