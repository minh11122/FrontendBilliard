import axios from "axios";

const API_BASE_URL = "http://localhost:9999/api/clubs"; // sửa theo port/back-end của bạn

// token lấy từ localStorage (sau khi login)
function getAuthToken() {
  return localStorage.getItem("token");
}

export async function registerClub(data) {
  const token = getAuthToken();

  const response = await axios.post(`${API_BASE_URL}/register-owner-account`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return response.data;
}