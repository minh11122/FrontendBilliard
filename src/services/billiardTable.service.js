import api from "../lib/axios";

// Lấy danh sách bàn (kèm phân trang, lọc)
export const getTables = (params) => {
    return api.get("/tables", { params });
};

// Thêm bàn mới (Dùng FormData vì có upload ảnh)
export const createTable = (formData) => {
    // Không cần set 'Content-Type': 'multipart/form-data', 
    // Axios sẽ tự động nhận diện và set đúng boundary khi truyền FormData
    return api.post("/tables", formData);
};

// Cập nhật bàn
export const updateTable = (id, data) => {
    return api.put(`/tables/${id}`, data);
};

// Xóa bàn
export const deleteTable = (id) => {
    return api.delete(`/tables/${id}`);
};

// Lấy danh sách Loại bàn (Dùng cho Select Dropdown)
export const getTableTypes = () => {
    return api.get("/tables/types");                                                                                                                                                                                                                                                                                                                                                                                                                                             // Đảm bảo bạn có API này ở Backend nhé
};