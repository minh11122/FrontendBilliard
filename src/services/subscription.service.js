import axios from "axios";

const API_BASE_URL = "http://localhost:9999/api/subscriptions";

function getAuthToken() {
  return localStorage.getItem("token");
}

// club đang chọn
function getSelectedClub() {
  return localStorage.getItem("selected_club_id");
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


// lấy subscription hiện tại
export async function getCurrentSubscription() {

  const token = getAuthToken();
  const club_id = localStorage.getItem("selected_club_id");

  const res = await axios.get(
    `${API_BASE_URL}/current?club_id=${club_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data.data;
}

// tạo link thanh toán PayOS
export async function createPayOSSubscriptionPayment(subscription_id) {

  const token = getAuthToken();
  const club_id = getSelectedClub();

  const res = await axios.post(
    `${API_BASE_URL}/payos/create-payment`,
    {
      subscription_id,
      club_id
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data.data;
}


// verify payment
export async function verifySubscriptionPayment(orderCode, subscription_id) {

  const token = getAuthToken();
  const club_id = getSelectedClub();

  const res = await axios.post(
    `${API_BASE_URL}/payos/verify`,
    {
      orderCode,
      subscription_id,
      club_id
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;
}