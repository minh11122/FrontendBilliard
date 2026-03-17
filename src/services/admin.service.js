import api from "../lib/axios";

export const getAccounts = (params) => {
  return api.get("/admin/accounts", { params });
};

export const getAllClubs = (params) => {
  return api.get("/admin/clubs", { params });
};

export const getAllSubscriptions = (params) => {
  return api.get("/admin/subscriptions", { params });
};