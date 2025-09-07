//frontend/src/hooks/useNotifications.js

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function useNotifications(tenantId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!tenantId) return;

    socket.emit("joinTenantRoom", tenantId);

    socket.on("supplierReply", (data) => {
      console.log("🔔 New Supplier Reply:", data);
      setNotifications(prev => [...prev, data]);
    });

    return () => {
      socket.off("supplierReply");
    };
  }, [tenantId]);

  return { notifications, setNotifications };
}
