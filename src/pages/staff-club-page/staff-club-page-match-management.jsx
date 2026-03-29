import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournamentMatches, startMatch, submitMatchResult, getTournamentById } from "@/services/tournament.service";
import { getTables } from "@/services/billiardTable.service";
import { Trophy, ArrowLeft, Play, Edit3, CheckCircle, Clock, Search, RotateCcw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const StaffClubPageMatchManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";
  
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending"); // "Pending", "Playing", "Finished"

  const [startModalVisvible, setStartModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
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
    // eslint-disable-next-line
  }, [id]);

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
    if (raceTo < 1) return toast.error("Chạm (Target score) phải lớn hơn 0");
    try {
      setActionLoading(true);
      const payload = { race_to: raceTo };
      if (selectedTable) payload.table_id = selectedTable;
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
        toast.success("Cập nhật tỷ số thành công. Bracket đã được chuyển vòng!");
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

  const filteredMatches = matches.filter(m => {
    if (activeTab === "Pending") return ["Scheduled", "Ready"].includes(m.status);
    if (activeTab === "Playing") return m.status === "Playing";
    if (activeTab === "Finished") return ["Finished", "Cancelled"].includes(m.status);
    return true;
  });

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
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
          { id: "Finished", label: "Đã kết thúc", icon: CheckCircle },
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
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-400">Không có trận đấu nào trong mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(m => {
             const p1 = m.player1_id;
             const p2 = m.player2_id;
             return (
               <div key={m._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                       m.status === 'Playing' ? 'bg-blue-100 text-blue-700' :
                       m.status === 'Finished' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                     }`}>
                       {m.status}
                     </span>
                     <span className="text-sm font-bold text-slate-400">{m.match_name}</span>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                     <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                       <span className="font-semibold text-slate-800">{p1?.fullname || "TBD"}</span>
                       <span className="font-bold text-lg text-slate-900">{m.player1_score}</span>
                     </div>
                     <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                       <span className="font-semibold text-slate-800">{p2?.fullname || "TBD"}</span>
                       <span className="font-bold text-lg text-slate-900">{m.player2_score}</span>
                     </div>
                   </div>
                 </div>

                 <div className="mt-6">
                   {activeTab === "Pending" && (
                     <button 
                       disabled={!p1 || !p2}
                       onClick={() => handleOpenStartModal(m)}
                       className="w-full py-2.5 bg-[#00A65A] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#008d4c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <Play size={18} /> Gán bàn & Bắt đầu
                     </button>
                   )}
                   {activeTab === "Playing" && (
                     <button 
                       onClick={() => handleOpenResultModal(m)}
                       className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                     >
                       <Edit3 size={18} /> Cập nhật Tỷ số
                     </button>
                   )}
                   {activeTab === "Finished" && (
                     <div className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2">
                       Trận đấu đã kết thúc
                     </div>
                   )}
                 </div>
               </div>
             )
          })}
        </div>
      )}

      {/* MODAL: BẮT ĐẦU TRẬN / GÁN BÀN */}
      {startModalVisvible && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Bắt đầu thi đấu</h3>
              <span className="text-sm font-bold text-slate-400">{selectedMatch.match_name}</span>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn bàn thi đấu</label>
                  <select 
                    value={selectedTable} 
                    onChange={e => setSelectedTable(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Chọn bàn...</option>
                    {tables.map(t => (
                      <option key={t._id} value={t._id}>Bàn {t.table_number || t.name || t._id} (Khu vực: {t.area})</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Đánh chạm mấy (Race to)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={raceTo} 
                    onChange={e => setRaceTo(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
               </div>
               <div className="pt-4 flex gap-3">
                 <button disabled={actionLoading} onClick={() => setStartModalVisible(false)} className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Hủy</button>
                 <button disabled={actionLoading} onClick={handleStartMatch} className="flex-1 py-2.5 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center">
                   {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận & Bắt đầu"}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CẬP NHẬT TỶ SỐ */}
      {resultModalVisible && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Kết quả trận đấu</h3>
              <span className="text-sm font-bold text-slate-400">{selectedMatch.match_name}</span>
            </div>
            <div className="p-6 space-y-6">
               <div className="flex grid-cols-3 gap-4 items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-xl">
                 <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="font-bold text-slate-700 text-center line-clamp-2">{selectedMatch.player1_id?.fullname}</span>
                    <input 
                      type="number" min="0" 
                      className="w-20 text-center text-3xl font-black py-2 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                      value={p1Score} onChange={e => setP1Score(Number(e.target.value))}
                    />
                 </div>
                 <div className="font-black text-2xl text-slate-300">-</div>
                 <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="font-bold text-slate-700 text-center line-clamp-2">{selectedMatch.player2_id?.fullname}</span>
                    <input 
                      type="number" min="0" 
                      className="w-20 text-center text-3xl font-black py-2 rounded-lg border-2 border-slate-200 focus:border-orange-500 focus:outline-none"
                      value={p2Score} onChange={e => setP2Score(Number(e.target.value))}
                    />
                 </div>
               </div>
               
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Đánh chạm mấy (Race to)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={raceTo} 
                    onChange={e => setRaceTo(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                  <p className="text-xs text-slate-500 mt-2 italic">* Nếu trận đấu đang đánh dở mà bị dừng, ghi đúng tỷ số hiện tại và bấm chốt.</p>
               </div>

               <div className="pt-2 flex gap-3">
                 <button disabled={actionLoading} onClick={() => setResultModalVisible(false)} className="flex-1 py-2.5 font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Hủy</button>
                 <button disabled={actionLoading} onClick={handleUpdateResult} className="flex-1 py-2.5 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center">
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
