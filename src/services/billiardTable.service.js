import api from "../lib/axios";

// Lấy danh sách bàn (kèm phân trang, lọc)
export const getTables = (params) => {
    return api.get("/tables", { params });
};

// Thêm bàn mới (Dùng FormData vì có upload ảnh)
export const createTable = (formData) => {
    // Không cần set 'Content-Type': 'multipart/form-data', 
    // Axios sẽ tự động nhận diện và set đúng boundary khi truyền FormData
    return api.post("/tables", formData, { timeout: 120000 });
};

// Cập nhật bàn
export const updateTable = (id, data) => {
    const config = data instanceof FormData ? { timeout: 120000 } : undefined;
    return api.put(`/tables/${id}`, data, config);
};

// Xóa bàn
export const deleteTable = (id, clubId) => {
    return api.delete(`/tables/${id}`, {
        params: clubId ? { club_id: clubId } : undefined,
    });
};

// Lấy chi tiết bàn
export const getTableById = (id) => {
    return api.get(`/tables/${id}`);
};

// Lấy danh sách Loại bàn (Dùng cho Select Dropdown)
export const getTableTypes = () => {
    return api.get("/tables/types");
};
