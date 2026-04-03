import { useState, useEffect, useCallback } from "react";
import {
    BarChart3, Trophy, MessageSquare, Star, RefreshCw,
    Loader2, AlertCircle, X, ChevronDown, ChevronUp
} from "lucide-react";
import { getDashboardData } from "../../services/staffDashboard.service";

// ─── Tournament Status Badge ──────────────────────────────────────────────
const TournamentBadge = ({ status }) => {
    const map = {
        Open: "bg-green-100 text-green-700",
        InProgress: "bg-blue-100 text-blue-700",
        Closed: "bg-gray-100 text-gray-500",
        Completed: "bg-purple-100 text-purple-700",
        Cancelled: "bg-red-100 text-red-600",
    };
    const labels = { Open: "Đang mở", InProgress: "Đang thi đấu", Closed: "Đã chốt", Completed: "Hoàn thành", Cancelled: "Đã hủy" };
    return (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-500"}`}>
            {labels[status] || status}
        </span>
    );
};

// ─── Star rating ──────────────────────────────────────────────────────────
const StarRating = ({ rating }) => (
    <div className="flex">
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
        ))}
    </div>
);

const formatRelativeTime = (d) => {
    if (!d) return "";
    const ms = Date.now() - new Date(d);
    const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dd = Math.floor(ms / 86400000);
    if (m < 1) return "vừa xong";
    if (m < 60) return `${m} phút trước`;
    if (h < 24) return `${h} giờ trước`;
    return `${dd} ngày trước`;
};

// ─── Main Component ───────────────────────────────────────────────────────
export const SystemStaff4 = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("tournaments");
    const [expandedTournament, setExpandedTournament] = useState(null);

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

    const tournaments = data?.tournaments || [];
    const feedbacks = data?.pendingFeedbacks || [];

    // Tournament stats
    const tStats = {
        total: tournaments.length,
        opening: tournaments.filter(t => t.status === "Open").length,
        playing: tournaments.filter(t => t.status === "InProgress").length,
        closed: tournaments.filter(t => t.status === "Closed" || t.status === "Completed").length,
    };

    // Feedback stats
    const avgRating = feedbacks.length
        ? (feedbacks.reduce((a, f) => a + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
        : "—";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Thống kê</h2>
                        <p className="text-xs text-gray-500">Giải đấu và phản hồi khách hàng</p>
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

            <div className="p-6 max-w-screen-xl mx-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "Tổng giải đấu", value: tStats.total, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Đang mở đăng ký", value: tStats.opening, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Đang thi đấu", value: tStats.playing, color: "text-orange-600", bg: "bg-orange-50" },
                    ].map((card, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                            <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-3`}>
                                <Trophy className={`w-5 h-5 ${card.color}`} />
                            </div>
                            {loading
                                ? <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
                                : <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>}
                            <p className="text-sm text-gray-600 mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => setTab("tournaments")}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${tab === "tournaments" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                        <Trophy className="w-4 h-4" /> Giải đấu
                        <span className={`px-1.5 py-0.5 text-xs rounded-full ${tab === "tournaments" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {tStats.total}
                        </span>
                    </button>
                </div>

                {/* Tournaments Tab */}
                {tab === "tournaments" && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 bg-gray-50 uppercase tracking-wide border-b border-gray-200">
                                        <th className="px-5 py-3 font-semibold">Tên giải đấu</th>
                                        <th className="px-5 py-3 font-semibold">Trạng thái</th>
                                        <th className="px-5 py-3 font-semibold">Ngày bắt đầu</th>
                                        <th className="px-5 py-3 font-semibold">Hết hạn ĐK</th>
                                        <th className="px-5 py-3 font-semibold">SL tối đa</th>
                                        <th className="px-5 py-3 font-semibold">Phí</th>
                                        <th className="px-5 py-3 font-semibold">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => (
                                            <tr key={i}>
                                                {[1, 2, 3, 4, 5, 6, 7].map(j => (
                                                    <td key={j} className="px-5 py-3">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${40 + j * 7}%` }} />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : tournaments.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                                            <Trophy className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                                            <p>Chưa có giải đấu nào</p>
                                        </td></tr>
                                    ) : (
                                        tournaments.map(t => (
                                            <>
                                                <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3.5 font-medium text-gray-900">{t.name}</td>
                                                    <td className="px-5 py-3.5"><TournamentBadge status={t.status} /></td>
                                                    <td className="px-5 py-3.5 text-gray-600 text-xs">
                                                        {(t.started_at || t.play_date || t.start_time) ? new Date(t.started_at || t.play_date || t.start_time).toLocaleDateString("vi-VN") : "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-600 text-xs">
                                                        {t.registration_deadline ? new Date(t.registration_deadline).toLocaleDateString("vi-VN") : "—"}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-gray-600">{t.max_players ?? "—"}</td>
                                                    <td className="px-5 py-3.5 text-gray-600">
                                                        {t.fee ? t.fee.toLocaleString("vi-VN") + " ₫" : "Miễn phí"}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <button
                                                            onClick={() => setExpandedTournament(expandedTournament === t._id ? null : t._id)}
                                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                        >
                                                            {expandedTournament === t._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                            {expandedTournament === t._id ? "Thu gọn" : "Xem"}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedTournament === t._id && (
                                                    <tr key={`${t._id}-detail`} className="bg-blue-50">
                                                        <td colSpan={7} className="px-5 py-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500 text-xs mb-1">Thể lệ</p>
                                                                    <p className="text-gray-800">{t.description || "Không có thể lệ"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs mb-1">Giải thưởng</p>
                                                                    <p className="text-gray-800">{t.prize_pool || "Chưa cài đặt giải thưởng"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 text-xs mb-1">Ngày kết thúc</p>
                                                                    <p className="text-gray-800">{(t.completed_at || t.end_time) ? new Date(t.completed_at || t.end_time).toLocaleDateString("vi-VN") : "—"}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};
