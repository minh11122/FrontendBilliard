import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Trophy, CalendarDays, CheckCircle } from "lucide-react";
import { getTournamentById, getTournamentPlayers, generateBracket, startTournament } from "@/services/tournament.service";

const statusBadge = (status) => {
  const s = status || "";
  if (s === "Approved") return "bg-green-100 text-green-700";
  if (s === "Pending") return "bg-amber-100 text-amber-700";
  if (s === "Rejected") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN");
};

export default function OwnerTournamentPlayersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const tRes = await getTournamentById(id);
        if (tRes?.success) setTournament(tRes.data);

        const pRes = await getTournamentPlayers(id);
        if (pRes?.success) setPlayers(pRes.data || []);
      } catch (e) {
        toast.error(e?.response?.data?.message || e.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleGenerate = async () => {
    if (!window.confirm("Tạo / ghi đè bracket cho giải này?")) return;
    try {
      setActionLoading(true);
      const res = await generateBracket(id, {});
      if (res?.success) toast.success("Đã tạo bracket");
      const tRes = await getTournamentById(id);
      if (tRes?.success) setTournament(tRes.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tạo được bracket");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (!window.confirm("Bắt đầu giải đấu này?")) return;
    try {
      setActionLoading(true);
      const res = await startTournament(id);
      if (res?.success) toast.success("Giải đấu đang diễn ra");
      const tRes = await getTournamentById(id);
      if (tRes?.success) setTournament(tRes.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể bắt đầu");
    } finally {
      setActionLoading(false);
    }
  };

  const feeText = useMemo(() => {
    if (!tournament) return "—";
    const fee = Number(tournament.fee || 0);
    return fee > 0 ? `${fee.toLocaleString("vi-VN")} VNĐ` : "Miễn phí";
  }, [tournament]);

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1100px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" /> Danh sách người chơi
          </h1>
          <p className="text-slate-500 mt-1">
            {tournament?.name || "Đang tải..."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {tournament?.status === "Closed" && (
            <>
              <button
                disabled={actionLoading}
                onClick={handleGenerate}
                className="px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <Trophy size={18} /> Random Bracket
              </button>
              <button
                disabled={actionLoading}
                onClick={handleStart}
                className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-60"
              >
                Bắt đầu giải
              </button>
            </>
          )}
          <button
            onClick={() => navigate("/owner/tournaments")}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-2 text-slate-600">
                <Trophy size={16} className="text-orange-500" /> {tournament?.name || "—"}
              </div>
              <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
              <div className="flex items-center gap-2 text-slate-600">
                <CalendarDays size={16} className="text-slate-400" />
                {tournament?.play_date ? new Date(tournament.play_date).toLocaleDateString("vi-VN") : "—"}
              </div>
              <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />
              <div className="flex items-center gap-2 text-slate-600">
                <CheckCircle size={16} className="text-slate-400" /> {feeText}
              </div>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="py-12 text-center text-slate-500">Giải chưa có người đăng ký.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-3 px-4 font-bold">Người chơi</th>
                    <th className="py-3 px-4 font-bold">SĐT</th>
                    <th className="py-3 px-4 font-bold">Email</th>
                    <th className="py-3 px-4 font-bold">Lệ phí</th>
                    <th className="py-3 px-4 font-bold">Thời điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, idx) => {
                    const acc = p.account_id || {};
                    return (
                      <tr key={p._id || `${idx}-${acc.fullname || "player"}`} className="border-t border-slate-100">
                        <td className="py-3 px-4 font-semibold text-slate-800">{acc.fullname || "—"}</td>
                        <td className="py-3 px-4 text-slate-700">{acc.phone || "—"}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{acc.email || "—"}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {Number(p.fee_amount || 0) > 0
                            ? `${Number(p.fee_amount).toLocaleString("vi-VN")} VNĐ`
                            : "Miễn phí"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDateTime(p.register_date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

