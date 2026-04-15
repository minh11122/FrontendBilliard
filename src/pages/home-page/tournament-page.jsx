import React, { useState, useEffect } from "react";
import { Search, MapPin, Calendar, CheckCircle } from "lucide-react";
import { getMyRegisteredTournamentIds, getPublicTournaments } from "@/services/tournament.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const TournamentPage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");
  const [registeredIds, setRegisteredIds] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await getPublicTournaments();
        if (res.success) {
          setTournaments(res.data);
        }
      } catch {
        toast.error("Không thể tải danh sách giải đấu");
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchRegistered = async () => {
      try {
        const res = await getMyRegisteredTournamentIds();
        if (res?.success) {
          setRegisteredIds(res.data || []);
        }
      } catch {
        // silent
      }
    };

    fetchRegistered();
  }, []);

  const statusConfig = {
    upcoming: {
      label: "Sắp diễn ra",
      color: "bg-green-100 text-green-600",
      button: "Đăng ký ngay",
      buttonStyle: "bg-green-500 hover:bg-green-600 text-white",
    },
    live: {
      label: "Đang diễn ra",
      color: "bg-blue-100 text-blue-600",
      button: "Xem trực tiếp",
      buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    ended: {
      label: "Đã kết thúc",
      color: "bg-gray-100 text-gray-600",
      button: "Đã kết thúc",
      buttonStyle: "bg-gray-200 text-gray-500 cursor-not-allowed",
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-600",
      button: "Xem chi tiết",
      buttonStyle: "bg-red-50 text-red-600 hover:bg-red-100",
    },
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Giải đấu Bida
          </h1>
          <p className="text-gray-600 text-sm">
            Khám phá và tham gia các giải đấu bida chuyên nghiệp
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              placeholder="Tìm kiếm giải đấu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 text-sm items-center">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "all" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab("live")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "live" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Đang diễn ra
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 border border-gray-300 outline-none hover:bg-gray-200 cursor-pointer transition-all"
            >
              <option value="all">Mọi lệ phí</option>
              <option value="free">Miễn phí</option>
              <option value="under100">Dưới 100.000đ</option>
              <option value="100to500">100.000đ - 500.000đ</option>
              <option value="over500">Trên 500.000đ</option>
            </select>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <p className="text-gray-600">Chưa có giải đấu nào.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            {tournaments
            .filter((t) => {
              if (t.status === "Completed") return false; // Ẩn giải đã kết thúc

              const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) || t.club_id?.name?.toLowerCase().includes(search.toLowerCase());
              let uiStatus = "upcoming";
              if (t.status === "InProgress") uiStatus = "live";

              const matchTab = activeTab === "all" ? true : activeTab === uiStatus;
              
              let matchFee = true;
              const fee = t.fee || 0;
              if (feeFilter === "free") matchFee = fee === 0;
              if (feeFilter === "under100") matchFee = fee > 0 && fee < 100000;
              if (feeFilter === "100to500") matchFee = fee >= 100000 && fee <= 500000;
              if (feeFilter === "over500") matchFee = fee > 500000;

              return matchSearch && matchTab && matchFee;
            })
            .map((t, i) => {
              // Map db status to ui status
              let uiStatus = "upcoming";
              if (t.status === "InProgress") uiStatus = "live";
              if (t.status === "Cancelled") uiStatus = "cancelled";
              if (t.status === "Completed") uiStatus = "ended";

              const cfg = statusConfig[uiStatus];
              const displayDate = t.play_date ? new Date(t.play_date).toLocaleDateString("vi-VN") : "Đang cập nhật";
              const displayClub = t.club_id?.name || "Đang cập nhật";
              const displayFee = t.fee > 0 ? `${t.fee.toLocaleString()} VND` : "Miễn phí";
              const displayImg = t.banner && t.banner.trim().length > 0 ? t.banner : "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=800";
              const isRegistered = registeredIds.includes(String(t._id));

              return (
                <div
                  key={t._id || i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group flex flex-col h-full"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={displayImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={t.name} />
                    <span
                      className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-lg ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    {isRegistered && (
                      <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-lg bg-green-100 text-green-700 shadow-sm">
                        Đã đăng ký
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm mb-3 line-clamp-2 text-gray-900">
                      {t.name}
                    </h3>

                    <div className="space-y-2 text-xs text-gray-600 mb-4 flex-grow">
                      <p className="flex gap-2 items-start">
                        <Calendar size={14} className="flex-shrink-0 mt-0.5 text-green-500" /> <span>{displayDate}</span>
                      </p>
                      <p className="flex gap-2 items-start">
                        <MapPin size={14} className="flex-shrink-0 mt-0.5 text-green-500" /> <span>{displayClub}</span>
                      </p>
                      <p className="flex gap-2 items-start">
                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5 text-green-500" /> <span className="font-medium">{displayFee}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => navigate(`/tournament/${t._id}`)}
                        className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};