import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const push = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems(prev => [{ id, message, type, read: false }, ...prev]);
    // auto mark read after 6s (toast-like)
    setTimeout(() => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), 6000);
  }, []);

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <NotificationContext.Provider value={{ items, push, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
