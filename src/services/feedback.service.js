import api from "../lib/axios";

// Gửi đánh giá cho một booking đã hoàn thành
export const createFeedback = async (data) => {
  try {
    const res = await api.post("/feedbacks", data);
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};

// Lấy đánh giá của một booking (nếu có)
export const getFeedbackByBookingId = async (bookingId) => {
  try {
    const res = await api.get(`/feedbacks/booking/${bookingId}`);
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    throw error;
  }
};
