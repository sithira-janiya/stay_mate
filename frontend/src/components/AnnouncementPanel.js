import React, { useEffect, useState } from "react";
import { createAnnouncement, listAnnouncements } from "../api/api";
import { io } from "socket.io-client";
import { useNotifications } from "../context/NotificationContext";

const socket = io("http://localhost:5000", { autoConnect: true });
socket.emit("join", { role: "supplier" });

export default function AnnouncementPanel() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { push } = useNotifications();

  const load = () => listAnnouncements().then(res => setItems(res.data));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onMirror = (p) => {
      push(`Announcement sent: ${p.title}`, "announcement");
      load();
    };
    socket.on("announcement:mirror", onMirror);
    return () => {
      socket.off("announcement:mirror", onMirror);
    };
  }, [push]);

  const send = async (e) => {
    e.preventDefault();
    const payload = { title, body, tags: [] };
    await createAnnouncement(payload);
    socket.emit("announcement", payload);
    setTitle(""); setBody("");
  };

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
      <h3>Broadcast Announcement</h3>
      <form onSubmit={send} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Write your announcement..." value={body} onChange={e => setBody(e.target.value)} required rows={3} />
        <button type="submit">Send to all tenants</button>
      </form>
      <div>
        <h4>Recent</h4>
        <ul>
          {items.map(a => (
            <li key={a._id}>
              <strong>{a.title}</strong> — <span style={{ color: "#666" }}>{new Date(a.createdAt).toLocaleString()}</span>
              <div style={{ fontSize: 13 }}>{a.body}</div>
            </li>
          ))}
          {items.length === 0 && <div>No announcements yet.</div>}
        </ul>
      </div>
    </div>
  );
}
