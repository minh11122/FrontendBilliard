import { useState, useEffect, useCallback } from "react";
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
const StatCard = ({ title, value, icon: Icon, subtitle, color = "blue", loading }) => {
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
          <Icon className={`w-5 h-5 ${c.text}`} />
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
const activityStyle = (type) => ({
  club: { icon: Building2, bg: "bg-yellow-100", color: "text-yellow-600" },
  post: { icon: MessageSquare, bg: "bg-purple-100", color: "text-purple-600" },
  subscription: { icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
}[type] || { icon: Activity, bg: "bg-gray-100", color: "text-gray-600" });

// ─── Tournament Badge ────────────────────────────────────────────────────────
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = data?.stats || {};
  const vietnameseDate = currentTime.toLocaleDateString("vi-VN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
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

      {/* Error */}
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard loading={loading} title="CLB chờ duyệt" value={stats.pendingClubs} icon={Building2} subtitle="Yêu cầu mới" color="yellow" />
          <StatCard loading={loading} title="Giải đấu đang mở" value={stats.openingTournaments} icon={Trophy} subtitle="Đang diễn ra" color="blue" />
          <StatCard loading={loading} title="Bài viết chờ duyệt" value={stats.pendingPosts} icon={MessageSquare} subtitle="Cần xử lý" color="purple" />
        </div>

        {/* Priority Tasks + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Tasks */}
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
                  <div className="text-center py-10 text-gray-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                    <p>Không có công việc nào cần xử lý gấp!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
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