import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus, Search, Eye, Pencil, Trash2, RotateCcw, AlertTriangle,
  ChevronLeft, ChevronRight, ConciergeBell, Ban, CheckCircle2
} from "lucide-react";

import {
  getServices, deactivateService, reactivateService, deleteServicePermanently, getServiceById
} from "@/services/service.service";

export default function OwnerServiceListPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [statusCounts, setStatusCounts] = useState({ active: 0, inactive: 0, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Active");
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("deactivate"); // "deactivate" or "permanent"

  const CLUB_ID = localStorage.getItem("selected_club_id") || "";

  const fetchServices = async (page = 1) => {
    if (!CLUB_ID) return;
    setIsLoading(true);
    try {
      const res = await getServices({ club_id: CLUB_ID, page, limit: 10, search: searchTerm, status: activeTab });
      if (res.data.success) {
        setServices(res.data.data);
        setPagination(res.data.pagination);
        setStatusCounts(res.data.statusCounts);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(1);
  }, [activeTab, CLUB_ID]);

  const handleSearch = () => fetchServices(1);
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  const handleViewDetail = async (id) => {
    try {
      const res = await getServiceById(id);
      if (res.data.success) {
        setSelectedService(res.data.data);
        setShowDetailModal(true);
      }
    } catch {
      toast.error("Không thể tải thông tin dịch vụ");
    }
  };

  const openDeleteConfirm = (service, type) => {
    setDeleteTarget(service);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteType === "deactivate") {
        await deactivateService(deleteTarget._id);
        toast.success("Đã vô hiệu hóa dịch vụ");
      } else if (deleteType === "permanent") {
        await deleteServicePermanently(deleteTarget._id);
        toast.success("Đã xóa vĩnh viễn dịch vụ");
      } else if (deleteType === "reactivate") {
        await reactivateService(deleteTarget._id);
        toast.success("Đã khôi phục dịch vụ");
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchServices(pagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const tabs = [
    { key: "Active", label: "Đang hoạt động", count: statusCounts.active, icon: CheckCircle2, color: "text-emerald-600" },
    { key: "Inactive", label: "Đã vô hiệu hóa", count: statusCounts.inactive, icon: Ban, color: "text-red-500" }
  ];

  return (
    <div className="flex-1 p-6 lg:p-10 mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-sm mb-6">
        <span className="text-slate-500">Trang chủ</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Quản lý Dịch vụ</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl"><ConciergeBell className="text-orange-600" size={26} /></div>
            Quản lý Dịch vụ
          </h1>
          <p className="text-slate-500 mt-1 ml-14">Tổng cộng {statusCounts.total} dịch vụ trong hệ thống</p>
        </div>
        {activeTab === "Active" && (
          <button onClick={() => navigate("/owner/services/create")}
            className="px-4 py-2.5 bg-primary text-slate-900 rounded-xl hover:bg-[#0fd650] font-semibold transition-all shadow-sm shadow-primary/30 flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} /> Thêm dịch vụ
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
          >
            <tab.icon size={16} className={activeTab === tab.key ? tab.color : ""} />
            {tab.label}
            <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
              }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
            />
          </div>
          <button onClick={handleSearch}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-all text-sm">
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
              <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ConciergeBell size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-slate-500">
              {activeTab === "Active" ? "Chưa có dịch vụ nào" : "Không có dịch vụ bị vô hiệu hóa"}
            </p>
            <p className="text-sm mt-1">
              {activeTab === "Active" ? "Nhấn \"Thêm dịch vụ\" để tạo dịch vụ đầu tiên" : "Các dịch vụ bị vô hiệu hóa sẽ hiển thị ở đây"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên dịch vụ</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hình ảnh</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả</th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((service) => (
                    <tr key={service._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{service.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-600">{formatPrice(service.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {service.images && service.images.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <img src={service.images[0]} alt="ảnh" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                            {service.images.length > 1 && (
                              <span className="text-xs text-slate-400 font-medium">+{service.images.length - 1}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">Chưa có ảnh</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500 truncate max-w-[200px]">{service.description || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {activeTab === "Active" ? (
                            <>
                              <button onClick={() => handleViewDetail(service._id)} title="Xem chi tiết"
                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                                <Eye size={18} />
                              </button>
                              <button onClick={() => navigate(`/owner/services/edit/${service._id}`)} title="Chỉnh sửa"
                                className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                                <Pencil size={18} />
                              </button>
                              <button onClick={() => openDeleteConfirm(service, "deactivate")} title="Vô hiệu hóa"
                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                <Ban size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => openDeleteConfirm(service, "reactivate")} title="Khôi phục"
                                className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors">
                                <RotateCcw size={18} />
                              </button>
                              <button onClick={() => openDeleteConfirm(service, "permanent")} title="Xóa vĩnh viễn"
                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                <p className="text-sm text-slate-500">
                  Hiển thị {services.length} / {pagination.total} dịch vụ
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchServices(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button key={i + 1} onClick={() => fetchServices(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${pagination.currentPage === i + 1
                          ? "bg-primary text-slate-900 shadow-sm"
                          : "border border-slate-200 hover:bg-white text-slate-600"
                        }`}>
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => fetchServices(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><ConciergeBell className="text-blue-600" size={20} /></div>
              Chi tiết dịch vụ
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Tên dịch vụ</p>
                <p className="font-semibold text-slate-900">{selectedService.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Giá</p>
                <p className="font-semibold text-emerald-600">{formatPrice(selectedService.price)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${selectedService.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                  {selectedService.status === "Active" ? "Đang hoạt động" : "Vô hiệu hóa"}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày tạo</p>
                <p className="font-medium text-slate-700 text-sm">
                  {selectedService.created_at ? new Date(selectedService.created_at).toLocaleDateString("vi-VN") : "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Mô tả</p>
                <p className="text-sm text-slate-700">{selectedService.description || "Không có mô tả"}</p>
              </div>
              {selectedService.images && selectedService.images.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-2">Hình ảnh</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedService.images.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full aspect-square object-cover rounded-lg border border-slate-200 hover:opacity-80 transition-opacity cursor-pointer" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-full mb-4 ${deleteType === "reactivate" ? "bg-emerald-100" : "bg-red-100"
                }`}>
                {deleteType === "reactivate" ? (
                  <RotateCcw className="text-emerald-600" size={28} />
                ) : (
                  <AlertTriangle className={deleteType === "permanent" ? "text-red-600" : "text-orange-500"} size={28} />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {deleteType === "deactivate" && "Vô hiệu hóa dịch vụ?"}
                {deleteType === "permanent" && "Xóa vĩnh viễn dịch vụ?"}
                {deleteType === "reactivate" && "Khôi phục dịch vụ?"}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {deleteType === "deactivate" && `Dịch vụ "${deleteTarget.name}" sẽ bị ẩn khỏi danh sách hoạt động. Bạn có thể khôi phục sau.`}
                {deleteType === "permanent" && `Dịch vụ "${deleteTarget.name}" sẽ bị xóa vĩnh viễn và không thể khôi phục!`}
                {deleteType === "reactivate" && `Dịch vụ "${deleteTarget.name}" sẽ được khôi phục về danh sách hoạt động.`}
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-all">
                  Hủy
                </button>
                <button onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-white transition-all ${deleteType === "reactivate" ? "bg-emerald-600 hover:bg-emerald-700" :
                      deleteType === "permanent" ? "bg-red-600 hover:bg-red-700" :
                        "bg-orange-500 hover:bg-orange-600"
                    }`}>
                  {deleteType === "deactivate" && "Vô hiệu hóa"}
                  {deleteType === "permanent" && "Xóa vĩnh viễn"}
                  {deleteType === "reactivate" && "Khôi phục"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
