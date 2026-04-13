import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, CheckCircle2, XCircle, Eye, Lock, LockOpen,
  RefreshCw, Loader2, AlertCircle, X, Search, Bell
} from "lucide-react";
import {
  getClubs, getDashboardData,
  approveClub, rejectClub, lockClub, unlockClub,
  getStaffNotifications, markStaffNotificationRead, markAllStaffNotificationsRead
} from "../../services/staffDashboard.service";
import { getClubById } from "../../services/club.service";

// ─── Toast ─────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium
    ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
    {type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    {message}
    <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
  </div>
);

// ─── Status Badge ──────────────────────────────────────────────────────────
const STATUS_MAP = {
  Pending: { label: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-700" },
  Approved: { label: "Đã duyệt", cls: "bg-green-100 text-green-700" },
  Rejected: { label: "Từ chối", cls: "bg-red-100 text-red-600" },
  Locked: { label: "Đã khoá", cls: "bg-gray-100 text-gray-500" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[1, 2, 3, 4, 5, 6].map(i => (
      <td key={i} className="py-3.5 px-5">
        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${50 + i * 8}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Image Viewer Modal ──────────────────────────────────────────────────────
const ImageViewerModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors z-[70]">
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt="Toàn màn hình" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>
  );
};

// ─── Detail Modal ──────────────────────────────────────────────────────────
const ClubDetailModal = ({ club, onClose }) => {
  const [viewImage, setViewImage] = useState(null);
  if (!club) return null;
  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg">{club.name}</h3>
            <StatusBadge status={club.status} />
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 text-sm">
            {[
              ["Địa chỉ", club.address],
              ["Số điện thoại", club.phone],
              ["Mã số thuế", club.tax_code],
              ["Mô tả", club.description || "Không có"],
              ["Giờ hoạt động", `${club.opening_time || "08:00"} - ${club.closing_time || "23:30"}`],
              ["Số lượng bàn", club.tables ? `${club.tables.length} bàn` : "Đang tải..."],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">{label}:</span>
                <span className="text-gray-900 font-medium break-all">{value}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 text-sm">
            {[
              ["Email chủ CLB", club.account_id?.email || "—"],
              ["Họ tên chủ CLB", club.account_id?.fullname || "—"],
              ["Ngày đăng ký", club.created_at ? new Date(club.created_at).toLocaleString("vi-VN") : "—"],
              ["Gói hệ thống", club.subscription_name ? <span className="text-blue-600 font-semibold">{club.subscription_name}</span> : <span className="text-gray-500 italic">Mặc định</span>]
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">{label}:</span>
                <span className="text-gray-900 font-medium break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {club.images && club.images.length > 0 ? (
          <div className="mt-6 border-t pt-4">
            <span className="text-gray-800 font-semibold block mb-4">Tài liệu & Hình ảnh:</span>
            <div className="space-y-6">
              {['Avatar', 'Banner', 'Background', 'legal documents'].map(type => {
                const groupImgs = club.images.filter(i => i.image_type === type);
                if (groupImgs.length === 0) return null;
                const label = type === 'legal documents' ? 'Tài liệu kinh doanh' : type;
                return (
                  <div key={type}>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{label}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {groupImgs.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setViewImage(img.image_url)}>
                          <img src={img.image_url} alt={`${label} ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : club.legal_document_image ? (
          <div className="mt-6 border-t pt-4">
            <span className="text-gray-800 font-semibold block mb-2">Tài liệu kinh doanh:</span>
            <img src={club.legal_document_image} alt="Giấy phép" className="w-full md:w-1/3 h-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setViewImage(club.legal_document_image)} />
          </div>
        ) : null}

        <button onClick={onClose}
          className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors">
          Đóng
        </button>
      </div>
    </div>
    {viewImage && <ImageViewerModal src={viewImage} onClose={() => setViewImage(null)} />}
    </>
  );
};

// ─── Filter tabs config ────────────────────────────────────────────────────
const FILTERS = [
  { key: "Pending", label: "Chờ duyệt", active: "bg-yellow-500 text-white", dot: "bg-yellow-500" },
  { key: "Approved", label: "Đã duyệt", active: "bg-green-600 text-white", dot: "bg-green-500" },
  { key: "Rejected", label: "Từ chối", active: "bg-red-500 text-white", dot: "bg-red-500" },
  { key: "Locked", label: "Đã khoá", active: "bg-gray-500 text-white", dot: "bg-gray-400" },
];

// ─── Main Component ────────────────────────────────────────────────────────
export const SystemStaff1 = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [counts, setCounts] = useState({ Pending: 0, Approved: 0, Rejected: 0, Locked: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  
  const popupRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getStaffNotifications();
      if (res?.success) {
        setNotifications(res.data || []);
      }
    } catch { /* silent */ }
  }, []);

  // Fetch count badges from dashboard (non-blocking)
  const fetchCounts = useCallback(async () => {
    try {
      const res = await getDashboardData();
      if (res?.success) {
        const s = res.data.stats || {};
        setCounts(prev => ({ ...prev, Pending: s.pendingClubs || 0 }));
      }
    } catch { /* silent */ }
  }, []);


  // Fetch clubs for current filter tab
  const fetchClubs = useCallback(async (status) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getClubs(status);
      if (res.success) setClubs(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    fetchNotifications();
    // Poll every 10 seconds for new counts and notifications
    const interval = setInterval(() => {
      fetchCounts();
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchCounts, fetchNotifications]);

  // Handle click outside to close unread popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowNotificationPopup(false);
      }
    };
    if (showNotificationPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationPopup]);

  useEffect(() => {
    fetchClubs(filterStatus);
  }, [filterStatus, fetchClubs]);

  const handleReadNotification = async (notifId) => {
    try {
        await markStaffNotificationRead(notifId);
        fetchNotifications();
    } catch (e) { console.error(e); }
  };
  
  const handleReadAll = async () => {
      try {
          await markAllStaffNotificationsRead();
          fetchNotifications();
      } catch (e) { console.error(e); }
  };

  const handleTabChange = (key) => {
    setFilterStatus(key);
    setSearch("");
  };

  const handleViewDetail = async (club) => {
    try {
      setDetailLoading(true);
      setSelected(club); // Hiển thị khung sườn ngay lập tức
      const res = await getClubById(club._id);
      if (res?.success) {
        setSelected({ ...res.data, account_id: club.account_id, status: club.status });
      } else {
        showToast("Không thể tải chi tiết CLB", "error");
      }
    } catch (e) {
      showToast("Lỗi tải chi tiết CLB", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const withAction = async (id, action, successMsg, errorMsg, fn) => {
    setActionLoading(p => ({ ...p, [id]: action }));
    try {
      await fn();
      showToast(successMsg);
      fetchClubs(filterStatus);
      fetchCounts();
    } catch {
      showToast(errorMsg, "error");
    } finally {
      setActionLoading(p => ({ ...p, [id]: null }));
    }
  };

  const handleApprove = (id) =>
    withAction(id, "approve", "Đã duyệt CLB thành công!", "Lỗi khi duyệt CLB", () => approveClub(id));

  const handleReject = (id) => {
    const reason = window.prompt("Vui lòng nhập lý do từ chối:");
    if (reason === null) return; // user cancelled
    if (!reason.trim()) {
      showToast("Vui lòng nhập lý do từ chối", "error");
      return;
    }
    withAction(id, "reject", "Đã từ chối CLB.", "Lỗi khi từ chối CLB", () => rejectClub(id, reason.trim()));
  };

  const handleLock = (id) =>
    withAction(id, "lock", "Đã khoá CLB.", "Lỗi khi khoá CLB", () => lockClub(id));

  const handleUnlock = (id) =>
    withAction(id, "unlock", "Đã mở khoá CLB.", "Lỗi khi mở khoá CLB", () => unlockClub(id));

  const filtered = clubs.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  const emptyMessages = {
    Pending: { icon: "✅", text: "Không có CLB nào đang chờ duyệt" },
    Approved: { icon: "🏢", text: "Chưa có CLB nào được duyệt" },
    Rejected: { icon: "🚫", text: "Không có CLB nào bị từ chối" },
    Locked: { icon: "🔒", text: "Không có CLB nào bị khoá" },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {selected && <ClubDetailModal club={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-yellow-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quản lý CLB</h2>
            <p className="text-xs text-gray-500">Phê duyệt và quản lý câu lạc bộ</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Nút Chuông Thông Báo */}
          <div className="relative" ref={popupRef}>
            <button
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              title="Thông báo mới"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {showNotificationPopup && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden transform origin-top-right animate-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <h3 className="font-semibold text-sm text-gray-800">Thông báo mới</h3>
                  {unreadCount > 0 && (
                      <button 
                        onClick={handleReadAll}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          Đánh dấu đã đọc
                      </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      Không có thông báo mới nào
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif._id} 
                        onClick={() => handleReadNotification(notif._id)}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors flex gap-3 items-start ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {!notif.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>}
                        </div>
                        <div>
                          <p className={`text-sm text-gray-900 line-clamp-1 ${!notif.is_read ? 'font-medium' : ''}`}>{notif.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleString("vi-VN", {
                                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nút Làm Mới */}
          <button
            onClick={() => fetchClubs(filterStatus)}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm bg-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          <button onClick={() => fetchClubs(filterStatus)} className="ml-auto font-medium flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      )}

      <div className="p-6">
        {/* Filter tabs + Search */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên, địa chỉ…"
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => handleTabChange(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterStatus === f.key
                  ? f.active
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {f.label}
                {f.key === "Pending" && counts.Pending > 0 && (
                  <span className={`inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full
                    ${filterStatus === f.key ? "bg-white/30 text-white" : "bg-yellow-100 text-yellow-700"}`}>
                    {counts.Pending}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 bg-gray-50 uppercase tracking-wide border-b border-gray-200">
                  <th className="px-5 py-3 font-semibold">Tên CLB</th>
                  <th className="px-5 py-3 font-semibold">Địa chỉ</th>
                  <th className="px-5 py-3 font-semibold">SĐT</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold">Ngày đăng ký</th>
                  <th className="px-5 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <p className="text-3xl mb-2">{emptyMessages[filterStatus]?.icon}</p>
                      <p className="text-sm">{emptyMessages[filterStatus]?.text}</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(club => (
                    <tr key={club._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium text-gray-900">{club.name}</p>
                          {club.account_id?.email && (
                            <p className="text-xs text-gray-400 mt-0.5">{club.account_id.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-[180px]">
                        <span className="line-clamp-2 text-xs">{club.address}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{club.phone}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={club.status} /></td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {club.created_at ? new Date(club.created_at).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* Xem chi tiết */}
                          <button
                            onClick={() => handleViewDetail(club)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Pending → Duyệt + Từ chối */}
                          {club.status === "Pending" && (
                            <>
                              <button
                                disabled={!!actionLoading[club._id]}
                                onClick={() => handleApprove(club._id)}
                                className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading[club._id] === "approve"
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <CheckCircle2 className="w-3 h-3" />}
                                Duyệt
                              </button>
                              <button
                                disabled={!!actionLoading[club._id]}
                                onClick={() => handleReject(club._id)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading[club._id] === "reject"
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <XCircle className="w-3 h-3" />}
                                Từ chối
                              </button>
                            </>
                          )}

                          {/* Approved → Khoá */}
                          {club.status === "Approved" && (
                            <button
                              disabled={!!actionLoading[club._id]}
                              onClick={() => handleLock(club._id)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionLoading[club._id] === "lock"
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Lock className="w-3 h-3" />}
                              Khoá
                            </button>
                          )}

                          {/* Locked → Mở khoá */}
                          {club.status === "Locked" && (
                            <button
                              disabled={!!actionLoading[club._id]}
                              onClick={() => handleUnlock(club._id)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1"
                            >
                              {actionLoading[club._id] === "unlock"
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <LockOpen className="w-3 h-3" />}
                              Mở khoá
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Hiển thị <span className="font-medium text-gray-600">{filtered.length}</span> CLB
              {search && ` (kết quả tìm kiếm cho "${search}")`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
