import axios from "axios";

const BASE_URL = "http://localhost:9999/api/staff";

function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getDashboardData(dateType, specificDate) {
    const params = {};
    if (dateType) params.dateType = dateType;
    if (specificDate) params.specificDate = specificDate;
    
    const res = await axios.get(`${BASE_URL}/dashboard`, {
        headers: authHeader(),
        params
    });
    return res.data;
}

export async function getClubs(status) {
    const params = status ? { status } : {};
    const res = await axios.get(`${BASE_URL}/clubs`, {
        headers: authHeader(),
        params,
    });
    return res.data;
}

export async function approveClub(id) {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/approve`, {}, {
        headers: authHeader()
    });
    return res.data;
}

export async function rejectClub(id, reason = "") {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/reject`, { reason }, {
        headers: authHeader()
    });
    return res.data;
}

export async function lockClub(id) {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/lock`, {}, {
        headers: authHeader()
    });
    return res.data;
}

export async function unlockClub(id) {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/unlock`, {}, {
        headers: authHeader()
    });
    return res.data;
}

export async function getPosts(status) {
    const params = status ? { status } : {};
    const res = await axios.get(`${BASE_URL}/posts`, {
        headers: authHeader(),
        params,
    });
    return res.data;
}

export async function approvePost(id) {
    const res = await axios.patch(`${BASE_URL}/posts/${id}/approve`, {}, {
        headers: authHeader()
    });
    return res.data;
}

export async function rejectPost(id, reason = "") {
    const res = await axios.patch(`${BASE_URL}/posts/${id}/reject`, { reason }, {
        headers: authHeader()
    });
    return res.data;
}

// Notifications
export async function getStaffNotifications() {
    const res = await axios.get(`${BASE_URL}/notifications`, {
        headers: authHeader()
    });
    return res.data;
}

export async function markStaffNotificationRead(id) {
    const res = await axios.patch(`${BASE_URL}/notifications/${id}/read`, {}, {
        headers: authHeader()
    });
    return res.data;
}

export async function markAllStaffNotificationsRead() {
    const res = await axios.patch(`${BASE_URL}/notifications/read-all`, {}, {
        headers: authHeader()
    });
    return res.data;
}
