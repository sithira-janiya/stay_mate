import React, { useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";

export default function NotificationBell() {
  const { items, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const unread = items.filter(i => !i.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => { setOpen(v => !v); if (!open) markAllRead(); }} className="btn">
        🔔 {unread > 0 ? `(${unread})` : ""}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "2.4rem", width: 320, background: "#fff", border: "1px solid #eef2f6", borderRadius: 8 }}>
          {items.length === 0 ? <div style={{ padding: 12 }}>No notifications</div> : items.slice(0,8).map(n => (
            <div key={n.id} style={{ padding: 12, borderBottom: "1px solid #f3f4f6", opacity: n.read ? 0.6 : 1 }}>
              <strong>{n.type}</strong><div style={{ color: "#475569" }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
