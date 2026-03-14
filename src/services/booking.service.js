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

// Đánh dấu booking là Payment Pending sau khi khách đã chuyển khoản
export const markPaymentPending = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/payment-pending`);
    return response.data;
  } catch (error) {
    console.error("Error in markPaymentPending:", error);
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

// Nhân viên check-in
export const checkInBooking = async (code_number) => {
  try {
    const response = await api.post("/bookings/checkin", { code_number });
    return response.data;
  } catch (error) {
    console.error("Error in checkInBooking:", error);
    throw error;
  }
};

// Lấy danh sách booking của club (staff / owner)
export const getClubBookings = async (params = {}) => {
  try {
    const response = await api.get("/bookings/club", { params });
    return response.data;
  } catch (error) {
    console.error("Error in getClubBookings:", error);
    throw error;
  }
};

export const bookingService = {
  createBooking,
  cancelHold,
  getMyBookings,
  checkInBooking,
  getClubBookings
  markPaymentPending
};

export default bookingService;
