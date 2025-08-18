import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { fetchTenantThread } from "../api/api";

// Props:
//  role: "tenant" | "supplier"
//  tenantId: string (thread to open)
//  displayName: string (sender id/name)
export default function ChatWindow({ role, tenantId, displayName }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchTenantThread(tenantId).then(res => setMessages(res.data));
  }, [tenantId]);

  useEffect(() => {
    const s = io("http://localhost:5000", { autoConnect: true });
    s.emit("join", { role, tenantId: role === "tenant" ? tenantId : undefined });
    const onMsg = (msg) => {
      // only display relevant thread messages
      if (msg.toTenantId === tenantId || (msg.role === "tenant" && msg.from === tenantId)) {
        setMessages(prev => [...prev, msg]);
      }
    };
    s.on("chat:message", onMsg);
    setSocket(s);
    return () => { s.off("chat:message", onMsg); s.disconnect(); };
  }, [role, tenantId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const payload = {
      toTenantId: role === "supplier" ? tenantId : undefined,
      from: role === "tenant" ? tenantId : displayName || "Supplier",
      role,
      message: text.trim()
    };
    socket.emit("chat:message", payload);
    setText("");
  };

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, display: "grid", gridTemplateRows: "1fr auto", height: 360 }}>
      <div style={{ overflow: "auto", padding: 10, background: "#fafafa" }}>
        {messages.map((m, idx) => {
          const mine = (role === "tenant" && m.role === "tenant") || (role === "supplier" && m.role === "supplier");
          return (
            <div key={idx} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", marginBottom: 6 }}>
              <div style={{ maxWidth: "70%", background: mine ? "#e3f2fd" : "#fff", border: "1px solid #eee", borderRadius: 8, padding: "6px 10px" }}>
                <div style={{ fontSize: 12, color: "#666" }}>{m.role}</div>
                <div>{m.message}</div>
                <div style={{ fontSize: 11, color: "#999", textAlign: "right" }}>{new Date(m.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={send} style={{ display: "flex", gap: 8, padding: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…" style={{ flex: 1 }} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
