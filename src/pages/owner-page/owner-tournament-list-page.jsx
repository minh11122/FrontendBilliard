import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Plus, Calendar, Users, Trash2, Edit, Search, Swords } from "lucide-react";
import toast from "react-hot-toast";
import { getTournamentsByClub, deleteTournament, updateTournament } from "@/services/tournament.service";

const tabs = [
  { id: "All", label: "Tất cả", statuses: [] },
  { id: "Draft", label: "Bản nháp", statuses: ["Draft"] },
  { id: "Open", label: "Mở đăng ký", statuses: ["Open"] },
  { id: "Closed", label: "Đóng đăng ký", statuses: ["Closed"] },
  { id: "InProgress", label: "Đang diễn ra", statuses: ["InProgress"] },
  { id: "Completed", label: "Đã kết thúc", statuses: ["Completed"] },
  { id: "Cancelled", label: "Đã huỷ", statuses: ["Cancelled"] },
];

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
      if (res.success) setTournaments(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách giải đấu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa giải "${name}"?`)) return;
    try {
      const res = await deleteTournament(id);
      if (res.success) {
        toast.success("Đã xóa giải đấu");
        fetchData();
      }
    } catch (err) {
      toast.error("Xóa giải đấu thất bại");
    }
  };

  const handlePublish = async (id, name) => {
    if (!window.confirm(`Bạn muốn mở đăng ký cho giải "${name}"?`)) return;
    try {
      const res = await updateTournament(id, { status: "Open" });
      if (res.success) {
        toast.success("Giải đấu đã được chuyển sang trạng thái Mở đăng ký");
        fetchData();
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Lọc theo search và tab
  const filtered = tournaments.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase());
    
    // Tìm tab active, check mảng statuses. Nếu mảng rỗng => xem như tab "Tất cả"
    const currentTabObj = tabs.find(tab => tab.id === activeTab);
    const matchTab = currentTabObj.statuses.length === 0 || currentTabObj.statuses.includes(t.status);

    return matchSearch && matchTab;
  });

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-500" /> Quản lý Giải đấu
          </h1>
          <p className="text-slate-500 mt-1 pl-11">Tạo và quản lý các giải đấu billiard cho quán của bạn.</p>
        </div>
        <button
          onClick={() => navigate("/owner/tournaments/create")}
          className="px-5 py-2.5 bg-[#00A65A] hover:bg-[#008d4c] text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Tạo giải mới
        </button>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-[#D1F2D6] text-[#008f4c]" // Green highlight for active
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-[300px]">
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-400">Không tìm thấy giải đấu nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(t => {
            // Xác định UI tùy theo trạng thái (status)
            let badgeText = "";
            let badgeStyle = "";
            let actionButtons = null;

            if (t.status === "Draft") {
              badgeText = "BẢN NHÁP";
              badgeStyle = "bg-slate-100 text-slate-500 border border-slate-200";
              actionButtons = (
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePublish(t._id, t.name)}
                    className="px-6 py-2 bg-[#00A65A] hover:bg-[#008d4c] text-white font-semibold rounded-full text-sm transition-all shadow-md shadow-green-500/20"
                  >
                    Đăng giải
                  </button>
                  <button
                    onClick={() => navigate(`/owner/tournaments/edit/${t._id}`)}
                    className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-full text-sm transition-all"
                  >
                    chỉnh sửa
                  </button>
                </div>
              );
            } else if (["Open", "InProgress"].includes(t.status)) {
              badgeText = t.status === "Open" ? "ĐANG MỞ ĐĂNG KÝ" : "ĐANG DIỄN RA";
              badgeStyle = "bg-[#D1F2D6] text-[#008f4c]";
              actionButtons = (
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/owner/tournaments/edit/${t._id}`)}
                    className="px-6 py-2 bg-[#00A65A] hover:bg-[#008d4c] text-white font-semibold rounded-full text-sm transition-all shadow-md shadow-green-500/20"
                  >
                    Quản lý
                  </button>
                  <button
                    onClick={() => navigate(`/owner/tournaments/${t._id}/players`)}
                    className="px-6 py-2 bg-white hover:bg-slate-50 text-[#00A65A] font-semibold rounded-full text-sm transition-all border border-[#00A65A]"
                  >
                    Chi tiết
                  </button>
                </div>
              );
            } else {
              // Closed, Completed, Cancelled
              badgeText = t.status === "Closed" ? "ĐÃ ĐÓNG ĐĂNG KÝ" : (t.status === "Completed" ? "ĐÃ KẾT THÚC" : "ĐÃ HỦY");
              badgeStyle = t.status === "Cancelled" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600";
              actionButtons = (
                <button
                  onClick={() => {/* Navigate to results page later */}}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-full text-sm transition-all"
                >
                  Xem kết quả
                </button>
              );
            }

            return (
              <div key={t._id} className="bg-white rounded-[24px] p-4 flex flex-col sm:flex-row gap-6 shadow-sm border border-slate-100 hover: shadow-md transition-shadow">
                {/* Left: Banner Image */}
                <div className="w-full sm:w-[220px] aspect-square flex-shrink-0 bg-slate-100 rounded-[20px] overflow-hidden relative">
                  {t.banner && t.banner.trim().length > 0 ? (
                      <img src={t.banner} className="w-full h-full object-cover" alt={t.name} />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Trophy className="w-16 h-16 text-slate-400" />
                      </div>
                  )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    {/* Badge */}
                    <div className="flex justify-end mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-900 text-xl md:text-2xl leading-tight mb-6 line-clamp-3">
                      {t.name}
                    </h3>
                    
                    {/* Stats */}
                    {t.status === "Draft" ? (
                      <div className="mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trạng thái</p>
                        <p className="text-sm font-semibold text-slate-700">Chưa công bố</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2 mb-6">
                        {t.status === "Completed" || t.status === "Closed" ? (
                           <>
                             <div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng thưởng</p>
                               <p className="font-extrabold text-slate-800 text-sm">{typeof t.prize_pool === 'number' ? `${t.prize_pool.toLocaleString()}đ` : (t.prize_pool || "0đ")}</p>
                             </div>
                             {(t.status === "Completed") && (
                               <div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nhà vô địch</p>
                                 <p className="font-extrabold text-[#D97706] text-sm">Chưa cập nhật</p>
                               </div>
                             )}
                           </>
                        ) : (
                          <>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lệ phí</p>
                              <p className="font-extrabold text-slate-800 text-sm">{t.fee ? `${t.fee.toLocaleString()}đ` : "Miễn phí"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đã đăng ký</p>
                              <p className="font-extrabold text-[#00A65A] text-sm">{t.registered_player || 0} <span className="text-slate-400">/ {t.max_players}</span></p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end mt-4">
                    {actionButtons}
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
