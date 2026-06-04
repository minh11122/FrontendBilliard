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
export const deactivateService = (id, clubId) => {
    return api.patch(`/services/${id}/deactivate`, {}, {
        params: clubId ? { club_id: clubId } : undefined,
    });
};

// Khôi phục dịch vụ
export const reactivateService = (id, clubId) => {
    return api.patch(`/services/${id}/reactivate`, {}, {
        params: clubId ? { club_id: clubId } : undefined,
    });
};

// Xóa vĩnh viễn
export const deleteServicePermanently = (id, clubId) => {
    return api.delete(`/services/${id}`, {
        params: clubId ? { club_id: clubId } : undefined,
    });
};
