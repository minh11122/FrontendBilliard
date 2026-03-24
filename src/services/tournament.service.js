import api from "../lib/axios";

// Get all tournaments for a club
export const getTournamentsByClub = async (clubId) => {
  const res = await api.get("/tournaments", {
    headers: { "x-club-id": clubId }
  });
  return res.data;
};

// Get all public tournaments (excluding Draft)
export const getPublicTournaments = async () => {
  const res = await api.get("/tournaments/public");
  return res.data;
};

// Get single tournament
export const getTournamentById = async (id) => {
  const res = await api.get(`/tournaments/${id}`);
  return res.data;
};

export const createPayOSTournamentPayment = async (tournamentId) => {
  const res = await api.post(`/tournaments/${tournamentId}/payos/create-payment`);
  return res.data;
};

export const verifyTournamentPayOSPayment = async (orderCode) => {
  const res = await api.post("/tournaments/payos/verify", { orderCode });
  return res.data;
};

export const getMyRegisteredTournamentIds = async () => {
  const res = await api.get("/tournaments/my/registered-ids");
  return res.data;
};

// Create tournament
export const createTournament = async (clubId, data) => {
  const res = await api.post("/tournaments", data, {
    headers: { "x-club-id": clubId }
  });
  return res.data;
};

// Update tournament
export const updateTournament = async (id, data) => {
  const res = await api.put(`/tournaments/${id}`, data);
  return res.data;
};

// Delete tournament
export const deleteTournament = async (id) => {
  const res = await api.delete(`/tournaments/${id}`);
  return res.data;
};
