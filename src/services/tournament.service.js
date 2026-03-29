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

export const openRegistration = async (tournamentId) => {
  const res = await api.post(`/tournaments/${tournamentId}/open`);
  return res.data;
};

export const closeRegistration = async (tournamentId, payload = {}) => {
  const res = await api.post(`/tournaments/${tournamentId}/close`, payload);
  return res.data;
};

export const generateBracket = async (tournamentId, payload = {}) => {
  const res = await api.post(`/tournaments/${tournamentId}/generate-bracket`, payload);
  return res.data;
};

export const startTournament = async (tournamentId) => {
  const res = await api.post(`/tournaments/${tournamentId}/start`);
  return res.data;
};

export const getTournamentBracket = async (tournamentId) => {
  const res = await api.get(`/tournaments/${tournamentId}/bracket`);
  return res.data;
};

export const getTournamentMatches = async (tournamentId, params = {}) => {
  const res = await api.get(`/tournaments/${tournamentId}/matches`, { params });
  return res.data;
};

export const startMatch = async (tournamentId, matchId, payload = {}) => {
  const res = await api.post(`/tournaments/${tournamentId}/matches/${matchId}/start`, payload);
  return res.data;
};

export const submitMatchResult = async (tournamentId, matchId, payload) => {
  const res = await api.post(`/tournaments/${tournamentId}/matches/${matchId}/result`, payload);
  return res.data;
};

export const getLeaderboard = async (tournamentId) => {
  const res = await api.get(`/tournaments/${tournamentId}/leaderboard`);
  return res.data;
};

export const getMyRegisteredTournamentIds = async () => {
  const res = await api.get("/tournaments/my/registered-ids");
  return res.data;
};

export const getTournamentPlayers = async (tournamentId) => {
  const res = await api.get(`/tournaments/${tournamentId}/players`);
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
