// frontend/src/hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket({ onMessage, onAnnouncement } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const url = process.env.REACT_APP_WS_URL || "http://localhost:5001";
    const token = localStorage.getItem("token");
    socketRef.current = io(url, { auth: token ? { token } : undefined, autoConnect: true });

    socketRef.current.on("connect", () => { /* console.log("socket connected"); */ });

    if (onMessage) socketRef.current.on("chat:message", onMessage);
    if (onAnnouncement) socketRef.current.on("announcement:new", onAnnouncement);

    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
  }, [onMessage, onAnnouncement]);

  const emit = (event, payload) => socketRef.current?.emit(event, payload);

  return { socket: socketRef.current, emit };
}
