import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { staffClubService } from "@/services/staff-club.service";

export default function OwnerListEmployeePage() {
    const [activeTab, setActiveTab] = useState("ACTIVE"); // 'ACTIVE' hoặc 'BANNED'
    const [staffList, setStaffList] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Lấy club_id từ Local Storage (Quán mà chủ quán đang chọn)
    const clubId = localStorage.getItem("selected_club_id");

    const fetchStaff = async () => {
        if (!clubId) {
            alert("Không tìm thấy thông tin quán (club_id)!");
            return;
        }

        setIsLoadingData(true);
        try {
            let res;
            if (activeTab === "ACTIVE") {
                res = await staffClubService.getActiveStaff(clubId);
                const data = res?.data?.data || [];
                // Lọc hiển thị duy nhất trạng thái ACTIVE
                setStaffList(data.filter((staff) => staff.status === "ACTIVE"));
            } else {
                res = await staffClubService.getBannedStaff(clubId);
                const data = res?.data?.data || [];
                setStaffList(data);
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi khi tải danh sách nhân viên");
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleBan = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn khóa nhân viên này?")) return;
        try {
            await staffClubService.banStaff(id);
            alert("Khóa nhân viên thành công");
            fetchStaff();
        } catch (error) {
            alert(error?.response?.data?.message || "Lỗi khi khóa nhân viên");
        }
    };

    const handleUnban = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn mở khóa nhân viên này?")) return;
        try {
            await staffClubService.unbanStaff(id);
            alert("Mở khóa thành công");
            fetchStaff();
        } catch (error) {
            alert(error?.response?.data?.message || "Lỗi khi mở khóa");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hành động này sẽ xóa nhân viên. Bạn có chắc chắn?")) return;
        try {
            await staffClubService.deleteStaff(id);
            alert("Xóa nhân viên thành công");
            fetchStaff();
        } catch (error) {
            alert(error?.response?.data?.message || "Lỗi khi xóa nhân viên");
        }
    };

    const totalPages = Math.max(1, Math.ceil(staffList.length / itemsPerPage));
    const paginatedStaff = staffList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h1>
                <Link
                    to="/owner/employees/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-200"
                >
                    + Thêm nhân viên
                </Link>
            </div>

            <div className="flex border-b mb-6">
                <button
                    className={`px-4 py-3 font-medium transition duration-200 ${activeTab === "ACTIVE"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    onClick={() => setActiveTab("ACTIVE")}
                >
                    Đang hoạt động
                </button>
                <button
                    className={`px-4 py-3 font-medium transition duration-200 ${activeTab === "BANNED"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    onClick={() => setActiveTab("BANNED")}
                >
                    Đã khóa
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600">STT</th>
                            <th className="p-4 font-semibold text-gray-600">Họ và tên</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Số điện thoại</th>
                            <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                            <th className="p-4 font-semibold text-gray-600 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingData ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                            </tr>
                        ) : staffList.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Không có nhân viên nào trong danh sách.</td>
                            </tr>
                        ) : (
                            paginatedStaff.map((staff, index) => (
                                <tr key={staff._id} className="border-b hover:bg-gray-50 transition duration-150">
                                    <td className="p-4 text-gray-700">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                                    <td className="p-4 font-medium text-gray-800">{staff.fullname}</td>
                                    <td className="p-4 text-gray-600">{staff.email}</td>
                                    <td className="p-4 text-gray-600">{staff.phone || "---"}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${staff.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2 justify-center">
                                        <Link
                                            to={`/owner/employees/edit/${staff._id}`}
                                            className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium transition"
                                        >
                                            Sửa
                                        </Link>
                                        {activeTab === "ACTIVE" ? (
                                            <button
                                                onClick={() => handleBan(staff._id)}
                                                className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-medium transition"
                                            >
                                                Khóa
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUnban(staff._id)}
                                                className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium transition"
                                            >
                                                Mở khóa
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(staff._id)}
                                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {staffList.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                        <div className="text-sm text-gray-500">
                            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, staffList.length)} / {staffList.length} nhân viên
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
                            >
                                Trước
                            </button>
                            <span className="text-sm text-gray-500 font-semibold">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}