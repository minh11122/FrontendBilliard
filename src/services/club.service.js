import api from "../lib/axios";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:9999/api";

function getAuthToken() {
  return localStorage.getItem("token");
}

// Lấy tất cả câu lạc bộ (có hỗ trợ params tìm kiếm/lọc)
export const getAllClubs = async (params = {}) => {
  try {
    const response = await api.get("/clubs", { params });
    return response.data;
  } catch (error) {
    console.error("Error in getAllClubs:", error);
    throw error;
  }
};

// Lấy chi tiết câu lạc bộ theo ID
export const getClubById = async (id) => {
  try {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error in getClubById for id ${id}:`, error);
    throw error;
  }
};

/**
 * Chủ quán đăng ký thông tin CLB mới
 * Kết hợp từ code cũ của thành viên khác
 */
export const registerClub = async (data) => {
  try {
    const response = await api.post("/clubs/register-owner-account", data);
    return response.data;
  } catch (error) {
    console.error("Error in registerClub:", error);
    throw error;
  }
};

export const clubService = {
  getAllClubs,
  getClubById,
  registerClub
};


export async function getOwnerClubs() {
  const token = getAuthToken();

  const response = await axios.get(`${API_BASE_URL}/clubs/owner/clubs`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

export default clubService;
