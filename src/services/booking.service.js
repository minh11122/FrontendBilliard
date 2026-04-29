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

// Create PayOS payment link for booking deposit
export const createPayOSBookingPayment = async (bookingId) => {
  try {
    const response = await api.post(
      `/bookings/${bookingId}/payos/create-payment`,
    );
    return response.data;
  } catch (error) {
    console.error("Error in createPayOSBookingPayment:", error);
    throw error;
  }
};

// Verify PayOS payment for booking (after redirect from PayOS)
export const verifyBookingPayOSPayment = async (orderCode) => {
  try {
    const response = await api.post("/bookings/payos/verify", { orderCode });
    return response.data;
  } catch (error) {
    console.error("Error in verifyBookingPayOSPayment:", error);
    throw error;
  }
};

// Get booking by id (STAFF/OWNER)
export const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

// Create PayOS payment link for remaining amount (Playing -> Completed)
export const createPayOSBookingCheckoutPayment = async (bookingId) => {
  const response = await api.post(
    `/bookings/${bookingId}/checkout/payos/create-payment`
  );
  return response.data;
};

// Verify PayOS checkout payment after redirect
export const verifyBookingCheckoutPayOSPayment = async (orderCode) => {
  const response = await api.post("/bookings/checkout/payos/verify", { orderCode });
  return response.data;
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

// Thanh toán kết thúc lượt chơi (Dành cho STAFF / OWNER)
export const checkOutBooking = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/checkout`);
    return response.data;
  } catch (error) {
    console.error("Error in checkOutBooking:", error);
    throw error;
  }
};

// Nhân viên tạo đặt bàn trực tiếp (walk-in) cho khách đến quán
export const createWalkInBooking = async (data) => {
  try {
    const response = await api.post("/bookings/walk-in", data);
    return response.data;
  } catch (error) {
    console.error("Error in createWalkInBooking:", error);
    throw error;
  }
};

// Lấy danh sách dịch vụ của một booking
export const getBookingServices = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}/services`);
    return response.data;
  } catch (error) {
    console.error("Error in getBookingServices:", error);
    throw error;
  }
};

// Thêm dịch vụ vào booking
export const addServiceToBooking = async (bookingId, serviceId, quantity) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/services`, {
      service_id: serviceId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error in addServiceToBooking:", error);
    throw error;
  }
};

// Cập nhật số lượng dịch vụ
export const updateBookingServiceQuantity = async (bookingId, bookingServiceId, quantity) => {
  try {
    const response = await api.put(`/bookings/${bookingId}/services/${bookingServiceId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Error in updateBookingServiceQuantity:", error);
    throw error;
  }
};

// Xoá dịch vụ khỏi booking
export const deleteBookingService = async (bookingId, bookingServiceId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}/services/${bookingServiceId}`);
    return response.data;
  } catch (error) {
    console.error("Error in deleteBookingService:", error);
    throw error;
  }
};

// Gia hạn booking
export const extendBooking = async (bookingId, minutes) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/extend`, { minutes });
    return response.data;
  } catch (error) {
    console.error("Error in extendBooking:", error);
    throw error;
  }
};

// Đổi bàn
export const changeTable = async (bookingId, newTableId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/change-table`, { new_table_id: newTableId });
    return response.data;
  } catch (error) {
    console.error("Error in changeTable:", error);
    throw error;
  }
};

export const bookingService = {
  createBooking,
  cancelHold,
  getMyBookings,
  checkInBooking,
  getClubBookings,
  createWalkInBooking,
  createPayOSBookingPayment,
  verifyBookingPayOSPayment,
  getBookingById,
  createPayOSBookingCheckoutPayment,
  verifyBookingCheckoutPayOSPayment,
  checkOutBooking,
  getBookingServices,
  addServiceToBooking,
  updateBookingServiceQuantity,
  deleteBookingService,
  extendBooking,
  changeTable,
};

export default bookingService;
