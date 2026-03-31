import api from "@/lib/axios";

export const transactionService = {
  // Customer
  getMyTransferHistory: () => api.get("/transactions/my"),

  // Owner / Staff-club (lọc theo club_id)
  getClubTransferHistory: (club_id) =>
    api.get("/transactions/club", {
      params: club_id ? { club_id } : undefined,
    }),
};

