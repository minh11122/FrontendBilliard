import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTournamentById } from "@/services/tournament.service";
import { Calendar, Users, Trophy, MapPin, ArrowLeft, Clock, CheckCircle, Store } from "lucide-react";
import toast from "react-hot-toast";

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa xác định";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
};

const statusConfig = {
  Draft: { label: "Bản nháp", color: "bg-slate-100 text-slate-600" },
  Open: { label: "Đang mở đăng ký", color: "bg-green-100 text-green-700" },
  Closed: { label: "Đã đóng đăng ký", color: "bg-orange-100 text-orange-700" },
  InProgress: { label: "Đang diễn ra", color: "bg-blue-100 text-blue-700" },
  Completed: { label: "Đã kết thúc", color: "bg-gray-100 text-gray-600" },
  Cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-600" },
};

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTournamentById(id);
        if (res.success) setTournament(res.data);
        else toast.error("Không tìm thấy giải đấu");
      } catch {
        toast.error("Lỗi khi tải thông tin giải đấu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Trophy className="w-16 h-16 text-gray-300" />
        <p className="text-lg text-gray-500 font-semibold">Không tìm thấy giải đấu</p>
        <button onClick={() => navigate("/tournament")} className="text-orange-500 hover:underline text-sm">← Trở về danh sách</button>
      </div>
    );
  }

  const cfg = statusConfig[tournament.status] || statusConfig.Draft;
  const fallbackImg = "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=1200";
  const bannerUrl = tournament.banner && tournament.banner.trim().length > 0 ? tournament.banner : fallbackImg;
  const handleRegisterNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }
    navigate(`/tournament/${tournament._id}/payment`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => navigate("/tournament")}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} /> Quay lại danh sách giải đấu
        </button>

        {/* Banner */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-md relative">
          <img src={bannerUrl} alt={tournament.name} className="w-full h-64 md:h-80 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow leading-tight">{tournament.name}</h1>
            <span className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            {tournament.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-slate-800 text-lg mb-3">Mô tả giải đấu</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{tournament.description}</p>
              </div>
            )}

            {/* Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" /> Lịch đấu
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                  <span><b>Mở đăng ký:</b> {formatDate(tournament.registration_open)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock size={16} className="text-orange-400 shrink-0" />
                  <span><b>Đóng đăng ký:</b> {formatDate(tournament.registration_deadline)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Trophy size={16} className="text-amber-500 shrink-0" />
                  <span><b>Ngày thi đấu:</b> {formatDate(tournament.play_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
              {/* Club Info */}
              {tournament.club_id && (
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Store size={16} className="text-orange-500" /> Quán tổ chức
                  </h3>
                  <p className="font-semibold text-gray-800 mb-1">{tournament.club_id.name}</p>
                  {tournament.club_id.address && (
                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                      <MapPin size={14} className="shrink-0 mt-0.5 text-gray-400" />
                      {tournament.club_id.address}
                    </p>
                  )}
                </div>
              )}

              {/* Stats */}
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Thể thức</p>
                <p className="font-bold text-gray-800">{tournament.format === "Knockout" ? "🥊 Loại trực tiếp" : "🔄 Vòng tròn"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Người tham gia</p>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-500" />
                  <span className="font-bold text-green-600">{tournament.registered_player || 0}</span>
                  <span className="text-gray-400">/ {tournament.max_players} người</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Lệ phí</p>
                <p className="font-bold text-gray-800">
                  {tournament.fee > 0 ? `${Number(tournament.fee).toLocaleString()} VNĐ` : "Miễn phí"}
                </p>
              </div>
              {tournament.prize_pool && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tổng giải thưởng</p>
                  <p className="font-bold text-amber-600">{typeof tournament.prize_pool === 'number' ? `${tournament.prize_pool.toLocaleString()} VNĐ` : tournament.prize_pool}</p>
                </div>
              )}
            </div>

            {/* CTA */}
            {tournament.status === "Open" && (
              <button
                onClick={handleRegisterNow}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-orange-500/30 text-lg"
              >
                Đăng ký ngay 🏆
              </button>
            )}
            {tournament.status === "Closed" && (
              <div className="w-full py-3 bg-gray-100 text-gray-500 font-semibold rounded-2xl text-center">
                Đã đóng đăng ký
              </div>
            )}
            {tournament.status === "InProgress" && (
              <div className="w-full py-3 bg-blue-50 text-blue-600 font-semibold rounded-2xl text-center">
                Đang diễn ra
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
