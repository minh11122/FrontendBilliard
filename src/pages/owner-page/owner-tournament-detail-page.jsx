import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft, Trophy, Users, Calendar, Info, Tag, AlignLeft,
  MapPin, Clock, CheckCircle, XCircle
} from "lucide-react";
import { getTournamentById, getTournamentPlayers } from "@/services/tournament.service";

const statusBadge = {
  Draft: "bg-slate-100 text-slate-600 border border-slate-200",
  Open: "bg-green-100 text-green-700 border border-green-200",
  Closed: "bg-amber-100 text-amber-700 border border-amber-200",
  InProgress: "bg-blue-100 text-blue-700 border border-blue-200",
  Completed: "bg-gray-100 text-gray-600 border border-gray-200",
  Cancelled: "bg-red-100 text-red-600 border border-red-200",
};

const statusLabel = {
  Draft: "Bản nháp",
  Open: "Mở đăng ký",
  Closed: "Đóng đăng ký",
  InProgress: "Đang diễn ra",
  Completed: "Đã kết thúc",
  Cancelled: "Đã hủy",
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN");
};

const fallbackBanner =
  "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=800";

export default function OwnerTournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // detect if accessed from /staff or /owner
  const isStaff = location.pathname.startsWith("/staff");
  const backPath = isStaff ? "/staff/tournaments" : "/owner/tournaments";

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [tRes, pRes] = await Promise.all([
          getTournamentById(id),
          getTournamentPlayers(id),
        ]);
        if (tRes?.success) setTournament(tRes.data);
        if (pRes?.success) setPlayers(pRes.data || []);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const feeText = useMemo(() => {
    if (!tournament) return "—";
    const fee = Number(tournament.fee || 0);
    return fee > 0 ? `${fee.toLocaleString("vi-VN")} VNĐ` : "Miễn phí";
  }, [tournament]);

  const bannerUrl = tournament?.banner?.trim() ? tournament.banner : fallbackBanner;
  const badge = statusBadge[tournament?.status] || statusBadge.Draft;

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1100px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Info className="w-8 h-8 text-orange-500" /> Chi tiết giải đấu
          </h1>
          <p className="text-slate-500 mt-1 pl-11">
            {tournament?.name || "Đang tải..."}
          </p>
        </div>
        <button
          onClick={() => navigate(backPath)}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : !tournament ? (
        <div className="text-center py-20 text-slate-500">Không tìm thấy giải đấu.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Banner + Info card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="relative h-52 overflow-hidden">
              <img
                src={bannerUrl}
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={`absolute bottom-4 left-5 text-xs font-bold px-3 py-1 rounded-full ${badge}`}>
                {statusLabel[tournament.status] || tournament.status}
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoRow icon={<Trophy size={16} className="text-orange-500" />} label="Tên giải" value={tournament.name} />
              <InfoRow icon={<Tag size={16} className="text-slate-400" />} label="Lệ phí" value={feeText} />
              <InfoRow icon={<Users size={16} className="text-slate-400" />} label="Số người" value={`${tournament.registered_player || 0} / ${tournament.max_players}`} />
              <InfoRow icon={<Calendar size={16} className="text-slate-400" />} label="Ngày thi đấu" value={formatDateTime(tournament.play_date)} />
              <InfoRow icon={<Clock size={16} className="text-slate-400" />} label="Đăng ký từ" value={formatDateTime(tournament.registration_open)} />
              <InfoRow icon={<Clock size={16} className="text-slate-400" />} label="Đăng ký đến" value={formatDateTime(tournament.registration_deadline)} />
              {tournament.club_id?.name && (
                <InfoRow icon={<MapPin size={16} className="text-slate-400" />} label="CLB" value={tournament.club_id.name} />
              )}
              {tournament.description && (
                <div className="md:col-span-2">
                  <InfoRow icon={<AlignLeft size={16} className="text-slate-400" />} label="Mô tả" value={tournament.description} />
                </div>
              )}
            </div>
          </div>

          {/* Players table */}
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              <h2 className="font-bold text-slate-800">
                Danh sách người đăng ký ({players.length})
              </h2>
            </div>

            {players.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                Giải chưa có người đăng ký.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 bg-slate-50">
                      <th className="py-3 px-4 font-bold">#</th>
                      <th className="py-3 px-4 font-bold">Người chơi</th>
                      <th className="py-3 px-4 font-bold">SĐT</th>
                      <th className="py-3 px-4 font-bold">Email</th>
                      <th className="py-3 px-4 font-bold">Lệ phí</th>
                      <th className="py-3 px-4 font-bold">Thời điểm đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, idx) => {
                      const acc = p.account_id || {};
                      return (
                        <tr key={p._id || idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{acc.fullname || "—"}</td>
                          <td className="py-3 px-4 text-slate-600">{acc.phone || "—"}</td>
                          <td className="py-3 px-4 text-slate-600">{acc.email || "—"}</td>
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
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
      </div>
    </div>
  );
}
