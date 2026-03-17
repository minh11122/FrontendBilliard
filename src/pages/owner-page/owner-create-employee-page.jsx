import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { staffClubService } from "@/services/staff-club.service";

export default function OwnerCreateEmployeePage() {
    const navigate = useNavigate();
    const clubId = localStorage.getItem("selected_club_id");

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!clubId) {
            alert("Không tìm thấy thông tin quán (club_id)!");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData, club_id: clubId };
            await staffClubService.createStaff(payload);
            alert("Thêm nhân viên thành công!");
            navigate("/owner/list-employee");
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Đã xảy ra lỗi khi thêm nhân viên");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/owner/list-employee" className="text-gray-500 hover:text-gray-800 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Thêm nhân viên mới</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullname"
                        required
                        value={formData.fullname}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập họ và tên..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập email đăng nhập..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập số điện thoại..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Tạo mật khẩu cho nhân viên..."
                    />
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t">
                    <Link
                        to="/owner/list-employee"
                        className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                        Hủy
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-5 py-2 text-white font-medium rounded-md transition ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Tạo nhân viên"}
                    </button>
                </div>
            </form>
        </div>
    );
}