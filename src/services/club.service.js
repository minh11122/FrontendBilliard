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

// Lấy chi tiết câu lạc bộ theo ID (hỗ trợ truyền params như play_date, startTime)
export const getClubById = async (id, params = {}) => {
  try {
    const response = await api.get(`/clubs/${id}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error in getClubById for id ${id}:`, error);
    throw error;
  }
};

/**
 * Chủ quán đăng ký thông tin CLB mới
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

export const updateClub = async (id, data) => {
  try {
    const response = await api.put(`/clubs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error in updateClub for id ${id}:`, error);
    throw error;
  }
};

// Lấy thông tin tài khoản ngân hàng của CLB theo id
export const getClubBank = async (clubId) => {
  try {
    const response = await api.get(`/clubs/${clubId}/bank`);
    return response.data;
  } catch (error) {
    console.error("Error in getClubBank:", error);
    throw error;
  }
};

// Tạo / cập nhật thông tin tài khoản ngân hàng cho CLB
export const saveClubBank = async (clubId, data) => {
  try {
    const response = await api.put(`/clubs/${clubId}/bank`, data);
    return response.data;
  } catch (error) {
    console.error("Error in saveClubBank:", error);
    throw error;
  }
};

// Lấy thống kê cho Staff Club
export const getStaffClubStatistics = async (month, year) => {
  try {
    const params = {};
    if (month && year) {
       params.month = month;
       params.year = year;
    }
    const response = await api.get("/clubs/staff/statistics", { params });
    return response.data;
  } catch (error) {
    console.error("Error in getStaffClubStatistics:", error);
    throw error;
  }
};

export const completeOnboarding = async (clubId, plan_type) => {
  try {
    const response = await api.patch(`/clubs/${clubId}/complete-onboarding`, { plan_type });
    return response.data;
  } catch (error) {
    console.error("Error in completeOnboarding:", error);
    throw error;
  }
};

export const getSubscriptions = async () => {
  try {
    const response = await api.get("/subscriptions");
    return response.data;
  } catch (error) {
    console.error("Error in getSubscriptions:", error);
    throw error;
  }
};

export const getClubAnalytics = async (clubId, params = {}) => {
  try {
    const response = await api.get(`/clubs/${clubId}/analytics`, { params });
    return response.data;
  } catch (error) {
    console.error("Error in getClubAnalytics:", error);
    throw error;
  }
};

export const clubService = {
  getAllClubs,
  getClubById,
  registerClub,
  updateClub,
  getClubBank,
  saveClubBank,
  getStaffClubStatistics,
  completeOnboarding,
  getSubscriptions,
  getClubAnalytics
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
