// frontend/src/components/ChatWindow.js
import React, { useEffect, useRef, useState, useContext } from "react";
import useSocket from "../hooks/useSocket";
import { AuthContext } from "../contexts/AuthContext";

export default function ChatWindow({ tenantId }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { emit } = useSocket({
    onMessage: (m) => setMessages(s => [...s, m])
  });

  useEffect(() => {
    // optional: load thread via REST if available
  }, [tenantId]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const payload = { toUserId: tenantId, message: text.trim(), fromUserId: user?._id, role: user?.role };
    emit("chat:message", payload);
    setMessages(s => [...s, { fromRole: user?.role, message: text.trim(), createdAt: new Date() }]);
    setText("");
  };

  return (
    <div className="card">
      <div style={{ height: 260, overflow: "auto", marginBottom: 8 }}>
        {messages.map((m,i)=><div key={i}><strong>{m.fromRole}</strong>: {m.message} <div style={{ fontSize:12, color:"#6b7280" }}>{new Date(m.createdAt).toLocaleTimeString()}</div></div>)}
      </div>
      <form onSubmit={send} style={{ display:"flex", gap:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Message..." style={{ flex:1 }} />
        <button className="btn" type="submit">Send</button>
      </form>
    </div>
  );
}
