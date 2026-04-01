import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import {
  getMyRegisteredTournamentIds,
  getTournamentById,
  getTournamentMatches,
  getTournamentPlayers,
} from "@/services/tournament.service";
import { AuthContext } from "@/context/AuthContext";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN");
};

const statusBadge = (status) => {
  if (status === "Approved") return "bg-green-100 text-green-700";
  if (status === "Pending") return "bg-amber-100 text-amber-700";
  if (status === "Rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
};

const matchStatusBadge = (status) => {
  if (status === "Finished") return "bg-green-100 text-green-700";
  if (status === "Ready" || status === "InProgress") {
    return "bg-blue-100 text-blue-700";
  }
  if (status === "Scheduled") return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-700";
};

const matchStatusLabel = (status) => {
  const labels = {
    Scheduled: "Chưa bắt đầu",
    Ready: "Sẵn sàng",
    InProgress: "Đang diễn ra",
    Finished: "Đã kết thúc",
  };

  return labels[status] || status || "—";
};

export const TournamentPlayersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [tab, setTab] = useState("players");

  const isStaffRoute = location.pathname.startsWith("/staff/");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const tRes = await getTournamentById(id);
        if (tRes?.success) {
          setTournament(tRes.data);
        }

        if (!isStaffRoute) {
          if (!user) {
            toast("Vui lòng đăng nhập để xem danh sách người chơi", {
              icon: "🔒",
            });
            navigate("/auth/login", {
              replace: true,
              state: {
                from: {
                  pathname: `/tournament/${id}`,
                },
              },
            });
            return;
          }

          if (user.roleName !== "CUSTOMER") {
            toast.error("Bạn không có quyền xem danh sách người chơi ở route này");
            navigate("/", { replace: true });
            return;
          }

          const joinedRes = await getMyRegisteredTournamentIds();
          const joinedTournamentIds = joinedRes?.success ? joinedRes.data || [] : [];
          const hasJoined = joinedTournamentIds.includes(id);

          if (!hasJoined) {
            toast.error("Bạn cần đăng ký giải đấu trước khi xem danh sách người chơi");
            navigate(`/tournament/${id}`, { replace: true });
            return;
          }
        }

        const pRes = await getTournamentPlayers(id);
        if (pRes?.success) {
          setPlayers(pRes.data || []);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || error.message || "Lỗi tải dữ liệu",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isStaffRoute, navigate, user]);

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      const res = await getTournamentMatches(id);
      if (res?.success) {
        setMatches(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleMatchesTabClick = () => {
    setTab("matches");
    if (matches.length === 0) {
      fetchMatches();
    }
  };

  const getPlayerName = (player) => {
    if (!player) return "BYE";
    return player.fullname || "—";
  };

  const handleBack = () => {
    if (isStaffRoute) {
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }

      navigate("/staff/tournaments", { replace: true });
      return;
    }

    navigate(`/tournament/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div className="min-w-[260px]">
              <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <Users className="text-orange-500" size={22} /> Danh sách người chơi
              </h1>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <Trophy size={14} className="text-slate-400" />{" "}
                  {tournament?.name || "—"}
                </p>
                {tournament?.play_date && (
                  <p className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(tournament.play_date).toLocaleDateString("vi-VN")}
                  </p>
                )}
                {typeof tournament?.fee !== "undefined" && (
                  <p className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-slate-400" />
                    Lệ phí:
                    {Number(tournament.fee || 0) > 0
                      ? `${Number(tournament.fee).toLocaleString("vi-VN")} VNĐ`
                      : "Miễn phí"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border rounded-xl p-1">
              <button
                onClick={() => setTab("players")}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  tab === "players"
                    ? "bg-white text-orange-600 shadow-sm border"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Danh sách người chơi
              </button>
              <button
                onClick={handleMatchesTabClick}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  tab === "matches"
                    ? "bg-white text-orange-600 shadow-sm border"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Swords size={14} /> Danh sách trận đấu
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : tab === "players" ? (
            players.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                Chưa có người đăng ký.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="py-3 px-3 font-bold">Người chơi</th>
                      <th className="py-3 px-3 font-bold">SĐT</th>
                      <th className="py-3 px-3 font-bold">Trạng thái</th>
                      <th className="py-3 px-3 font-bold">Lệ phí</th>
                      <th className="py-3 px-3 font-bold">Thời điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, idx) => {
                      const acc = p.account_id || {};

                      return (
                        <tr
                          key={p._id || `${acc.fullname}-${idx}`}
                          className="border-t border-slate-100"
                        >
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {acc.fullname || "—"}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {acc.phone || "—"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusBadge(
                                p.status,
                              )}`}
                            >
                              {p.status || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-800 font-bold">
                            {Number(p.fee_ammount || 0) > 0
                              ? `${Number(p.fee_ammount).toLocaleString("vi-VN")} VNĐ`
                              : "Miễn phí"}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {formatDateTime(p.register_date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : matchesLoading ? (
            <div className="flex items-center justify-center py-14">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : matches.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              Chưa có trận đấu nào. Bracket sẽ được tạo khi chủ quán chốt đăng ký.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center justify-between gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-semibold mb-1">
                      {m.match_name || `Trận ${m.match_no}`}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`font-bold ${
                          m.winner_id &&
                          String(m.winner_id?._id || m.winner_id) ===
                            String(m.player1_id?._id || m.player1_id)
                            ? "text-orange-600"
                            : "text-slate-800"
                        }`}
                      >
                        {getPlayerName(m.player1_id)}
                      </span>
                      <span className="text-slate-400 font-bold text-xs">
                        {m.status === "Finished"
                          ? `${m.player1_score ?? 0} - ${m.player2_score ?? 0}`
                          : "vs"}
                      </span>
                      <span
                        className={`font-bold ${
                          m.winner_id &&
                          String(m.winner_id?._id || m.winner_id) ===
                            String(m.player2_id?._id || m.player2_id)
                            ? "text-orange-600"
                            : "text-slate-800"
                        }`}
                      >
                        {getPlayerName(m.player2_id)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shrink-0 ${matchStatusBadge(
                      m.status,
                    )}`}
                  >
                    {matchStatusLabel(m.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
