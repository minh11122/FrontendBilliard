import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { staffClubService } from "@/services/staff-club.service";

export default function OwnerUpdateEmployeePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchStaffDetail = async () => {
            try {
                const res = await staffClubService.getStaffById(id);
                const staff = res.data.data;
                setFormData({
                    fullname: staff.fullname || "",
                    email: staff.email || "",
                    phone: staff.phone || "",
                    password: "", // Luôn để trống ban đầu
                });
            } catch (error) {
                alert("Không thể tải thông tin nhân viên");
                navigate("/owner/list-employee");
            } finally {
                setIsFetching(false);
            }
        };
        if (id) fetchStaffDetail();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                fullname: formData.fullname,
                phone: formData.phone,
            };

            // Chỉ gửi password nếu người dùng có nhập mật khẩu mới
            if (formData.password.trim() !== "") {
                payload.password = formData.password;
            }

            await staffClubService.updateStaff(id, payload);
            alert("Cập nhật thông tin thành công!");
            navigate("/owner/list-employee");
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isFetching) {
        return (
            <div className="p-6 text-center text-gray-500 mt-10">
                <p className="text-lg">Đang tải dữ liệu nhân viên...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/owner/employees" className="text-gray-500 hover:text-gray-800 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Cập nhật thông tin nhân viên</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-gray-400 font-normal">(Không thể thay đổi)</span>
                    </label>
                    <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full border border-gray-300 rounded-md p-2.5 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                    />
                </div>

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
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới <span className="text-gray-400 font-normal">(Bỏ trống nếu không muốn đổi mật khẩu)</span>
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder="Nhập mật khẩu mới..."
                    />
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t">
                    <Link
                        to="/owner/employees"
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
                        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
}