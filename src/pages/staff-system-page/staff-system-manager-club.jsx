import { useState, useEffect, useCallback } from "react";
import {
  Building2, CheckCircle2, XCircle, Eye, Clock,
  RefreshCw, Loader2, AlertCircle, X, Search
} from "lucide-react";
import { getDashboardData, approveClub, rejectClub } from "../../services/staffDashboard.service";

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
const StatusBadge = ({ status }) => {
  const map = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-600",
    Locked: "bg-gray-100 text-gray-500",
  };
  const labels = { Pending: "Chờ duyệt", Approved: "Đã duyệt", Rejected: "Từ chối", Locked: "Khoá" };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {labels[status] || status}
    </span>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[1, 2, 3, 4, 5, 6].map(i => (
      <td key={i} className="py-3 pr-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${50 + i * 8}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Detail Modal ──────────────────────────────────────────────────────────
const ClubDetailModal = ({ club, onClose }) => {
  if (!club) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">{club.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-3 text-sm">
          {[
            ["Địa chỉ", club.address],
            ["Số điện thoại", club.phone],
            ["Mã số thuế", club.tax_code],
            ["Email chủ CLB", club.account_id?.email || "—"],
            ["Họ tên chủ CLB", club.account_id?.fullname || "—"],
            ["Mô tả", club.description || "Không có"],
            ["Ngày đăng ký", club.created_at ? new Date(club.created_at).toLocaleString("vi-VN") : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="text-gray-500 w-36 flex-shrink-0">{label}:</span>
              <span className="text-gray-900 font-medium">{value}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-5 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium">
          Đóng
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
export const SystemStaff1 = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [search, setSearch] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardData();
      if (res.success) {
        // Dashboard trả về pendingClubs, nhưng cần tất cả clubs
        setClubs(res.data.pendingClubs || []);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id) => {
    setActionLoading(p => ({ ...p, [id]: "approve" }));
    try {
      await approveClub(id);
      showToast("Đã duyệt CLB thành công!");
      fetchData();
    } catch {
      showToast("Lỗi khi duyệt CLB", "error");
    } finally {
      setActionLoading(p => ({ ...p, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading(p => ({ ...p, [id]: "reject" }));
    try {
      await rejectClub(id);
      showToast("Đã từ chối CLB.");
      fetchData();
    } catch {
      showToast("Lỗi khi từ chối CLB", "error");
    } finally {
      setActionLoading(p => ({ ...p, [id]: null }));
    }
  };

  const filtered = clubs.filter(c =>
  (!search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          <button onClick={fetchData} className="ml-auto font-medium flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      )}

      <div className="p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
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
          <div className="flex gap-1">
            {["Pending", "Approved", "Rejected", "Locked"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(prev => prev === s ? "" : s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {{ Pending: "Chờ duyệt", Approved: "Đã duyệt", Rejected: "Từ chối", Locked: "Khoá" }[s]}
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
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-300" />
                    <p>Không có CLB nào trong danh sách</p>
                  </td></tr>
                ) : (
                  filtered.map(club => (
                    <tr key={club._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
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
                          <button
                            onClick={() => setSelected(club)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
