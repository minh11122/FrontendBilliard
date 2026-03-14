import api from "../lib/axios"; // Đảm bảo đường dẫn này trỏ đúng tới file axiosConfig.js của bạn

export const staffClubService = {
    // Lấy danh sách nhân viên hoạt động
    getActiveStaff: (club_id) => {
        return api.get(`/staff-club?club_id=${club_id}`);
    },

    // Lấy danh sách nhân viên bị khóa
    getBannedStaff: (club_id) => {
        return api.get(`/staff-club/banned?club_id=${club_id}`);
    },

    // Tạo nhân viên mới
    createStaff: (data) => {
        return api.post("/staff-club", data);
    },

    // Lấy chi tiết 1 nhân viên
    getStaffById: (id) => {
        return api.get(`/staff-club/${id}`);
    },

    // Cập nhật thông tin nhân viên
    updateStaff: (id, data) => {
        return api.put(`/staff-club/${id}`, data);
    },

    // Khóa nhân viên
    banStaff: (id) => {
        return api.put(`/staff-club/${id}/ban`);
    },

    // Mở khóa nhân viên
    unbanStaff: (id) => {
        return api.put(`/staff-club/${id}/unban`);
    },

    // Xóa nhân viên
    deleteStaff: (id) => {
        return api.delete(`/staff-club/${id}`);
    },
};