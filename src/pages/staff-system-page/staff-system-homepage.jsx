import { useState, useEffect, useCallback, createElement } from "react";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  MessageSquare,
  Trophy,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Activity,
  RefreshCw,
  Loader2,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../../services/staffDashboard.service";

// ─── Helpers ────────────────────────────────────────────────────────────────
// Chuyển thời gian từ backend thành dạng dễ đọc như "5 phút trước", "2 giờ trước".
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString);
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(diffMs / 3600000);
  const d = Math.floor(diffMs / 86400000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  if (h < 24) return `${h} giờ trước`;
  return `${d} ngày trước`;
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
// Card số liệu dùng chung cho các chỉ số đầu trang.
const StatCard = ({ title, value, icon: Icon, subtitle, color = "blue", loading }) => {
  // Mỗi loại card có màu nền, màu icon và màu viền riêng.
  const colors = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100" },
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  };
  const c = colors[color];
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${c.bg}`}>
          {createElement(Icon, { className: `w-5 h-5 ${c.text}` })}
        </div>
        <span className="text-xs text-gray-400">{subtitle}</span>
      </div>
      {loading
        ? <div className="h-8 w-14 bg-gray-200 rounded animate-pulse mb-1" />
        : <h3 className="text-3xl font-bold text-gray-900">{value ?? 0}</h3>
      }
      <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
    </div>
  );
};

// ─── Activity Icon ────────────────────────────────────────────────────────────
// Chọn icon và màu cho từng loại hoạt động gần đây: CLB, bài viết, mua gói.
const activityStyle = (type) => ({
  club: { icon: Building2, bg: "bg-yellow-100", color: "text-yellow-600" },
  post: { icon: MessageSquare, bg: "bg-purple-100", color: "text-purple-600" },
  subscription: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
}[type] || { icon: Activity, bg: "bg-gray-100", color: "text-gray-600" });

// ─── Tournament Badge ────────────────────────────────────────────────────────
// Badge trạng thái giải đấu; hiện tại helper này chưa được render trong phần JSX của trang tổng quan.
const TournamentBadge = ({ status }) => {
  const styles = {
    Opening: "bg-green-100 text-green-700",
    Playing: "bg-blue-100 text-blue-700",
    Closed: "bg-gray-100 text-gray-500",
    Cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

// ─── Main Overview Page ──────────────────────────────────────────────────────
const StaffDashboard = () => {
  // data là toàn bộ dữ liệu dashboard trả về từ API /staff/dashboard.
  const [data, setData] = useState(null);

  // loading/error dùng để điều khiển skeleton và khối báo lỗi khi API thất bại.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // currentTime cập nhật mỗi giây để header luôn hiển thị ngày hiện tại.
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Đồng hồ nội bộ của trang; clearInterval khi rời trang để tránh rò timer.
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Gọi API tổng quan của system staff: số CLB chờ duyệt, bài viết chờ duyệt và hoạt động gần đây.
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardData();
      if (res.success) setData(res.data);
      else setError("Không thể tải dữ liệu");
    } catch (e) {
      setError(e?.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lần đầu vào trang thì tải dữ liệu dashboard.
  useEffect(() => { fetchData(); }, [fetchData]);

  // stats gom các con số dùng cho card; nếu data chưa có thì dùng object rỗng để tránh lỗi undefined.
  const stats = data?.stats || {};

  // Header hiển thị ngày theo định dạng tiếng Việt.
  const vietnameseDate = currentTime.toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header đầu trang: hiển thị tên trang, ngày hiện tại và nút làm mới dữ liệu. */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tổng quan</h2>
          <p className="text-sm text-gray-500 capitalize">{vietnameseDate}</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* Nếu API dashboard lỗi, hiện khung báo lỗi và nút thử lại. */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={fetchData} className="ml-auto font-medium hover:text-red-900 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      )}

      <div className="p-6 max-w-screen-xl mx-auto">
        {/* Ba card số liệu chính lấy từ data.stats của API dashboard. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard loading={loading} title="CLB chờ duyệt" value={stats.pendingClubs} icon={Building2} subtitle="Yêu cầu mới" color="yellow" />
          <StatCard loading={loading} title="Giải đấu đang mở" value={stats.openingTournaments} icon={Trophy} subtitle="Đang diễn ra" color="blue" />
          <StatCard loading={loading} title="Bài viết chờ duyệt" value={stats.pendingPosts} icon={MessageSquare} subtitle="Cần xử lý" color="purple" />
        </div>

        {/* Bên trái là nhiệm vụ cần xử lý, bên phải là hoạt động gần đây. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Nhiệm vụ ưu tiên: gom CLB chờ duyệt và bài viết chờ duyệt. */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Công việc cần xử lý</h3>
              <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {(stats.pendingClubs || 0) + (stats.pendingPosts || 0)} nhiệm vụ
              </span>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {stats.pendingClubs > 0 && (
                  // Nếu có CLB Pending, hiện nhiệm vụ duyệt hồ sơ và nút đi sang trang quản lý CLB.
                  <div className="border-l-4 border-l-red-500 bg-red-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Duyệt hồ sơ CLB mới</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {stats.pendingClubs} CLB đang chờ duyệt:&nbsp;
                          {data?.pendingClubs?.slice(0, 2).map(c => c.name).join(", ")}
                          {stats.pendingClubs > 2 && ` và ${stats.pendingClubs - 2} CLB khác…`}
                        </p>
                        <button
                          onClick={() => navigate("/systemstaff/systemstaff2")}
                          className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          Duyệt ngay <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {stats.pendingPosts > 0 && (
                  // Nếu có bài viết Pending, hiện nhiệm vụ duyệt bài và nút đi sang trang quản lý bài viết.
                  <div className="border-l-4 border-l-yellow-500 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Duyệt bài đăng mới</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {stats.pendingPosts} bài đăng của CLB đang chờ phê duyệt
                        </p>
                        <button
                          onClick={() => navigate("/systemstaff/systemstaff3")}
                          className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-900 flex items-center gap-1"
                        >
                          Xem bài đăng <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && !stats.pendingClubs && !stats.pendingPosts && (
                  // Khi không còn CLB hoặc bài viết chờ duyệt, hiện trạng thái hoàn tất.
                  <div className="text-center py-10 text-gray-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                    <p>Không có công việc nào cần xử lý gấp!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hoạt động gần đây lấy từ data.recentActivity, gồm CLB/bài viết đã xử lý và giao dịch mua gói. */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-gray-900">Hoạt động gần đây</h3>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded animate-pulse w-full" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (data?.recentActivity || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Chưa có hoạt động nào</p>
            ) : (
              <div>
                {(data?.recentActivity || []).map((act, i) => {
                  // Mỗi hoạt động tự chọn icon/màu theo act.type rồi format thời gian tương đối.
                  const { icon: Icon, bg, color } = activityStyle(act.type);
                  return (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                      <div className={`p-1.5 rounded-lg ${bg} flex-shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">{act.text}</p>
                        <span className="text-xs text-gray-400">{formatRelativeTime(act.time)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
