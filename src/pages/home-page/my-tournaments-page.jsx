import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Lock, MapPin, Trophy, Users } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import api from "@/lib/axios";

const statusConfig = {
  Draft: { label: "Bản nháp", color: "bg-slate-100 text-slate-600" },
  Open: { label: "Đã đăng ký", color: "bg-green-100 text-green-700" },
  Closed: { label: "Đã đăng ký", color: "bg-amber-100 text-amber-700" },
  InProgress: { label: "Đang diễn ra", color: "bg-blue-100 text-blue-700" },
  Completed: { label: "Đã kết thúc", color: "bg-gray-200 text-gray-600" },
};

const playerStatusMap = {
  Approved: { label: "Đã đăng ký", color: "bg-green-100 text-green-700" },
  Pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
  Rejected: { label: "Bị từ chối", color: "bg-red-100 text-red-700" },
  Eliminated: { label: "Đã bị loại", color: "bg-gray-100 text-gray-600" },
  Champion: { label: "Vô địch", color: "bg-yellow-100 text-yellow-700" },
};

const visibleTournamentStatuses = ["Open", "Closed", "InProgress", "Completed"];
const registeredStatuses = ["Open", "Closed"];

const eliminationRoundLabel = (round) => {
  if (!round) return null;
  return `Bị loại ở vòng ${round}`;
};

export const MyTournamentsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
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
        }
      } catch {
        toast.error("Không thể tải danh sách giải đấu của bạn");
      } finally {
        setLoading(false);
      }
    };

    fetchMyTournaments();
  }, [user]);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "registered", label: "Đã đăng ký" },
    { id: "InProgress", label: "Đang diễn ra" },
    { id: "Completed", label: "Đã kết thúc" },
  ];

  const visibleTournaments = myTournaments.filter((item) =>
    visibleTournamentStatuses.includes(item.tournament?.status),
  );

  const filtered = visibleTournaments.filter((item) => {
    const status = item.tournament?.status;

    if (activeTab === "all") return true;
    if (activeTab === "registered") return registeredStatuses.includes(status);

    return status === activeTab;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="bg-white rounded-3xl p-10 shadow-sm border text-center max-w-md w-full">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập để xem</h2>
          <p className="text-gray-500 mb-6">
            Bạn cần đăng nhập để xem danh sách giải đấu của mình.
          </p>
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Trophy className="text-orange-500" size={30} />
            Giải đấu của tôi
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi tiến trình thi đấu và lịch sử giải đấu của bạn.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border shadow-sm">
            <Trophy className="w-20 h-20 text-gray-200 mx-auto mb-5" />
            <p className="text-xl font-bold text-gray-400">Chưa có giải đấu phù hợp</p>
            <p className="text-gray-400 text-sm mt-2">
              Trang này hiển thị các giải bạn đã đăng ký, đang diễn ra hoặc đã kết thúc.
            </p>
            <button
              onClick={() => navigate("/tournament")}
              className="mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
            >
              Khám phá giải đấu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const tournament = item.tournament;
              const playerEntry = item.playerEntry;

              if (!tournament) return null;

              const cfg = statusConfig[tournament.status] || statusConfig.Draft;
              const playerCfg = playerStatusMap[playerEntry?.status] || null;
              const badges = [cfg, playerCfg].filter(Boolean).filter(
                (badge, index, arr) =>
                  arr.findIndex((item) => item.label === badge.label) === index,
              );
              const bannerUrl = tournament.banner?.trim()
                ? tournament.banner
                : "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=800";

              return (
                <div
                  key={tournament._id}
                  className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-36 sm:h-auto relative flex-shrink-0">
                      <img
                        src={bannerUrl}
                        alt={tournament.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {badges.map((badge) => (
                              <span
                                key={`${tournament._id}-${badge.label}`}
                                className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}
                              >
                                {badge.label}
                              </span>
                            ))}
                            {playerEntry?.status === "Eliminated" &&
                              playerEntry.elimination_round && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                  {eliminationRoundLabel(playerEntry.elimination_round)}
                                </span>
                              )}
                          </div>
                        </div>

                        <h3 className="font-extrabold text-lg text-gray-900">
                          {tournament.name}
                        </h3>

                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          {tournament.play_date && (
                            <p className="flex items-center gap-2">
                              <Calendar size={13} />
                              {new Date(tournament.play_date).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                          {tournament.club_id?.name && (
                            <p className="flex items-center gap-2">
                              <MapPin size={13} />
                              {tournament.club_id.name}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Users size={13} />
                            {tournament.registered_player || 0} / {tournament.max_players} người tham gia
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() =>
                            navigate(`/tournament/${tournament._id}`, {
                              state: { from: "/my-tournaments" },
                            })
                          }
                          className="px-4 py-2 bg-orange-50 text-orange-600 font-semibold rounded-xl text-sm hover:bg-orange-100 transition flex items-center gap-2"
                        >
                          Xem chi tiết <ArrowRight size={14} />
                        </button>
                        
                      </div>
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
