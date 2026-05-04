import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit3,
  EyeOff,
  Layers3,
  Loader2,
  Play,
  RotateCcw,
  Search,
  Trophy,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import { getTables } from "@/services/billiardTable.service";
import {
  getTournamentById,
  getTournamentMatches,
  startMatch,
  submitMatchResult
} from "@/services/tournament.service";

const STATUS_META = {
  Ready: { label: "Sẵn sàng", className: "bg-emerald-100 text-emerald-700" },
  Scheduled: { label: "Đang chờ", className: "bg-amber-100 text-amber-700" },
  Playing: { label: "Đang đánh", className: "bg-blue-100 text-blue-700" },
  Finished: { label: "Đã kết thúc", className: "bg-slate-200 text-slate-700" },
  Cancelled: { label: "Đã hủy", className: "bg-rose-100 text-rose-700" }
};

const normalizeMatchName = (name = "") =>
  name
    .replace(/Nhanh thang/gi, "Nhánh thắng")
    .replace(/Nhanh thua/gi, "Nhánh thua")
    .replace(/Chung ket nhanh thang/gi, "Chung kết nhánh thắng")
    .replace(/Chung ket nhanh thua/gi, "Chung kết nhánh thua")
    .replace(/Chung ket/gi, "Chung kết")
    .replace(/Vong/gi, "Vòng")
    .replace(/Tran/gi, "Trận")
    .replace(/\s+/g, " ")
    .trim();

const getMatchVisualType = (match) => {
  const hasP1 = Boolean(match.player1_id);
  const hasP2 = Boolean(match.player2_id);

  if (hasP1 && hasP2) return "ready";
  if (hasP1 || hasP2) return "awaiting";
  return "placeholder";
};

const getMatchPriority = (match) => {
  const visualType = getMatchVisualType(match);
  const statusWeight =
    match.status === "Ready" ? 0 :
    match.status === "Playing" ? 1 :
    match.status === "Finished" ? 2 : 3;
  const visualWeight =
    visualType === "ready" ? 0 :
    visualType === "awaiting" ? 1 : 2;
  const bracketWeight =
    match.bracket_side === "Winners" ? 0 :
    match.bracket_side === "Losers" ? 1 :
    match.bracket_side === "GrandFinal" ? 2 : 3;

  return `${statusWeight}-${visualWeight}-${bracketWeight}-${normalizeMatchName(match.match_name)}-${match.match_no || 0}`;
};

const getPlayerName = (player) => player?.fullname || "TBD";

const getMatchHint = (match) => {
  const visualType = getMatchVisualType(match);

  if (visualType === "ready") {
    return "Đủ 2 người chơi, staff có thể gán bàn và bắt đầu ngay.";
  }

  if (visualType === "awaiting") {
    return "Trận này đang chờ xác định đối thủ từ nhánh trước hoặc auto-advance.";
  }

  return "Trận placeholder chưa có người chơi thật, tạm ẩn khỏi danh sách thao tác.";
};

const SectionHeader = ({ icon: Icon, title, subtitle, count, tone = "slate" }) => {
  const toneMap = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
    amber: "text-amber-700 bg-amber-50 border-amber-100",
    slate: "text-slate-700 bg-slate-50 border-slate-200"
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneMap[tone] || toneMap.slate}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/80 border border-current/10 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">{title}</p>
            <p className="text-sm opacity-80">{subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">{count}</p>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">trận</p>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({
  match,
  mode,
  onStart,
  onUpdateResult
}) => {
  const p1 = match.player1_id;
  const p2 = match.player2_id;
  const statusMeta = STATUS_META[match.status] || STATUS_META.Scheduled;
  const visualType = getMatchVisualType(match);
  const title = normalizeMatchName(match.match_name);

  const cardTone =
    mode === "ready" ? "border-emerald-200 shadow-emerald-100/60" :
    mode === "awaiting" ? "border-amber-200 shadow-amber-100/50" :
    "border-slate-200 shadow-slate-200/50";

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${cardTone}`}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusMeta.className}`}>
              {statusMeta.label}
            </span>
            {match.table_id?.table_number && (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-sky-100 text-sky-700">
                Bàn {match.table_id.table_number}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-slate-500 text-right">{title}</span>
        </div>

        <div className="space-y-3">
          {[{ player: p1, score: match.player1_score }, { player: p2, score: match.player2_score }].map((entry, idx) => {
            const isMissing = !entry.player;
            return (
              <div
                key={`${match._id}-${idx}`}
                className={`flex justify-between items-center p-3 rounded-xl border ${
                  isMissing
                    ? "border-dashed border-slate-200 bg-slate-50"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <span className={`font-semibold ${isMissing ? "text-slate-400 italic" : "text-slate-800"}`}>
                  {getPlayerName(entry.player)}
                </span>
                <span className="font-bold text-lg text-slate-900">
                  {match.status === "Finished" || match.status === "Playing" ? entry.score : 0}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Gợi ý</p>
          <p className="text-sm text-slate-600">{getMatchHint(match)}</p>
        </div>
      </div>

      <div className="mt-6">
        {mode === "ready" && (
          <button
            onClick={() => onStart(match)}
            className="w-full py-2.5 bg-[#00A65A] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#008d4c] transition-colors"
          >
            <Play size={18} /> Gán bàn & Bắt đầu
          </button>
        )}

        {mode === "awaiting" && (
          <div className="w-full py-2.5 bg-amber-50 text-amber-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-100">
            <Clock size={18} /> Đang chờ đủ đối thủ
          </div>
        )}

        {mode === "playing" && (
          <button
            onClick={() => onUpdateResult(match)}
            className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Edit3 size={18} /> Cập nhật tỷ số
          </button>
        )}

        {mode === "finished" && (
          <div className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2">
            Trận đấu đã kết thúc
          </div>
        )}

        {mode === "placeholder" && (
          <div className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2">
            Placeholder
          </div>
        )}
      </div>
    </div>
  );
};

export const StaffClubPageMatchManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");

  const [startModalVisvible, setStartModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedTable, setSelectedTable] = useState("");
  const [raceTo, setRaceTo] = useState(7);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, mRes, tableRes] = await Promise.all([
        getTournamentById(id),
        getTournamentMatches(id),
        getTables({ club_id: CLUB_ID, limit: 100 })
      ]);
      if (tRes?.success) setTournament(tRes.data);
      if (mRes?.success) setMatches(mRes.data);
      if (tableRes?.data?.success) setTables(tableRes.data.data || []);
    } catch (e) {
      toast.error("Không tải được dữ liệu quản lý trận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => getMatchPriority(a).localeCompare(getMatchPriority(b))),
    [matches]
  );

  const filteredMatches = useMemo(() => {
    return sortedMatches.filter((match) => {
      if (activeTab === "Pending") return ["Scheduled", "Ready"].includes(match.status);
      if (activeTab === "Playing") return match.status === "Playing";
      if (activeTab === "Finished") return ["Finished", "Cancelled"].includes(match.status);
      return true;
    });
  }, [activeTab, sortedMatches]);

  const pendingReadyMatches = useMemo(
    () => filteredMatches.filter((match) => getMatchVisualType(match) === "ready"),
    [filteredMatches]
  );

  const pendingAwaitingMatches = useMemo(
    () => filteredMatches.filter((match) => getMatchVisualType(match) === "awaiting"),
    [filteredMatches]
  );

  const pendingPlaceholderMatches = useMemo(
    () => filteredMatches.filter((match) => getMatchVisualType(match) === "placeholder"),
    [filteredMatches]
  );

  const handleOpenStartModal = (match) => {
    setSelectedMatch(match);
    setSelectedTable(match.table_id?._id || "");
    setRaceTo(match.race_to || 7);
    setStartModalVisible(true);
  };

  const handleOpenResultModal = (match) => {
    setSelectedMatch(match);
    setP1Score(match.player1_score || 0);
    setP2Score(match.player2_score || 0);
    setRaceTo(match.race_to || 7);
    setResultModalVisible(true);
  };

  const handleStartMatch = async () => {
    if (!selectedTable) return toast.error("Vui lòng chọn bàn thi đấu");
    if (raceTo < 1) return toast.error("Chạm phải lớn hơn 0");

    try {
      setActionLoading(true);
      const payload = { race_to: raceTo, table_id: selectedTable };
      const res = await startMatch(id, selectedMatch._id, payload);
      if (res?.success) {
        toast.success("Bắt đầu trận thành công");
        setStartModalVisible(false);
        fetchData();
        setActiveTab("Playing");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi khi bắt đầu trận");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateResult = async () => {
    try {
      setActionLoading(true);
      const res = await submitMatchResult(id, selectedMatch._id, {
        player1_score: p1Score,
        player2_score: p2Score,
        race_to: raceTo
      });
      if (res?.success) {
        toast.success("Cập nhật tỷ số thành công. Bracket đã được chuyển vòng.");
        setResultModalVisible(false);
        fetchData();
        setActiveTab("Finished");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lỗi khi cập nhật tỷ số");
    } finally {
      setActionLoading(false);
    }
  };

  const renderPendingTab = () => {
    const totalVisible = pendingReadyMatches.length + pendingAwaitingMatches.length;

    if (totalVisible === 0 && pendingPlaceholderMatches.length === 0) {
      return (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-400">Không có trận chờ thi đấu</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionHeader
            icon={Play}
            title="Sẵn sàng bắt đầu"
            subtitle="Ưu tiên thao tác cho staff"
            count={pendingReadyMatches.length}
            tone="emerald"
          />
          <SectionHeader
            icon={Clock}
            title="Đang chờ đủ đối thủ"
            subtitle="Theo dõi nhánh trước hoàn tất"
            count={pendingAwaitingMatches.length}
            tone="amber"
          />
          <SectionHeader
            icon={EyeOff}
            title="Placeholder đang ẩn"
            subtitle="Trận TBD/TBD chưa cần staff xử lý"
            count={pendingPlaceholderMatches.length}
            tone="slate"
          />
        </div>

        {pendingReadyMatches.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Play className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Trận có thể bắt đầu ngay</h2>
                <p className="text-sm text-slate-500">Đủ 2 người chơi, staff chỉ cần gán bàn.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {pendingReadyMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  mode="ready"
                  onStart={handleOpenStartModal}
                />
              ))}
            </div>
          </section>
        )}

        {pendingAwaitingMatches.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Trận đang chờ xác định đối thủ</h2>
                <p className="text-sm text-slate-500">Các trận này sẽ tự rõ khi nhánh trước hoặc auto-advance hoàn tất.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {pendingAwaitingMatches.map((match) => (
                <MatchCard
                  key={match._id}
                  match={match}
                  mode="awaiting"
                />
              ))}
            </div>
          </section>
        )}

        {pendingPlaceholderMatches.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <Layers3 className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Đã ẩn {pendingPlaceholderMatches.length} trận placeholder</p>
                <p className="text-sm text-slate-600 mt-1">
                  Đây là các trận `TBD/TBD` sinh ra do bracket chưa đầy. Staff chưa cần thao tác trên các trận này.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1440px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-500" /> Quản lý Trận Đấu
          </h1>
          <p className="text-slate-500 mt-1 pl-11 text-lg font-medium">{tournament?.name || "Đang tải..."}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2.5 bg-white text-slate-600 hover:text-orange-500 font-semibold rounded-xl transition-all shadow-sm border border-slate-200 flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Cập nhật
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all shadow-sm border border-slate-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 max-w-lg">
        {[
          { id: "Pending", label: "Chờ thi đấu", icon: Clock },
          { id: "Playing", label: "Đang đánh", icon: Play },
          { id: "Finished", label: "Đã kết thúc", icon: CheckCircle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isActive ? "bg-orange-50 text-orange-600" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : activeTab === "Pending" ? (
        renderPendingTab()
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-400">Không có trận đấu nào trong mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match._id}
              match={match}
              mode={activeTab === "Playing" ? "playing" : "finished"}
              onUpdateResult={handleOpenResultModal}
            />
          ))}
        </div>
      )}

      {startModalVisvible && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Bắt đầu thi đấu</h3>
              <span className="text-sm font-bold text-slate-400">{normalizeMatchName(selectedMatch.match_name)}</span>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn bàn thi đấu</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Chọn bàn...</option>
                  {tables
                    .filter((table) => {
                      // Bỏ qua các bàn không khả dụng (đang chơi, bảo trì, hoặc có khách đặt)
                      if (table.status !== "Available") return false;
                      if (table.activeBooking && ["Playing", "Booked"].includes(table.activeBooking.status)) return false;

                      if (!tournament?.table_type_id) return true;
                      const tourType = tournament.table_type_id._id || tournament.table_type_id;
                      const tType = table.table_type_id?._id || table.table_type_id;
                      return String(tourType) === String(tType);
                    })
                    .map((table) => (
                    <option key={table._id} value={table._id}>
                      Bàn {table.table_number || table.name || table._id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Đánh chạm mấy (Race to)</label>
                <input
                  type="number"
                  min="1"
                  value={raceTo}
                  onChange={(e) => setRaceTo(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Người chơi</p>
                <div className="space-y-2">
                  {[selectedMatch.player1_id, selectedMatch.player2_id].map((player, index) => (
                    <div key={`${selectedMatch._id}-${index}`} className="flex items-center gap-2 text-slate-700">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{getPlayerName(player)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => setStartModalVisible(false)}
                  className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleStartMatch}
                  className="flex-1 py-2.5 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận & Bắt đầu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultModalVisible && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Kết quả trận đấu</h3>
              <span className="text-sm font-bold text-slate-400">{normalizeMatchName(selectedMatch.match_name)}</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex grid-cols-3 gap-4 items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="font-bold text-slate-700 text-center line-clamp-2">{selectedMatch.player1_id?.fullname}</span>
                  <input
                    type="number"
                    min="0"
                    className="w-20 text-center text-3xl font-black py-2 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={p1Score}
                    onChange={(e) => setP1Score(Number(e.target.value))}
                  />
                </div>
                <div className="font-black text-2xl text-slate-300">-</div>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="font-bold text-slate-700 text-center line-clamp-2">{selectedMatch.player2_id?.fullname}</span>
                  <input
                    type="number"
                    min="0"
                    className="w-20 text-center text-3xl font-black py-2 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                    value={p2Score}
                    onChange={(e) => setP2Score(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Số điểm chạm (Race to)</label>
                <input
                  type="number"
                  value={raceTo}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-bold outline-none cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-2 italic">* Nếu trận đang đánh dở mà bị dừng, ghi đúng tỷ số hiện tại rồi bấm chốt.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => setResultModalVisible(false)}
                  className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleUpdateResult}
                  className="flex-1 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Chốt & Đi tiếp nhánh"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
