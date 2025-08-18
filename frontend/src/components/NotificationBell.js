import React from "react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { items, markAllRead } = useNotifications();
  const unread = items.filter(i => !i.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={markAllRead} style={{ position: "relative" }}>
        🔔 Notifications {unread > 0 ? `(${unread})` : ""}
      </button>
      <div style={{ position: "absolute", right: 0, top: "2rem", width: 320, background: "#fff",
                    border: "1px solid #eee", borderRadius: 8, boxShadow: "0 10px 25px rgba(0,0,0,.08)", zIndex: 10 }}>
        {items.length === 0 ? <div style={{ padding: 12 }}>No notifications</div> :
          items.slice(0, 6).map(n => (
            <div key={n.id} style={{ padding: 12, borderBottom: "1px solid #f2f2f2",
                                      opacity: n.read ? .6 : 1 }}>
              <strong style={{ textTransform: "capitalize" }}>{n.type}</strong>: {n.message}
            </div>
          ))
        }
      </div>
    </div>
  );
}
