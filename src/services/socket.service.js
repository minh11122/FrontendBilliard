import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket;

export const initiateSocketConnection = (accountId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    console.log("Connecting socket...");
  }
  
  if (socket && accountId) {
    socket.emit("join", accountId);
  }
};

export const subscribeToNotifications = (callback) => {
  if (!socket) return;
  socket.on("new_notification", (notification) => {
    callback(notification);
  });
};

export const unsubscribeFromNotifications = () => {
  if (!socket) return;
  socket.off("new_notification");
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
