import api from "../lib/axios";

// Lấy danh sách notification
export const getNotifications = (params) => {
  return api.get("/notifications", { params });
};

// Đếm số chưa đọc
export const getUnreadCount = () => {
  return api.get("/notifications/unread/count");
};

// Đánh dấu 1 notification đã đọc
export const markAsRead = (id) => {
  return api.patch(`/notifications/${id}/read`);
};

// Đánh dấu tất cả đã đọc
export const markAllAsRead = () => {
  return api.patch("/notifications/read-all");
};

// Xóa 1 notification
export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};

// Xóa tất cả notification
export const deleteAllNotifications = () => {
  return api.delete("/notifications");
};