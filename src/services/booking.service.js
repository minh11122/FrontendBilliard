import api from "../lib/axios";

// Tạo booking mới
export const createBooking = async (data) => {
  try {
    const response = await api.post("/bookings", data);
    return response.data;
  } catch (error) {
    console.error("Error in createBooking:", error);
    throw error;
  }
};

// Hủy giữ chỗ
export const cancelHold = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/cancel-hold`);
    return response.data;
  } catch (error) {
    console.error("Error in cancelHold:", error);
    throw error;
  }
};

// Lấy danh sách booking của tôi
export const getMyBookings = async () => {
  try {
    const response = await api.get("/bookings/my");
    return response.data;
  } catch (error) {
    console.error("Error in getMyBookings:", error);
    throw error;
  }
};

export const bookingService = {
  createBooking,
  cancelHold,
  getMyBookings
};

export default bookingService;
