import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clubService, getClubAnalytics } from "@/services/club.service";
import { getTournamentsByClub } from "@/services/tournament.service";
import {
  Loader2, LayoutDashboard, CircleDot, Activity, LogOut,
  Clock, PlusCircle, Users, Star, AlertCircle, Trophy, Calendar
} from "lucide-react";

// Nhãn trạng thái giải đấu tiếng Việt
const TOURNAMENT_STATUS_LABELS = {
  Draft:      { label: "Bản nháp",          color: "bg-gray-100 text-gray-600" },
  Open:       { label: "Đang mở đăng ký",   color: "bg-green-100 text-green-700" },
  Closed:     { label: "Đã đóng đăng ký",   color: "bg-yellow-100 text-yellow-700" },
  InProgress: { label: "Đang thi đấu",      color: "bg-blue-100 text-blue-700" },
  Completed:  { label: "Đã kết thúc",       color: "bg-purple-100 text-purple-700" },
  Cancelled:  { label: "Đã hủy",            color: "bg-red-100 text-red-600" },
};

const UPCOMING_STATUSES = ["Open", "Closed"];
const PAST_STATUSES    = ["InProgress", "Completed", "Cancelled"];

// Tính ngày bắt đầu theo filter
const getStartDate = (filter) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (filter === "7days")  d.setDate(d.getDate() - 7);
  if (filter === "30days") d.setDate(d.getDate() - 30);
  if (filter === "90days") d.setDate(d.getDate() - 90);
  if (filter === "thisMonth") d.setDate(1);
  return d;
};

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const clubId  = localStorage.getItem("selected_club_id");
  const clubName = localStorage.getItem("selected_club_name");

  const [loading, setLoading]       = useState(true);
  const [clubData, setClubData]     = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null); // hôm nay (cho KQKD + sao)

  // Dịch vụ — filter riêng
  const [serviceFilter, setServiceFilter]     = useState("today");
  const [serviceData, setServiceData]         = useState(null);
  const [serviceLoading, setServiceLoading]   = useState(false);

  // Rating — toàn thời gian
  const [ratingData, setRatingData] = useState(null);

  // Giải đấu — filter riêng
  const [tournaments, setTournaments]           = useState([]);
  const [tournamentFilter, setTournamentFilter] = useState("7days");
  const [tournamentLoading, setTournamentLoading] = useState(true);

  // Fetch analytics cho dịch vụ theo filter
  const fetchServiceData = useCallback(async (filter) => {
    if (!clubId) return;
    setServiceLoading(true);
    try {
      const start = getStartDate(filter);
      const end   = new Date();
      end.setHours(23, 59, 59, 999);
      const res = await getClubAnalytics(clubId, {
        startDate: start.toISOString(),
        endDate:   end.toISOString(),
      });
      if (res?.success) setServiceData(res.data);
    } catch { /* yên lặng */ } finally {
      setServiceLoading(false);
    }
  }, [clubId]);

  // Khi filter dịch vụ thay đổi
  useEffect(() => { fetchServiceData(serviceFilter); }, [serviceFilter, fetchServiceData]);

  // Khởi tạo dashboard
  useEffect(() => {
    const init = async () => {
      if (!clubId) { navigate("/owner/select-club", { replace: true }); return; }
      setLoading(true);
      try {
        const bankRes = await clubService.getClubBank(clubId);
        const bank = bankRes?.data;
        if (!bank?.payos_client_id || !bank?.has_payos_keys) {
          toast.error("Vui lòng thiết lập PayOS cho CLB trước khi sử dụng dashboard");
          navigate("/owner/settings", { replace: true });
          return;
        }

        const clubRes = await clubService.getClubById(clubId, {
          play_date:  new Date().toISOString().split("T")[0],
          startTime:  new Date().toTimeString().substring(0, 5),
          duration:   2,
        });
        if (clubRes?.success) setClubData(clubRes.data);

        // Analytics hôm nay (cho KQKD + sao đánh giá)
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end   = new Date(); end.setHours(23, 59, 59, 999);
        const aRes = await getClubAnalytics(clubId, {
          startDate: start.toISOString(),
          endDate:   end.toISOString(),
        });
        if (aRes?.success) setAnalyticsData(aRes.data);

        // Rating toàn thời gian (start từ 2020)
        const allStart = new Date("2020-01-01T00:00:00.000Z");
        const ratingRes = await getClubAnalytics(clubId, {
          startDate: allStart.toISOString(),
          endDate:   end.toISOString(),
        });
        if (ratingRes?.success) setRatingData(ratingRes.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [clubId, navigate]);

  // Fetch giải đấu
  useEffect(() => {
    if (!clubId) return;
    (async () => {
      setTournamentLoading(true);
      try {
        const res = await getTournamentsByClub(clubId);
        if (res?.success) setTournaments(res.data || []);
      } catch { /* yên lặng */ } finally {
        setTournamentLoading(false);
      }
    })();
  }, [clubId]);

  // Lọc giải đấu theo khoảng ngày
  const filterTournamentsByRange = (list, filter) => {
    const cutoff = getStartDate(filter);
    return list.filter(t => {
      const d = t.play_date ? new Date(t.play_date) : null;
      return d && d >= cutoff;
    });
  };

  const filteredTournaments   = filterTournamentsByRange(tournaments, tournamentFilter);
  const upcomingTournaments   = tournaments.filter(t =>
    UPCOMING_STATUSES.includes(t.status) && t.play_date && new Date(t.play_date) > new Date()
  );
  const pastTournaments = filteredTournaments.filter(t => PAST_STATUSES.includes(t.status));

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có lịch";
    const d = new Date(dateStr);
    const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")} • ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val || 0);

  const filterLabel = { today: "hôm nay", "7days": "7 ngày qua", thisMonth: "tháng này", "30days": "30 ngày qua", "90days": "90 ngày qua" };
  const filterOptions = [
    { key: "today",     label: "Hôm nay" },
    { key: "7days",     label: "7 ngày" },
    { key: "thisMonth", label: "Tháng này" },
    { key: "30days",    label: "30 ngày" },
  ];

  const serviceFilterOptions = [
    { key: "thisMonth", label: "Tháng này" },
    { key: "30days",    label: "30 ngày" },
    { key: "90days",    label: "90 ngày" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );
  }

  let totalTables = 0, available = 0, playing = 0, held = 0;
  if (clubData?.tables) {
    totalTables = clubData.tables.length;
    clubData.tables.forEach(t => {
      if (t.status === "Available") available++;
      else if (t.status === "Playing") playing++;
      else held++;
    });
  }

  // Tính rating toàn thời gian
  const rating       = ratingData?.feedback?.average ?? 0;
  const ratingCount  = ratingData?.feedback?.total ?? 0;
  const distribution = ratingData?.feedback?.distribution ?? [];
  const roundedRating = Math.round(rating);

  return (
    <div className="p-6 md:p-8 space-y-8 mx-auto font-sans bg-[#F9FAFB] min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-blue-600 w-8 h-8" />
            Tổng quan Hoạt động
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Bảng điều khiển trực tiếp — <strong className="text-gray-800">{clubName}</strong>
          </p>
        </div>
        <button
          onClick={() => navigate("/owner/select-club")}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm"
        >
          <LogOut size={16} /> Đổi chi nhánh
        </button>
      </div>

      {/* ── Row 1: Trạng thái bàn + KQKD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Trạng thái bàn */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CircleDot size={20} className="text-green-500" /> Trạng thái Bàn hiện tại
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-lg text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Trực tiếp
              </div>
            </div>

            {totalTables === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">CLB chưa có bàn bida nào.</p>
                <button onClick={() => navigate("/owner/tables/create")} className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm">
                  Thêm bàn ngay
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { val: totalTables, label: "Tổng cộng",          bg: "bg-gray-50",                   txt: "text-gray-900" },
                    { val: available,   label: "Còn trống",           bg: "bg-green-50 border border-green-100", txt: "text-green-600" },
                    { val: playing,     label: "Đang chơi",           bg: "bg-blue-50 border border-blue-100",   txt: "text-blue-600" },
                    { val: held,        label: "Đặt trước / Bảo trì", bg: "bg-orange-50 border border-orange-100", txt: "text-orange-600" },
                  ].map(({ val, label, bg, txt }) => (
                    <div key={label} className={`flex flex-col items-center justify-center p-4 rounded-2xl ${bg}`}>
                      <span className={`text-4xl font-black ${txt}`}>{val}</span>
                      <span className="text-sm font-semibold mt-1 text-center" style={{ color: "inherit" }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                    <span>Tỉ lệ lấp đầy:</span>
                    <span>{Math.round(((playing + held) / totalTables) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(playing / totalTables) * 100}%` }}   className="bg-blue-500 h-full transition-all" />
                    <div style={{ width: `${(held / totalTables) * 100}%` }}      className="bg-orange-400 h-full transition-all" />
                    <div style={{ width: `${(available / totalTables) * 100}%` }} className="bg-green-500 h-full transition-all" />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Đang chơi</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Đã đặt</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Còn trống</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Thao tác nhanh */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">🚀 Thao tác nhanh</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { to: "/owner/tables/create",    bg: "from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border-blue-100",   icon: <PlusCircle size={20} />, iconClass: "text-blue-600",    label: "Nhập thêm\nBàn bida" },
                { to: "/owner/services/create",  bg: "from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-orange-100", icon: <PlusCircle size={20} />, iconClass: "text-orange-600",  label: "Ra mắt thêm\nMón ăn / Dịch vụ" },
                { to: "/owner/employees/create", bg: "from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border-emerald-100", icon: <Users size={20} />,     iconClass: "text-emerald-600", label: "Tuyển thêm\nNhân viên mới" },
              ].map(({ to, bg, icon, iconClass, label }) => (
                <button key={to} onClick={() => navigate(to)} className={`group p-5 bg-gradient-to-br ${bg} border rounded-2xl transition-all flex flex-col items-start gap-4`}>
                  <div className={`w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center ${iconClass} group-hover:scale-110 transition-transform`}>{icon}</div>
                  <span className={`font-bold ${iconClass.replace("text-", "text-").replace("-600", "-900")} text-sm text-left whitespace-pre-line`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KQKD hôm nay + Đánh giá sao */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">

          {/* KQKD */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-center gap-2 mb-8 opacity-80">
              <Activity size={18} className="text-blue-400" />
              <span className="uppercase text-xs font-bold tracking-widest text-blue-100">KQKD Trong ngày</span>
            </div>
            {analyticsData ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tạm tính doanh thu</p>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                    {formatMoney(analyticsData.kpi.totalRevenue)}
                  </h2>
                </div>
                <div className="space-y-4 pt-6 border-t border-gray-700/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-400 flex items-center gap-2"><Clock size={14} /> Giờ chơi TB</span>
                    <span className="font-bold text-white">{analyticsData.kpi.averagePlayMinutes} <span className="text-xs opacity-50">phút</span></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center opacity-50"><Loader2 className="animate-spin w-8 h-8" /></div>
            )}
            <button onClick={() => navigate("/owner/reports")} className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-bold border border-white/10">
              🔍 Xem báo cáo doanh thu
            </button>
          </div>

          {/* Đánh giá sao — toàn thời gian */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Star size={16} className="text-amber-500" style={{ fill: "#f59e0b" }} /> Đánh giá
            </h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white min-w-[80px]">
                <span className="text-4xl font-black">{rating || "—"}</span>
                <div className="flex mt-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12}
                      style={{ fill: s <= roundedRating ? "white" : "transparent", stroke: "white", strokeWidth: 1.5 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] mt-1 opacity-80">{ratingCount} lượt</span>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map(s => {
                  const entry = distribution.find(f => f.stars === s) || { count: 0 };
                  const pct = ratingCount > 0 ? (entry.count / ratingCount) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600 w-4 shrink-0">{s}</span>
                      <Star size={10} className="text-amber-400 shrink-0" style={{ fill: "#fbbf24" }} />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-5 text-right shrink-0">{entry.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {ratingCount === 0 && (
              <p className="text-xs text-gray-400 italic text-center">Chưa có đánh giá hôm nay.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Dịch vụ với filter riêng ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">🍽️ Dịch vụ</h3>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {serviceFilterOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setServiceFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${serviceFilter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {serviceLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400 w-6 h-6" /></div>
        ) : serviceData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-4">🔥 Gọi nhiều nhất ({filterLabel[serviceFilter]})</h4>
              <div className="space-y-3">
                {serviceData.services.topList.slice(0, 5).map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <span className="font-semibold text-sm text-gray-900">{s.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-600">{s.quantity} lượt</span>
                  </div>
                ))}
                {serviceData.services.topList.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Chưa có lượt gọi dịch vụ.</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-4">❄️ Ít gọi / Cần chú ý ({filterLabel[serviceFilter]})</h4>
              <div className="space-y-3">
                {serviceData.services.bottomList.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                      <span className="font-medium text-sm text-red-900">{s.name}</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{s.quantity} lượt</span>
                  </div>
                ))}
                {serviceData.services.bottomList.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Không có dịch vụ nào ít gọi.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Row 3: Widget Giải đấu ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Giải đấu
          </h3>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {filterOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTournamentFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tournamentFilter === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tournamentLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400 w-6 h-6" /></div>
        ) : (
          <div className="space-y-6">
            {/* Sắp diễn ra */}
            <div>
              <h4 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar size={13} /> Sắp diễn ra
              </h4>
              {upcomingTournaments.length === 0 ? (
                <p className="text-sm text-gray-500 italic pl-1">Không có giải đấu nào sắp diễn ra.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTournaments.map(t => {
                    const si = TOURNAMENT_STATUS_LABELS[t.status] || { label: t.status, color: "bg-gray-100 text-gray-600" };
                    return (
                      <div key={t._id} className="flex items-center justify-between p-3 bg-green-50/60 border border-green-100 rounded-xl gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{t.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(t.play_date)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-500">{t.registered_player || 0}/{t.max_players} người</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${si.color}`}>{si.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Đã / Đang diễn ra */}
            <div>
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">
                Đã & Đang diễn ra ({filterLabel[tournamentFilter]})
              </h4>
              {pastTournaments.length === 0 ? (
                <p className="text-sm text-gray-500 italic pl-1">Không có giải đấu nào trong khoảng này.</p>
              ) : (
                <div className="space-y-2">
                  {pastTournaments.map(t => {
                    const si = TOURNAMENT_STATUS_LABELS[t.status] || { label: t.status, color: "bg-gray-100 text-gray-600" };
                    return (
                      <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{t.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(t.play_date)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-500">{t.registered_player || 0}/{t.max_players} người</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${si.color}`}>{si.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};