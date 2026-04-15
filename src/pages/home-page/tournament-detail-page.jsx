import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createPayOSTournamentPayment, getMyRegisteredTournamentIds, getTournamentById } from "@/services/tournament.service";
import { TournamentBracket } from "@/components/TournamentBracket";
import {
  Calendar,
  Users,
  Trophy,
  MapPin,
  ArrowLeft,
  Clock,
  CheckCircle,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";

const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa xác định";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const formatLabel = (format) => {
  if (format === "Double Elimination") return "🥊 Nhánh thắng / nhánh thua";
  if (format === "Knockout") return "🥊 Loại trực tiếp";
  return "🔄 Vòng tròn";
};

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [registeringNow, setRegisteringNow] = useState(false);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchJoinedStatus = async () => {
      try {
        const res = await getMyRegisteredTournamentIds();
        if (res?.success) {
          setJoined((res.data || []).includes(id));
        }
      } catch {
        // keep silent
      }
    };

    fetchJoinedStatus();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Trophy className="w-16 h-16 text-gray-300" />
        <p className="text-lg text-gray-500 font-semibold">Không tìm thấy giải đấu</p>
        <button
          onClick={() => navigate("/tournament")}
          className="text-orange-500 hover:underline text-sm"
        >
          ← Trở về danh sách
        </button>
      </div>
    );
  }

  const cfg = statusConfig[tournament.status] || statusConfig.Draft;
  const fallbackImg =
    "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=1200";
  const bannerUrl =
    tournament.banner && tournament.banner.trim().length > 0
      ? tournament.banner
      : fallbackImg;
  const backPath = location.state?.from === "/my-tournaments" ? "/my-tournaments" : "/tournament";

  const handleRegisterNow = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login", {
        state: {
          from: {
            pathname: `/tournament/${tournament._id}`,
          },
        },
      });
      return;
    }

    const fee = Number(tournament.fee || 0);
    if (fee <= 0) {
      // Phí miễn phí: tham gia ngay, không cần tới trang thanh toán.
      (async () => {
        try {
          setRegisteringNow(true);
          const res = await createPayOSTournamentPayment(tournament._id);
          if (!res?.success) throw new Error(res?.message || "Không thể đăng ký giải đấu");

          // Nếu backend trả về checkoutUrl (trường hợp hiếm), vẫn điều hướng PayOS.
          if (res?.data?.checkoutUrl) {
            window.location.href = res.data.checkoutUrl;
            return;
          }

          toast.success(res.message || "Đăng ký giải đấu thành công!");
          setJoined(true);
          // Refresh để cập nhật số lượng đã đăng ký
          const fresh = await getTournamentById(tournament._id);
          if (fresh?.success && fresh.data) setTournament(fresh.data);
        } catch (e) {
          toast.error(e?.response?.data?.message || e.message || "Không thể đăng ký giải đấu");
        } finally {
          setRegisteringNow(false);
        }
      })();
      return;
    }

    navigate(`/tournament/${tournament._id}/payment`);
  };

  const handleViewPlayers = () => {
    if (!user) {
      toast("Vui lòng đăng nhập và đăng ký giải đấu để xem danh sách người chơi", {
        icon: "🔒",
      });
      navigate("/auth/login", {
        state: {
          from: {
            pathname: `/tournament/${tournament._id}`,
          },
        },
      });
      return;
    }

    if (user.roleName === "CUSTOMER" && !joined) {
      toast.error("Bạn cần đăng ký giải đấu trước khi xem danh sách người chơi");
      return;
    }

    navigate(`/tournament/${tournament._id}/players`);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all mb-8"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="rounded-2xl overflow-hidden mb-8 shadow-md relative">
          <img src={bannerUrl} alt={tournament.name} className="w-full h-64 md:h-80 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow leading-tight">
              {tournament.name}
            </h1>
            <span className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`pb-3 px-4 font-bold ${
                  activeTab === "info"
                    ? "text-green-500 border-b-2 border-green-500"
                    : "text-gray-500 hover:text-gray-700 transition-colors"
                }`}
              >
                Thông tin chung
              </button>
              {["Closed", "InProgress", "Completed"].includes(tournament.status) && (
                <button
                  onClick={() => setActiveTab("bracket")}
                  className={`pb-3 px-4 font-bold ${
                    activeTab === "bracket"
                      ? "text-green-500 border-b-2 border-green-500"
                      : "text-gray-500 hover:text-gray-700 transition-colors"
                  }`}
                >
                  Sơ đồ / Lịch thi đấu
                </button>
              )}
            </div>

            {activeTab === "info" && (
              <>
                {tournament.description && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-slate-800 text-lg mb-3">Mô tả giải đấu</h2>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {tournament.description}
                    </p>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-green-500" /> Lịch đấu
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <CheckCircle size={16} className="text-green-500 shrink-0" />
                      <span>
                        <b>Mở đăng ký:</b> {formatDate(tournament.registration_open)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock size={16} className="text-green-500 shrink-0" />
                      <span>
                        <b>Đóng đăng ký:</b> {formatDate(tournament.registration_deadline)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Trophy size={16} className="text-amber-500 shrink-0" />
                      <span>
                        <b>Ngày thi đấu:</b> {formatDate(tournament.play_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "bracket" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm overflow-hidden">
                <TournamentBracket tournamentId={tournament._id} format={tournament.format} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {tournament.club_id && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Store size={16} className="text-green-500" /> Quán tổ chức
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

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Thể thức
                </p>
                <p className="font-bold text-gray-800">{formatLabel(tournament.format)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Người tham gia
                </p>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-500" />
                  <span className="font-bold text-green-600">
                    {tournament.registered_player || 0}
                  </span>
                  <span className="text-gray-400">/ {tournament.max_players} người</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Lệ phí
                </p>
                <p className="font-bold text-gray-800">
                  {tournament.fee > 0 ? `${Number(tournament.fee).toLocaleString()} VNĐ` : "Miễn phí"}
                </p>
              </div>
              {tournament.prize_pool && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Tổng giải thưởng
                  </p>
                  <p className="font-bold text-amber-600">
                    {typeof tournament.prize_pool === "number"
                      ? `${tournament.prize_pool.toLocaleString()} VNĐ`
                      : tournament.prize_pool}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleViewPlayers}
              className="w-full py-3 mb-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl transition-all border border-slate-200 text-lg"
            >
              Danh sách người chơi
            </button>

            {tournament.status === "Open" && !joined && (
              <button
                onClick={handleRegisterNow}
                disabled={registeringNow}
                className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-md shadow-green-500/30 text-lg"
              >
                {registeringNow ? "Đang đăng ký..." : "Đăng ký ngay"}
              </button>
            )}

            {/* Trạng thái nếu đã tham gia hoặc giải đã đóng/kết thúc */}
            <div className="flex flex-col gap-3">
              {(tournament.status === "Open" || tournament.status === "Closed" || tournament.status === "Draft") && joined && (
                <div className="w-full py-3 bg-green-50 text-green-600 font-semibold rounded-2xl text-center border border-green-100 flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Bạn đã đăng ký tham gia
                </div>
              )}
              {tournament.status === "Closed" && !joined && (
                <div className="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-2xl text-center">
                  Đã đóng đăng ký
                </div>
              )}
              {tournament.status === "InProgress" && (
                <div className="w-full py-3 bg-blue-50 text-blue-600 font-semibold rounded-2xl text-center border border-blue-100">
                  {joined ? "Giải đấu đang diễn ra - Chúc bạn thi đấu tốt!" : "Giải đấu đang diễn ra"}
                </div>
              )}
              {tournament.status === "Completed" && (
                <div className="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-2xl text-center">
                  Giải đấu đã kết thúc
                </div>
              )}

              {/* Banner Vô địch */}
              {tournament.status === "Completed" && 
               user && 
               (tournament.champion_account_id === user.id || tournament.champion_account_id?._id === user.id) && (
                <div className="w-full relative overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-2xl shadow-lg shadow-yellow-500/30 text-center animate-fade-in-up mt-2">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white opacity-20">
                    <Trophy size={80} />
                  </div>
                  <Trophy size={32} className="mx-auto text-yellow-100 mb-2" />
                  <p className="text-yellow-100 text-sm font-medium uppercase tracking-widest mb-1">Chúc mừng</p>
                  <h3 className="text-white text-xl font-black drop-shadow-md">BẠN LÀ NHÀ VÔ ĐỊCH!</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}