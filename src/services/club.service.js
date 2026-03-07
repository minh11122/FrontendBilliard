import api from "../lib/axios";

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

// Hỗ trợ cả named export và default export để không làm lỗi code của các thành viên khác
export const clubService = {
  getAllClubs,
  getClubById,
  registerClub
};

export default clubService;