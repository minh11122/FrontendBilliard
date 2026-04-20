import React, { useEffect, useState, useRef } from "react";
import { Trophy, Users, Calendar, Play, Clock, Search, XCircle, Info, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { getTournamentsByClub, cancelTournament } from "@/services/tournament.service";
import { useNavigate } from "react-router-dom";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "All", label: "Tất cả", statuses: [] },
  { id: "Draft", label: "Bản nháp", statuses: ["Draft"] },
  { id: "Open", label: "Mở đăng ký", statuses: ["Open"] },
  { id: "Closed", label: "Đóng đăng ký", statuses: ["Closed"] },
  { id: "InProgress", label: "Đang diễn ra", statuses: ["InProgress"] },
  { id: "Completed", label: "Đã kết thúc", statuses: ["Completed"] },
  { id: "Cancelled", label: "Đã hủy", statuses: ["Cancelled"] }
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
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/staff/notifications");
        if (response.data?.success) {
          setNotifications(response.data.data || []);
        }
      } catch (error) {
        console.error("Loi fetchNotifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationPopup(false);
      }
    };

    if (showNotificationPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationPopup]);

  const handleReadNotification = async (id) => {
    try {
      await axios.patch(`/staff/notifications/${id}/read`);
      const response = await axios.get("/staff/notifications");
      if (response.data?.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Loi mark notification read:", error);
    }
  };

  const handleReadAllNotifications = async () => {
    try {
      await axios.patch("/staff/notifications/read-all");
      const response = await axios.get("/staff/notifications");
      if (response.data?.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Loi mark all notifications read:", error);
    }
  };

  const handleCancel = async (t) => {
    const hasPlayers = (t.registered_player || 0) > 0;
    const confirmMsg = hasPlayers 
      ? `CẢNH BÁO: Giải đấu "${t.name}" đã có ${t.registered_player} người tham gia. \n\nKhi hủy giải, bạn phải TỰ LIÊN HỆ và HOÀN LỆ PHÍ cho người chơi ngoài hệ thống.\n\nBạn có chắc chắn muốn hủy giải đấu này không?`
      : `Bạn có chắc chắn muốn hủy giải đấu "${t.name}" không?`;

    if (window.confirm(confirmMsg)) {
      try {
        const res = await cancelTournament(t._id);
        if (res.success) {
          toast.success("Đã hủy giải đấu");
          const updated = await getTournamentsByClub(CLUB_ID);
          if (updated.success) setTournaments(updated.data || []);
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Không thể hủy giải đấu");
      }
    }
  };

  const filtered = tournaments.filter((t) => {
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase());
    const tabObj = tabs.find((tab) => tab.id === activeTab);
    const matchTab = tabObj.statuses.length === 0 || tabObj.statuses.includes(t.status);
    return matchSearch && matchTab;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentTournaments = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-500" /> Quản lý Giải đấu
          </h1>
          <p className="text-slate-500 mt-1 pl-11">Vận hành giải đấu cho CLB của bạn.</p>
        </div>
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setShowNotificationPopup((prev) => !prev)}
            className="hidden"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            )}
          </button>

          {showNotificationPopup && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg z-20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="text-sm font-semibold text-slate-800">Thong bao</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReadAllNotifications}
                    className="text-xs font-medium text-orange-600 hover:text-orange-700"
                  >
                    Danh dau da doc
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    Chua co thong bao nao
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif._id}
                      type="button"
                      onClick={() => handleReadNotification(notif._id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${!notif.is_read ? "bg-orange-50/50" : "bg-white"}`}
                    >
                      <div className="flex gap-3">
                        <div className="pt-1">
                          {!notif.is_read && <span className="block h-2 w-2 rounded-full bg-orange-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm line-clamp-1 ${!notif.is_read ? "font-semibold text-slate-900" : "text-slate-900"}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {notif.created_at ? new Date(notif.created_at).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }) : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
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
          {currentTournaments.map((t) => {
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
                  {t.status === "Open" || t.status === "Closed" ? (
                    <>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/detail`)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Info size={16} /> Xem chi tiết
                      </button>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/players`)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Users size={16} /> Người chơi
                      </button>
                    </>
                  ) : t.status === "InProgress" ? (
                    <>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/detail`)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Info size={16} /> Xem chi tiết
                      </button>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/matches`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 self-start hover:bg-blue-700 transition"
                      >
                        <Play size={16} /> Quản lý trận
                      </button>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/players`)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Users size={16} /> Người chơi
                      </button>
                    </>
                  ) : t.status === "Completed" ? (
                    <>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/detail`)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Info size={16} /> Xem chi tiết
                      </button>
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
                  ) : t.status === "Cancelled" ? (
                    <>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/detail`)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Info size={16} /> Xem chi tiết
                      </button>
                      <button 
                        onClick={() => navigate(`/staff/tournaments/${t._id}/players`)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold flex items-center gap-2 self-start transition"
                      >
                        <Users size={16} /> Người đăng ký
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

      {/* Pagination Container */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 mt-4 px-6 py-4 text-sm text-slate-500 bg-white rounded-[20px] shadow-sm border border-slate-100">
          <span>
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} trong {filtered.length} giải đấu
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </Button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
