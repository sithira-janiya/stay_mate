// src/contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUnreadCount, fetchNotifications } from "../api/api";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial notifications and unread count
  useEffect(() => {
    loadUnreadCount();
    loadNotifications();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const loadNotifications = async (page = 1, limit = 20) => {
    try {
      const response = await fetchNotifications(page, limit);
      setItems(response.data.notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const push = (message, type = "general", relatedEntity = null) => {
    const id = Date.now() + Math.random();
    setItems(prev => [{ id, message, type, relatedEntity, read: false, createdAt: new Date() }, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems(prev => prev.map(i => ({ ...i, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      items, 
      unreadCount,
      push, 
      markAllRead, 
      markRead,
      loadNotifications,
      loadUnreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);