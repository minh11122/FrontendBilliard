import { useState, useEffect, useCallback } from "react";
import {
  FileText, CheckCircle2, XCircle, Eye, RefreshCw,
  Loader2, AlertCircle, X, Search
} from "lucide-react";
import { getPosts, approvePost, rejectPost, getDashboardData } from "../../services/staffDashboard.service";

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium
    ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
    {type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    {message}
    <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
  </div>
);

// ─── Status Badge ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  Pending: { label: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-700" },
  Approved: { label: "Đã duyệt", cls: "bg-green-100 text-green-700" },
  Rejected: { label: "Từ chối", cls: "bg-red-100 text-red-600" }
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
};

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

// ─── Detail Modal ────────────────────────────────────────────────────────────
const PostDetailModal = ({ post, onClose }) => {
  const [viewImage, setViewImage] = useState(null);
  if (!post) return null;
  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-lg leading-snug pr-4">{post.title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-3 text-sm">
          {post.image_url && (
            <img src={post.image_url} alt="Ảnh bài đăng" className="w-full h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setViewImage(post.image_url)}/>
          )}
          <div className="flex gap-2">
            <span className="text-gray-500 w-24 flex-shrink-0">CLB:</span>
            <span className="font-medium text-gray-900">{post.club_id?.name || "—"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24 flex-shrink-0">Trạng thái:</span>
            <StatusBadge status={post.status} />
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24 flex-shrink-0">Ngày tạo:</span>
            <span className="text-gray-900">{post.created_at ? new Date(post.created_at).toLocaleString("vi-VN") : "—"}</span>
          </div>
          <div>
            <p className="text-gray-500 mb-1.5">Nội dung:</p>
            <div className="bg-gray-50 rounded-xl p-4 text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">{post.content || "(Không có nội dung)"}</div>
          </div>
          {post.rejected_reason && (
            <div className="p-3 bg-red-50 rounded-xl text-red-700 text-xs">
              <span className="font-semibold">Lý do từ chối:</span> {post.rejected_reason}
            </div>
          )}
        </div>
        <button onClick={onClose} className="mt-5 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium">Đóng</button>
      </div>
    </div>
    {viewImage && <ImageViewerModal src={viewImage} onClose={() => setViewImage(null)} />}
    </>
  );
};

// ─── Reject Reason Modal ─────────────────────────────────────────────────────
const RejectModal = ({ postId, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Lý do từ chối</h3>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Nhập lý do từ chối bài đăng…"
          className="w-full h-28 text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium">Hủy</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[1, 2, 3, 4, 5].map(i => (
      <td key={i} className="py-3.5 px-5">
        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${50 + i * 8}%` }} />
      </td>
    ))}
  </tr>
);

// ─── Filter tabs config ────────────────────────────────────────────────────
const FILTERS = [
  { key: "Pending", label: "Chờ duyệt", active: "bg-yellow-500 text-white" },
  { key: "Approved", label: "Đã duyệt", active: "bg-green-600 text-white" },
  { key: "Rejected", label: "Từ chối", active: "bg-red-500 text-white" }
];

// ─── Main Component ──────────────────────────────────────────────────────────
export const SystemStaff2 = () => {
  const [posts, setPosts] = useState([]);
  const [counts, setCounts] = useState({ Pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [search, setSearch] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCounts = useCallback(async () => {
    try {
      const res = await getDashboardData();
      if (res?.success) {
        setCounts({ Pending: res.data.stats?.pendingPosts || 0 });
      }
    } catch { /* silent */ }
  }, []);

  const fetchPosts = useCallback(async (status) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPosts(status);
      if (res.success) setPosts(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(() => {
      fetchCounts();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  useEffect(() => {
      fetchPosts(filterStatus);
  }, [filterStatus, fetchPosts]);

  const handleTabChange = (key) => {
    setFilterStatus(key);
    setSearch("");
  };

  const handleApprove = async (id) => {
    setActionLoading(p => ({ ...p, [id]: "approve" }));
    try {
      await approvePost(id);
      showToast("Đã duyệt bài đăng!");
      fetchPosts(filterStatus);
      fetchCounts();
    } catch { showToast("Lỗi khi duyệt bài đăng", "error"); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    const id = rejectTarget;
    setActionLoading(p => ({ ...p, [id]: "reject" }));
    setRejectTarget(null);
    try {
      await rejectPost(id, reason);
      showToast("Đã từ chối bài đăng.");
      fetchPosts(filterStatus);
      fetchCounts();
    } catch { showToast("Lỗi khi từ chối bài đăng", "error"); }
    finally { setActionLoading(p => ({ ...p, [id]: null })); }
  };

  const filtered = posts.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.club_id?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const emptyMessages = {
    Pending: { icon: "✅", text: "Không có bài đăng nào chờ duyệt" },
    Approved: { icon: "📝", text: "Chưa có bài đăng nào được duyệt" },
    Rejected: { icon: "🚫", text: "Không có bài đăng nào bị từ chối" }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selected && <PostDetailModal post={selected} onClose={() => setSelected(null)} />}
      {rejectTarget && (
        <RejectModal
          postId={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={!!actionLoading[rejectTarget]}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-orange-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quản lý bài viết</h2>
            <p className="text-xs text-gray-500">Duyệt và quản lý bài đăng của CLB</p>
          </div>
        </div>
        <button onClick={() => fetchPosts(filterStatus)} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg shadow-sm border border-gray-200 bg-white">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          <button onClick={() => fetchPosts(filterStatus)} className="ml-auto font-medium flex items-center gap-1">
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
              placeholder="Tìm kiếm theo tiêu đề, tên CLB…"
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
                  <th className="px-5 py-3 font-semibold">Tiêu đề bài viết</th>
                  <th className="px-5 py-3 font-semibold">CLB đăng</th>
                  <th className="px-5 py-3 font-semibold">Trạng thái</th>
                  <th className="px-5 py-3 font-semibold">Ngày tạo</th>
                  <th className="px-5 py-3 font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <p className="text-3xl mb-2">{emptyMessages[filterStatus]?.icon}</p>
                      <p className="text-sm">{emptyMessages[filterStatus]?.text}</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(post => (
                    <tr key={post._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                        {post.content && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.content}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{post.club_id?.name || "—"}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={post.status} /></td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(post)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Pending → Duyệt + Từ chối */}
                          {post.status === "Pending" && (
                            <>
                              <button
                                disabled={!!actionLoading[post._id]}
                                onClick={() => handleApprove(post._id)}
                                className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading[post._id] === "approve"
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <CheckCircle2 className="w-3 h-3" />}
                                Duyệt
                              </button>
                              <button
                                disabled={!!actionLoading[post._id]}
                                onClick={() => setRejectTarget(post._id)}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading[post._id] === "reject"
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
          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              Hiển thị <span className="font-medium text-gray-600">{filtered.length}</span> bài đăng
              {search && ` (kết quả tìm kiếm cho "${search}")`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
