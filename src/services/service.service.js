import api from "../lib/axios";

// Lấy danh sách dịch vụ (lọc theo status, tìm kiếm, phân trang)
export const getServices = (params) => {
    return api.get("/services", { params });
};

// Lấy chi tiết dịch vụ
export const getServiceById = (id) => {
    return api.get(`/services/${id}`);
};

// Tạo dịch vụ mới
export const createService = (data) => {
    return api.post("/services", data);
};

// Cập nhật dịch vụ
export const updateService = (id, data) => {
    return api.put(`/services/${id}`, data);
};

// Vô hiệu hóa dịch vụ (soft delete)
export const deactivateService = (id) => {
    return api.patch(`/services/${id}/deactivate`);
};

// Khôi phục dịch vụ
export const reactivateService = (id) => {
    return api.patch(`/services/${id}/reactivate`);
};

// Xóa vĩnh viễn
export const deleteServicePermanently = (id) => {
    return api.delete(`/services/${id}`);
};
