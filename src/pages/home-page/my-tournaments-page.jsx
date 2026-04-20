import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, Lock, MapPin, Search, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import api from "@/lib/axios";

const statusConfig = {
  upcoming: {
    label: "Sắp diễn ra",
    color: "bg-green-100 text-green-600",
  },
  live: {
    label: "Đang diễn ra",
    color: "bg-blue-100 text-blue-600",
  },
  ended: {
    label: "Đã kết thúc",
    color: "bg-gray-200 text-gray-600",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-600",
  },
};

export const MyTournamentsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyTournaments = async () => {
      try {
        const res = await api.get("/tournaments/my/tournaments");
        if (res.data?.success) {
          setMyTournaments(res.data.data || []);
          
          const params = new URLSearchParams(window.location.search);
          const tId = params.get("tournamentId");
          if (tId) {
             navigate(`/tournament/${tId}`, { replace: true, state: { from: "/my-tournaments" } });
          }
        }
      } catch {
        toast.error("Không thể tải danh sách giải đấu của bạn");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTournaments();
  }, [user]);

  const filtered = myTournaments
    .filter((item) => {
      const tournament = item.tournament;
      if (!tournament) return false;
      
      // Map status to UI status
      let uiStatus = "upcoming";
      if (tournament.status === "InProgress") uiStatus = "live";
      if (tournament.status === "Cancelled") uiStatus = "cancelled";
      if (tournament.status === "Completed") uiStatus = "ended";

      // Filter by tab
      const matchTab = activeTab === "all" ? true : activeTab === uiStatus;

      // Filter by search
      const matchSearch = tournament.name?.toLowerCase().includes(search.toLowerCase()) || 
                         tournament.club_id?.name?.toLowerCase().includes(search.toLowerCase());

      return matchTab && matchSearch;
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-4">
        <div className="bg-white rounded-2xl p-10 shadow-sm border text-center max-w-md w-full">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập để xem</h2>
          <p className="text-gray-500 mb-6">
            Bạn cần đăng nhập để xem danh sách giải đấu của mình.
          </p>
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Giải đấu của tôi
          </h1>
          <p className="text-gray-600 text-sm">
            Theo dõi tiến trình thi đấu và lịch sử giải đấu của bạn.
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
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "upcoming" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Sắp diễn ra
            </button>
            <button 
              onClick={() => setActiveTab("live")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "live" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Đang diễn ra
            </button>
            <button 
              onClick={() => setActiveTab("ended")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "ended" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Đã kết thúc
            </button>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <p className="text-gray-600">Chưa có giải đấu nào.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            {filtered.map((item, i) => {
              const tournament = item.tournament;

              if (!tournament) return null;

              // Map db status to ui status
              let uiStatus = "upcoming";
              if (tournament.status === "InProgress") uiStatus = "live";
              if (tournament.status === "Cancelled") uiStatus = "cancelled";
              if (tournament.status === "Completed") uiStatus = "ended";

              const cfg = statusConfig[uiStatus];
              const displayDate = tournament.play_date ? new Date(tournament.play_date).toLocaleDateString("vi-VN") : "Đang cập nhật";
              const displayClub = tournament.club_id?.name || "Đang cập nhật";
              const displayFee = tournament.fee > 0 ? `${tournament.fee.toLocaleString()} VND` : "Miễn phí";
              const displayImg = tournament.banner && tournament.banner.trim().length > 0 ? tournament.banner : "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=800";

              return (
                <div
                  key={tournament._id || i}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group flex flex-col h-full"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={displayImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={tournament.name} />
                    <span
                      className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-lg ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm mb-3 line-clamp-2 text-gray-900">
                      {tournament.name}
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
                        onClick={() => navigate(`/tournament/${tournament._id}`, {
                          state: { from: "/my-tournaments" },
                        })}
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