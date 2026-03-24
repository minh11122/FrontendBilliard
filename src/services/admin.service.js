import api from "../lib/axios";

// ===== ACCOUNT =====
export const getAccounts = (params) => {
  return api.get("/admin/accounts", { params });
};

export const toggleBanAccount = (id) =>
  api.patch(`/admin/accounts/${id}/toggle-ban`);

export const deleteAccount = (id) =>
  api.patch(`/admin/accounts/${id}/delete`);


// ===== CLUB =====
export const getAllClubs = (params) => {
  return api.get("/admin/clubs", { params });
};


// ===== SUBSCRIPTION =====
export const getAllSubscriptions = (params) => {
  return api.get("/admin/subscriptions", { params });
};

export const getSubscriptionById = (id) => {
  return api.get(`/admin/subscriptions/${id}`);
};

export const createSubscription = (data) => {
  return api.post("/admin/subscriptions", data);
};

export const updateSubscription = (id, data) => {
  return api.put(`/admin/subscriptions/${id}`, data);
};

export const deleteSubscription = (id) => {
  return api.delete(`/admin/subscriptions/${id}`);
};

// ===== REVENUE WEB =====

// 📊 danh sách giao dịch (quán mua gói)
export const getRevenueWeb = (params) => {
  return api.get("/admin/revenue/web", { params });
};

// 💰 tổng doanh thu
export const getRevenueWebSummary = (params) => {
  return api.get("/admin/revenue/web/summary", { params });
};