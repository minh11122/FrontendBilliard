import axios from "axios";

// Các API của system staff đang gọi trực tiếp tới backend staff namespace.
const BASE_URL = "http://localhost:9999/api/staff";

// Mỗi request của system staff cần gửi token để backend authenticate và authorizeRole("STAFF_SYSTEM").
function authHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Lấy dữ liệu tổng quan và số lượng pending để hiển thị badge ở sidebar/tab.
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

// Lấy danh sách CLB theo trạng thái đang lọc: Pending, Approved, Rejected hoặc Locked.
export async function getClubs(status) {
    const params = status ? { status } : {};
    const res = await axios.get(`${BASE_URL}/clubs`, {
        headers: authHeader(),
        params,
    });
    return res.data;
}

// Duyệt CLB đang Pending; backend sẽ chuyển status sang Approved.
export async function approveClub(id) {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/approve`, {}, {
        headers: authHeader()
    });
    return res.data;
}

// Từ chối CLB đang Pending và gửi kèm lý do từ chối.
export async function rejectClub(id, reason = "") {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/reject`, { reason }, {
        headers: authHeader()
    });
    return res.data;
}

// Khóa CLB đã được duyệt; backend chuyển status sang Locked.
export async function lockClub(id) {
    const res = await axios.patch(`${BASE_URL}/clubs/${id}/lock`, {}, {
        headers: authHeader()
    });
    return res.data;
}

// Mở khóa CLB; backend chuyển status từ Locked về Approved.
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

// Lấy danh sách thông báo cho system staff.
export async function getStaffNotifications() {
    const res = await axios.get(`${BASE_URL}/notifications`, {
        headers: authHeader()
    });
    return res.data;
}

// Tạo thông báo test cho system staff; hiện trang quản lý CLB chưa có nút gọi hàm này.
export async function createStaffTestNotification() {
    const res = await axios.post(`${BASE_URL}/notifications/test`, {}, {
        headers: authHeader()
    });
    return res.data;
}

// Đánh dấu một thông báo là đã đọc.
export async function markStaffNotificationRead(id) {
    const res = await axios.patch(`${BASE_URL}/notifications/${id}/read`, {}, {
        headers: authHeader()
    });
    return res.data;
}

// Đánh dấu tất cả thông báo là đã đọc.
export async function markAllStaffNotificationsRead() {
    const res = await axios.patch(`${BASE_URL}/notifications/read-all`, {}, {
        headers: authHeader()
    });
    return res.data;
}
