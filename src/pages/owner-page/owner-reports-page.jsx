import React, { useState, useEffect, useCallback } from "react";
import { getClubAnalytics } from "@/services/club.service";
import { getTournamentsByClub } from "@/services/tournament.service";
import toast from "react-hot-toast";
import {
  Loader2,
  TrendingUp,
  CreditCard,
  DollarSign,
  Trophy,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const TOURNAMENT_STATUS_INFO = {
  Draft: { label: "Bản nháp", color: "bg-gray-100 text-gray-600", bar: "#9ca3af" },
  Open: { label: "Đang mở đăng ký", color: "bg-green-100 text-green-700", bar: "#4ade80" },
  Closed: { label: "Đã đóng đăng ký", color: "bg-yellow-100 text-yellow-700", bar: "#fbbf24" },
  InProgress: { label: "Đang thi đấu", color: "bg-blue-100 text-blue-700", bar: "#60a5fa" },
  Completed: { label: "Đã kết thúc", color: "bg-purple-100 text-purple-700", bar: "#a78bfa" },
  Cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-600", bar: "#f87171" },
};

const FILTER_LABELS = {
  today: "Hôm nay",
  "7days": "7 ngày",
  thisMonth: "Tháng này",
  "30days": "30 ngày",
  "90days": "90 ngày",
};
const FILTER_KEYS = ["today", "7days", "thisMonth", "30days"];

const buildDateRange = (filter) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  if (filter === "7days") start.setDate(end.getDate() - 7);
  if (filter === "30days") start.setDate(end.getDate() - 30);
  if (filter === "90days") start.setDate(end.getDate() - 90);
  if (filter === "thisMonth") start.setDate(1);

  return { start, end };
};

export default function OwnerReportsPage() {
  const clubId = localStorage.getItem("selected_club_id");

  const [bookingFilter, setBookingFilter] = useState("30days");
  const [bookingData, setBookingData] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  const [tournamentFilter, setTournamentFilter] = useState("30days");
  const [tournaments, setTournaments] = useState([]);
  const [tournamentLoading, setTournamentLoading] = useState(true);

  const fetchBooking = useCallback(async (filter) => {
    if (!clubId) return;

    setBookingLoading(true);
    try {
      const { start, end } = buildDateRange(filter);
      const res = await getClubAnalytics(clubId, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      if (res.success) setBookingData(res.data);
      else toast.error("Không thể lấy dữ liệu doanh thu");
    } catch {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setBookingLoading(false);
    }
  }, [clubId]);

  const fetchTournaments = useCallback(async () => {
    if (!clubId) return;

    setTournamentLoading(true);
    try {
      const res = await getTournamentsByClub(clubId);
      if (res?.success) setTournaments(res.data || []);
    } catch {
      // no-op
    } finally {
      setTournamentLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchBooking(bookingFilter);
  }, [bookingFilter, fetchBooking]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const formatMoney = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const filteredTournaments = (() => {
    const { start } = buildDateRange(tournamentFilter);

    return tournaments
      .filter((t) => {
        const d = t.play_date ? new Date(t.play_date) : null;
        return d && d >= start;
      })
      .filter((t) => t.status !== "Draft" && t.status !== "Cancelled");
  })();

  const totalTournamentRevenue = filteredTournaments.reduce(
    (sum, t) => sum + ((t.fee || 0) * (t.registered_player || 0)),
    0
  );

  const tournamentChartData = filteredTournaments
    .filter((t) => (t.fee || 0) * (t.registered_player || 0) > 0)
    .map((t) => ({
      name: t.name.length > 16 ? `${t.name.slice(0, 14)}…` : t.name,
      fullName: t.name,
      revenue: (t.fee || 0) * (t.registered_player || 0),
      status: t.status,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const FilterPills = ({ value, onChange }) => (
    <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
      {FILTER_KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
            value === key
              ? "bg-blue-600 text-white shadow"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {FILTER_LABELS[key]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-10 mx-auto bg-[#F9FAFB] min-h-screen">
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Báo Cáo Doanh Thu
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Doanh thu từ đặt bàn và dịch vụ
            </p>
          </div>
          <FilterPills value={bookingFilter} onChange={setBookingFilter} />
        </div>

        {bookingLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
          </div>
        ) : bookingData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Tổng doanh thu
                  </p>
                  <h3 className="text-2xl font-black text-gray-900">
                    {formatMoney(bookingData.kpi.totalRevenue)}
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Trung bình / hóa đơn
                  </p>
                  <h3 className="text-2xl font-black text-gray-900">
                    {formatMoney(bookingData.kpi.averageOrderValue)}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                Xu hướng doanh thu
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={bookingData.revenue.timeline.map((item) => ({
                      name: item.date.split("-").slice(1).join("/"),
                      "Giờ chơi": item.table,
                      "Dịch vụ & F&B": item.service,
                    }))}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v / 1000}k`}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip formatter={(v) => formatMoney(v)} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="Giờ chơi"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Dịch vụ & F&B"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Trophy size={24} className="text-yellow-500" />
              Doanh thu Giải đấu
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Doanh thu từ phí đăng ký giải đấu
            </p>
          </div>
          <FilterPills value={tournamentFilter} onChange={setTournamentFilter} />
        </div>

        {tournamentLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="animate-spin text-yellow-500 w-8 h-8" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-200/40 col-span-1 md:col-span-1 flex flex-col justify-center">
                <p className="text-sm font-semibold opacity-80 mb-1">
                  Tổng doanh thu giải đấu
                </p>
                <h3 className="text-2xl font-black">
                  {formatMoney(totalTournamentRevenue)}
                </h3>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Trophy size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Số giải đấu
                  </p>
                  <h3 className="text-2xl font-black text-gray-900">
                    {filteredTournaments.length}
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Tổng người tham gia
                  </p>
                  <h3 className="text-2xl font-black text-gray-900">
                    {filteredTournaments.reduce(
                      (sum, t) => sum + (t.registered_player || 0),
                      0
                    )}
                  </h3>
                </div>
              </div>
            </div>

            {tournamentChartData.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp size={16} className="text-yellow-500" />
                    Doanh thu theo giải đấu
                  </h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={tournamentChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f3f4f6"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fontSize: 11, fill: "#374151" }}
                          tickLine={false}
                          axisLine={false}
                          width={120}
                        />
                        <RechartsTooltip
                          cursor={{ fill: "#fef9c3" }}
                          formatter={(val, name, props) => [
                            formatMoney(val),
                            props.payload?.fullName,
                          ]}
                        />
                        <Bar
                          dataKey="revenue"
                          radius={[0, 6, 6, 0]}
                          barSize={20}
                        >
                          {tournamentChartData.map((entry, idx) => (
                            <Cell
                              key={idx}
                              fill={
                                TOURNAMENT_STATUS_INFO[entry.status]?.bar ||
                                "#fbbf24"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center text-center">
                <Trophy size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Chưa có dữ liệu giải đấu
                </h3>
                <p className="text-sm text-gray-500">
                  Khu vực này sẽ hiển thị biểu đồ sau khi có giải đấu sinh ra
                  doanh thu.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
