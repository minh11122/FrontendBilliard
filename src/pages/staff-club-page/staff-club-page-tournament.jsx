import React, { useEffect, useState } from "react";
import { Trophy, Users, Calendar, Play, Clock, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getTournamentsByClub } from "@/services/tournament.service";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "All", label: "Tất cả", statuses: [] },
  { id: "Draft", label: "Bản nháp", statuses: ["Draft"] },
  { id: "Open", label: "Mở đăng ký", statuses: ["Open"] },
  { id: "Closed", label: "Đóng đăng ký", statuses: ["Closed"] },
  { id: "InProgress", label: "Đang diễn ra", statuses: ["InProgress"] },
  { id: "Completed", label: "Đã kết thúc", statuses: ["Completed"] }
];

const statusBadge = {
  Draft: "bg-slate-100 text-slate-600 border border-slate-200",
  Open: "bg-green-100 text-green-700 border border-green-200",
  Closed: "bg-amber-100 text-amber-700 border border-amber-200",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-200",
  Completed: "bg-gray-100 text-gray-600 border border-gray-200",
  Cancelled: "bg-red-100 text-red-600 border border-red-200"
};

export const StaffClubPageTournament = () => {
  const navigate = useNavigate();
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getTournamentsByClub(CLUB_ID);
        if (res?.success) setTournaments(res.data || []);
      } catch (e) {
        toast.error("Không tải được danh sách giải đấu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [CLUB_ID]);

  const filtered = tournaments.filter((t) => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase());
    const tabObj = tabs.find((tab) => tab.id === activeTab);
    const matchTab = tabObj.statuses.length === 0 || tabObj.statuses.includes(t.status);
    return matchSearch && matchTab;
  });

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-500" /> Quản lý Giải đấu
          </h1>
          <p className="text-slate-500 mt-1 pl-11">Vận hành giải đấu cho CLB của bạn.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-[#D1F2D6] text-[#008f4c]" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-[320px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên giải đấu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border text-slate-900 border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#008f4c] focus:ring-1 focus:ring-[#008f4c] transition-all bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500 font-medium">Chưa có giải đấu nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((t) => {
            const badge = statusBadge[t.status] || statusBadge.Draft;
            return (
              <div key={t._id} className="bg-white rounded-[20px] shadow-sm border border-slate-100 p-4 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-xs font-bold px-3 py-1 rounded-full inline-flex ${badge}`}>{t.status}</div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{t.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{t.description || ""}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500 flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1"><Users size={14} /> {t.registered_player || 0}/{t.max_players}</span>
                    {t.play_date && <span className="inline-flex items-center gap-1"><Calendar size={14} /> {new Date(t.play_date).toLocaleDateString("vi-VN")}</span>}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {t.status === "InProgress" ? (
                    <button 
                      onClick={() => navigate(`/staff/tournaments/${t._id}/matches`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 self-start hover:bg-blue-700 transition"
                    >
                      <Play size={16} /> Quản lý trận
                    </button>
                  ) : t.status === "Completed" ? (
                    <>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/players`)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Users size={16} /> Người chơi
                      </button>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/matches`)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Trophy size={16} /> Xem vòng đấu
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-2 bg-slate-50 text-slate-400 rounded-lg text-sm font-semibold flex items-center gap-2 self-start cursor-not-allowed">
                      Giải đang ở trạng thái {t.status === "Open" ? "mở đăng ký" : t.status === "Closed" ? "đóng đăng ký, chờ bóc thăm" : t.status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
