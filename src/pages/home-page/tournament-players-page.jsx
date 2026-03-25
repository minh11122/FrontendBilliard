import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Users, Trophy, Calendar, CheckCircle, Clock } from "lucide-react";
import { getTournamentById, getTournamentPlayers } from "@/services/tournament.service";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
};

const statusBadge = (status) => {
  const s = status || "";
  if (s === "Approved") return "bg-green-100 text-green-700";
  if (s === "Pending") return "bg-amber-100 text-amber-700";
  if (s === "Rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
};

export const TournamentPlayersPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [tab, setTab] = useState("players");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tRes = await getTournamentById(id);
        if (tRes?.success) setTournament(tRes.data);

        const pRes = await getTournamentPlayers(id);
        if (pRes?.success) setPlayers(pRes.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleMatchesTabClick = () => {
    toast("Danh sách trận đấu sẽ có ở phiên bản sau");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(`/tournament/${id}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} /> Quay lại chi tiết giải
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div className="min-w-[260px]">
              <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <Users className="text-orange-500" size={22} /> Danh sách người chơi
              </h1>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <Trophy size={14} className="text-slate-400" /> {tournament?.name || "—"}
                </p>
                {tournament?.play_date && (
                  <p className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />{" "}
                    {new Date(tournament.play_date).toLocaleDateString("vi-VN")}
                  </p>
                )}
                {typeof tournament?.fee !== "undefined" && (
                  <p className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-slate-400" /> Lệ phí:{" "}
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
                onClick={() => {
                  setTab("matches");
                  handleMatchesTabClick();
                }}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  tab === "matches"
                    ? "bg-white text-orange-600 shadow-sm border"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Clock size={14} /> Danh sách trận đấu
                </span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : tab === "players" ? (
            <div>
              {players.length === 0 ? (
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
                                  p.status
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
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500">
              Trang danh sách trận đấu sẽ được cập nhật sau.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

