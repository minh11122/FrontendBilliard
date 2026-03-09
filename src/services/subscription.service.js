import axios from "axios";

const API_BASE_URL = "http://localhost:9999/api/subscriptions";

function getAuthToken() {
  return localStorage.getItem("token");
}

// lấy danh sách gói
export async function getSubscriptions() {
  const token = getAuthToken();

  const res = await axios.get(API_BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
}

// mua gói
export async function purchaseSubscription(subscription_id) {
  const token = getAuthToken();

  const res = await axios.post(
    `${API_BASE_URL}/purchase`,
    { subscription_id },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;
}