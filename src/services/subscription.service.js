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

  return res.data.data;
}

// lấy subscription hiện tại của tài khoản
export async function getCurrentSubscription() {
  const token = getAuthToken();

  const res = await axios.get(`${API_BASE_URL}/current`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data.data;
}

// tạo link thanh toán PayOS
export async function createPayOSSubscriptionPayment(subscription_id) {
  const token = getAuthToken();

  const res = await axios.post(
    `${API_BASE_URL}/payos/create-payment`,
    { subscription_id },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data.data;
}

// verify PayOS theo orderCode (khi PayOS redirect về)


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

  return res.data.data;
}