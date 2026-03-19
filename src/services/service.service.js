import api from "../lib/axios";

// Lấy danh sách dịch vụ (lọc theo status, tìm kiếm, phân trang)
export const getServices = (params) => {
    return api.get("/services", { params });
};

// Lấy chi tiết dịch vụ
export const getServiceById = (id) => {
    return api.get(`/services/${id}`);
};

// Tạo dịch vụ mới (FormData để upload ảnh)
export const createService = (formData) => {
    return api.post("/services", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

// Cập nhật dịch vụ (FormData để upload ảnh)
export const updateService = (id, formData) => {
    return api.put(`/services/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
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
