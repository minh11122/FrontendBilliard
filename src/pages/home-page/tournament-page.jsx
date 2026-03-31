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
      color: "bg-gray-200 text-gray-600",
      button: "Xem kết quả",
      buttonStyle: "bg-gray-200 text-gray-500 cursor-not-allowed",
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Danh sách Giải đấu Công cộng
          </h1>
          <p className="text-gray-500 text-sm">
            Khám phá, tham gia và tranh tài tại các giải đấu bida chuyên nghiệp.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Tìm kiếm giải đấu theo tên, CLB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-sm items-center">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg ${activeTab === "all" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab("live")}
              className={`px-3 py-1.5 rounded-lg ${activeTab === "live" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Đang diễn ra
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 outline-none hover:bg-gray-200 cursor-pointer"
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
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <p className="text-gray-500">Chưa có giải đấu nào.</p>
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
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="relative">
                    <img src={displayImg} className="h-40 w-full object-cover" alt="" />
                    <span
                      className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    {isRegistered && (
                      <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                        Đã đăng ký
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-3 line-clamp-2">
                      {t.name}
                    </h3>

                    <div className="space-y-1 text-xs text-gray-500 mb-4">
                      <p className="flex gap-1 items-center">
                        <Calendar size={12} /> {displayDate}
                      </p>
                      <p className="flex gap-1 items-center">
                        <MapPin size={12} /> {displayClub}
                      </p>
                      <p className="flex gap-1 items-center">
                        <CheckCircle size={12} /> {displayFee}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/tournament/${t._id}`)}
                        className="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
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