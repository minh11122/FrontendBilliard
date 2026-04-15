import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Plus, Search, Users, Brackets, Play, Sparkles, Edit, Calendar, Trash2, XCircle, Info } from "lucide-react";
import toast from "react-hot-toast";
import { 
  getTournamentsByClub, 
  openRegistration, 
  closeRegistration, 
  generateBracket, 
  startTournament, 
  deleteTournament,
  cancelTournament 
} from "@/services/tournament.service";

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

const statusLabel = {
  Draft: "Bản nháp", Open: "Mở đăng ký", Closed: "Đóng đăng ký",
  InProgress: "Đang diễn ra", Completed: "Đã kết thúc", Cancelled: "Đã hủy"
};

const fallbackBanner = "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=800";

export default function OwnerTournamentListPage() {
  const navigate = useNavigate();
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!CLUB_ID) return;
      const res = await getTournamentsByClub(CLUB_ID);
      if (res?.success) setTournaments(res.data || []);
    } catch {
      toast.error("Không thể tải danh sách giải đấu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CLUB_ID]);

  const handleOpen = async (t) => {
    if (!window.confirm(`Mở đăng ký cho "${t.name}"?`)) return;
    try {
      const res = await openRegistration(t._id);
      if (res?.success) {
        toast.success("Đã mở đăng ký");
        fetchData();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi mở đăng ký");
    }
  };

  const handleClose = async (t) => {
    if (!window.confirm("Chốt đăng ký và tạo bracket tự động?")) return;
    try {
      const res = await closeRegistration(t._id, { auto_generate: true });
      if (res?.success) {
        toast.success("Đã chốt đăng ký");
        fetchData();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi chốt đăng ký");
    }
  };

  const handleGenerate = async (t) => {
    if (!window.confirm("Tạo / ghi đè bracket?")) return;
    try {
      const res = await generateBracket(t._id, {});
      if (res?.success) {
        toast.success("Đã tạo bracket");
        fetchData();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi tạo bracket");
    }
  };

  const handleStart = async (t) => {
    if (!window.confirm("Bắt đầu giải đấu?")) return;
    try {
      const res = await startTournament(t._id);
      if (res?.success) {
        toast.success("Giải đấu đang diễn ra");
        fetchData();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể bắt đầu");
    }
  };

  const handleCancel = async (t) => {
    const hasPlayers = (t.registered_player || 0) > 0;
    const confirmMsg = hasPlayers 
      ? `CẢNH BÁO: Giải đấu "${t.name}" đã có ${t.registered_player} người tham gia. \n\nKhi hủy giải, bạn phải TỰ LIÊN HỆ và HOÀN LỆ PHÍ cho người chơi ngoài hệ thống. Hệ thống sẽ không tự động hoàn tiền.\n\nBạn có chắc chắn muốn hủy giải đấu này không?`
      : `Bạn có chắc chắn muốn hủy giải đấu "${t.name}" không?`;

    if (window.confirm(confirmMsg)) {
      try {
        const res = await cancelTournament(t._id);
        if (res.success) {
          toast.success("Đã hủy giải đấu");
          fetchData();
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Không thể hủy giải đấu");
      }
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Xóa giải đấu "${t.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      setDeletingId(t._id);
      const res = await deleteTournament(t._id);
      if (res?.success) {
        toast.success("Đã xóa giải đấu");
        fetchData();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể xóa giải đấu");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = tournaments.filter((t) => {
    const matchSearch = (t.name || "").toLowerCase().includes(search.toLowerCase());
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
            const bannerUrl = t.banner?.trim() ? t.banner : fallbackBanner;
            const canDelete = (t.registered_player || 0) === 0;
            return (
              <div key={t._id} className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100 flex flex-col">
                <div className="relative h-36 overflow-hidden">
                  <img src={bannerUrl} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${badge}`}>
                      {statusLabel[t.status] || t.status}
                    </span>
                    <div className="flex items-center gap-2 text-white text-xs">
                      <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Users size={12} /> {t.registered_player || 0}/{t.max_players}
                      </span>
                      {t.play_date && (
                        <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Calendar size={12} /> {new Date(t.play_date).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                      {t.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>}
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(t)}
                        disabled={deletingId === t._id}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 shrink-0"
                        title="Xóa giải (chưa có người đăng ký)"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {t.status === "Draft" && (
                      <>
                        <button onClick={() => handleOpen(t)} className="px-3 py-1.5 bg-[#00A65A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Sparkles size={14} /> Mở đăng ký
                        </button>
                        {t.registered_player === 0 && (
                          <button onClick={() => navigate(`/owner/tournaments/edit/${t._id}`)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                            <Edit size={14} /> Chỉnh sửa
                          </button>
                        )}
                        <button onClick={() => navigate(`/owner/tournaments/${t._id}/players`)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Users size={14} /> Người chơi
                        </button>
                        {t.registered_player > 0 && (
                          <button onClick={() => handleCancel(t)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-red-100 transition">
                            <XCircle size={14} /> Hủy giải
                          </button>
                        )}
                      </>
                    )}

                    {t.status === "Open" && (
                      <>
                        <button onClick={() => handleClose(t)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Brackets size={14} /> Chốt & tạo bracket
                        </button>
                        {t.registered_player === 0 && (
                          <button onClick={() => navigate(`/owner/tournaments/edit/${t._id}`)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                            <Edit size={14} /> Chỉnh sửa
                          </button>
                        )}
                        <button onClick={() => navigate(`/owner/tournaments/${t._id}/players`)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Users size={14} /> Người chơi
                        </button>
                        {t.registered_player > 0 && (
                          <button onClick={() => handleCancel(t)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-red-100 transition">
                            <XCircle size={14} /> Hủy giải
                          </button>
                        )}
                      </>
                    )}

                    {t.status === "Closed" && (
                      <>
                        <button onClick={() => handleGenerate(t)} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Brackets size={14} /> Random Bracket
                        </button>
                        <button onClick={() => handleStart(t)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Play size={14} /> Bắt đầu giải
                        </button>
                        <button onClick={() => navigate(`/owner/tournaments/${t._id}/players`)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition">
                          <Users size={14} /> Người chơi
                        </button>
                        {t.registered_player > 0 && (
                          <button onClick={() => handleCancel(t)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-red-100 transition">
                            <XCircle size={14} /> Hủy giải
                          </button>
                        )}
                      </>
                    )}

                    {t.status === "InProgress" && (
                      <>
                        <button onClick={() => navigate(`/owner/tournaments/${t._id}/matches`)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2">
                          <Trophy size={14} /> Sơ đồ & Kết quả
                        </button>
                        <button onClick={() => navigate(`/owner/tournaments/${t._id}/players`)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition">
                          <Users size={14} /> Người chơi
                        </button>
                        {t.registered_player > 0 && (
                          <button onClick={() => handleCancel(t)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-red-100 transition">
                            <XCircle size={14} /> Hủy giải
                          </button>
                        )}
                      </>
                    )}

                    {t.status === "Completed" && (
                      <>
                        <button onClick={() => navigate(`/owner/tournaments/${t._id}/players`)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Users size={14} /> Người chơi
                        </button>
                        <button onClick={() => navigate(`/owner/tournaments/${t._id}/bracket`)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <Trophy size={14} /> Xem kết quả
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
