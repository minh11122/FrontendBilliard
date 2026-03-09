import axios from "axios";

const BASE_URL = "http://localhost:9999/api/staff";

function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getDashboardData() {
    const res = await axios.get(`${BASE_URL}/dashboard`, {
        headers: authHeader()
    });
    return res.data;
}

export async function approveClub(id) {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/approve`, {}, {
        headers: authHeader()
    });
    return res.data;
}

export async function rejectClub(id) {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/reject`, {}, {
        headers: authHeader()
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
