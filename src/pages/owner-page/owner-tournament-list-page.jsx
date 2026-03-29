import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Plus, Search, Users, Brackets, Play, Sparkles, Edit, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { getTournamentsByClub, openRegistration, closeRegistration, generateBracket, startTournament } from "@/services/tournament.service";

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

export default function OwnerTournamentListPage() {
  const navigate = useNavigate();
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getTournamentsByClub(CLUB_ID);
      if (res?.success) setTournaments(res.data || []);
    } catch (e) {
      toast.error("Không thể tải danh sách giải đấu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpen = async (t) => {
    if (!window.confirm(`Mở đăng ký cho "${t.name}"?`)) return;
    try {
      const res = await openRegistration(t._id);
      if (res?.success) toast.success("Đã mở đăng ký");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi mở đăng ký");
    }
  };

  const handleClose = async (t) => {
    if (!window.confirm("Chốt đăng ký và tạo bracket tự động?")) return;
    try {
      const res = await closeRegistration(t._id, { auto_generate: true });
      if (res?.success) toast.success("Đã chốt đăng ký");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi chốt đăng ký");
    }
  };

  const handleGenerate = async (t) => {
    if (!window.confirm("Tạo / ghi đè bracket?")) return;
    try {
      const res = await generateBracket(t._id, {});
      if (res?.success) toast.success("Đã tạo bracket");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi tạo bracket");
    }
  };

  const handleStart = async (t) => {
    if (!window.confirm("Bắt đầu giải đấu?")) return;
    try {
      const res = await startTournament(t._id);
      if (res?.success) toast.success("Giải đấu đang diễn ra");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể bắt đầu");
    }
  };

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
          <p className="text-slate-500 mt-1 pl-11">Tạo và vận hành giải đấu cho CLB của bạn.</p>
        </div>
        <button
          onClick={() => navigate("/owner/tournaments/create")}
          className="px-5 py-2.5 bg-[#00A65A] hover:bg-[#008d4c] text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Tạo giải mới
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-[#D1F2D6] text-[#008f4c]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-400">Không tìm thấy giải đấu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((t) => {
            const badge = statusBadge[t.status] || statusBadge.Draft;
            return (
              <div key={t._id} className="bg-white rounded-[20px] p-4 flex flex-col gap-4 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badge}`}>{t.status}</div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{t.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{t.description || ""}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500 flex flex-col items-end gap-1">
                    <span className="inline-flex items-center gap-1"><Users size={14} /> {t.registered_player || 0}/{t.max_players}</span>
                    {t.play_date && (
                      <span className="inline-flex items-center gap-1"><Calendar size={14} /> {new Date(t.play_date).toLocaleDateString("vi-VN")}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {t.status === "Draft" && (
                    <>
                      <button onClick={() => handleOpen(t)} className="px-4 py-2 bg-[#00A65A] text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Sparkles size={16} /> Mở đăng ký
                      </button>
                      <button onClick={() => navigate(`/owner/tournaments/edit/${t._id}`)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Edit size={16} /> Chỉnh sửa
                      </button>
                    </>
                  )}

                  {t.status === "Open" && (
                    <>
                      <button onClick={() => handleClose(t)} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Brackets size={16} /> Chốt & tạo bracket
                      </button>
                      <button onClick={() => navigate(`/owner/tournaments/edit/${t._id}`)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Edit size={16} /> Chỉnh sửa
                      </button>
                    </>
                  )}

                  {t.status === "Closed" && (
                    <>
                      <button onClick={() => handleGenerate(t)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Brackets size={16} /> Random Bracket
                      </button>
                      <button onClick={() => handleStart(t)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Play size={16} /> Bắt đầu giải
                      </button>
                      <button onClick={() => navigate(`/owner/tournaments/${t._id}/players`)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold">Người chơi</button>
                    </>
                  )}

                  {t.status === "InProgress" && (
                    <>
                      <button onClick={() => navigate(`/owner/tournaments/${t._id}/players`)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold">Người chơi</button>
                      <button onClick={() => navigate(`/owner/tournaments/${t._id}/bracket`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Trophy size={16} /> Xem sơ đồ/Kết quả
                      </button>
                    </>
                  )}

                  {t.status === "Completed" && (
                    <button onClick={() => navigate(`/owner/tournaments/${t._id}/bracket`)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2"><Trophy size={16}/> Xem kết quả</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
