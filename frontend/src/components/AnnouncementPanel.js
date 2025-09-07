// frontend/src/components/AnnouncementPanel.js
import React, { useEffect, useState } from "react";
import { createAnnouncement, listAnnouncements } from "../api/api";
import useSocket from "../hooks/useSocket";

export default function AnnouncementPanel() {
  const [items, setItems] = useState([]);
  const { emit } = useSocket({ onAnnouncement: () => load() });

  const load = () => listAnnouncements().then(r => setItems(r.data)).catch(console.error);

  useEffect(() => { load(); }, []);

  const send = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const body = e.target.body.value;
    const payload = { title, body, tags: [] };
    await createAnnouncement(payload);
    emit("announcement", payload);
    load();
  };

  return (
    <div>
      <form onSubmit={send}>
        <input name="title" placeholder="Title" required />
        <textarea name="body" placeholder="Body" required />
        <button type="submit">Broadcast</button>
      </form>
      <div>
        <h4>Recent</h4>
        {items.map(a => <div key={a._id}><strong>{a.title}</strong> — <div>{a.body}</div></div>)}
      </div>
    </div>
  );
}
