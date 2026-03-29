import React, { useEffect, useState } from "react";
import { getTournamentBracket, getLeaderboard } from "@/services/tournament.service";
import { Trophy, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const MatchNode = ({ match }) => {
  const p1 = match.player1_id;
  const p2 = match.player2_id;
  
  const p1Winner = match.winner_id?._id === p1?._id || match.winner_id === p1?._id;
  const p2Winner = match.winner_id?._id === p2?._id || match.winner_id === p2?._id;

  return (
    <div className={`relative flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm w-48 text-sm ${match.status === 'Playing' ? 'ring-2 ring-orange-400' : ''}`}>
      {/* Target score indicator */}
      <div className="bg-slate-50 border-b border-slate-200 px-2 py-1 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
        <span>{match.status}</span>
        {match.race_to > 0 && <span>Chạm {match.race_to}</span>}
      </div>

      <div className={`flex justify-between items-center px-3 py-2 border-b border-slate-100 ${p1Winner ? 'bg-green-50' : ''}`}>
        <span className={`truncate font-medium ${p1Winner ? 'text-green-700 font-bold' : 'text-slate-800'}`}>
          {p1 ? p1.fullname : <span className="text-slate-400 italic">TBD</span>}
        </span>
        <span className="font-bold text-slate-900 ml-2">{match.player1_score > 0 || match.status === 'Finished' ? match.player1_score : '-'}</span>
      </div>

      <div className={`flex justify-between items-center px-3 py-2 ${p2Winner ? 'bg-green-50' : ''}`}>
        <span className={`truncate font-medium ${p2Winner ? 'text-green-700 font-bold' : 'text-slate-800'}`}>
          {p2 ? p2.fullname : <span className="text-slate-400 italic">TBD</span>}
        </span>
        <span className="font-bold text-slate-900 ml-2">{match.player2_score > 0 || match.status === 'Finished' ? match.player2_score : '-'}</span>
      </div>
    </div>
  );
};

export const TournamentBracket = ({ tournamentId, format }) => {
  const [bracketData, setBracketData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        setLoading(true);
        const res = await getTournamentBracket(tournamentId);
        if (res?.success) {
          setBracketData(res.data || []);
        }
        
        if (format === "Round Robin") {
          const lbRes = await getLeaderboard(tournamentId);
          if (lbRes?.success) {
            setLeaderboard(lbRes.data || []);
          }
        }
      } catch (e) {
        console.error("Failed to load bracket:", e);
        toast.error("Không tải được sơ đồ giải đấu.");
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) fetchBracket();
  }, [tournamentId, format]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!bracketData || bracketData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
        <Trophy className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Chưa có sơ đồ hoặc lịch thi đấu.</p>
      </div>
    );
  }

  if (format === "Knockout") {
    return (
      <div className="overflow-x-auto p-4 bg-slate-50 rounded-xl border border-slate-200 custom-scrollbar">
        <div className="flex gap-12 min-w-max pb-8 relative">
          {bracketData.map((round) => (
            <div key={round._id} className="flex flex-col gap-6 w-56 relative z-10 shrink-0">
              <h3 className="font-bold text-center text-slate-700 bg-white border border-slate-200 py-2 rounded-lg shadow-sm">
                {round.name}
              </h3>
              <div className="flex flex-col gap-8 flex-1 justify-around">
                {round.matches?.map((match) => (
                  <MatchNode key={match._id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (format === "Round Robin") {
    // Generate Round Robin tables
    return (
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Trophy className="text-orange-500 w-5 h-5"/> Bảng Xếp Hạng
            </h3>
          </div>
          <div className="overflow-x-auto p-4">
             <table className="w-full text-sm">
               <thead>
                 <tr className="bg-slate-50 text-slate-600 text-left rounded-lg">
                   <th className="py-3 px-3 rounded-l-lg">Hạng</th>
                   <th className="py-3 px-3">Tên cơ thủ</th>
                   <th className="py-3 px-3 text-center">Group</th>
                   <th className="py-3 px-3 text-center">Trận</th>
                   <th className="py-3 px-3 text-center">T - B</th>
                   <th className="py-3 px-4 text-center font-bold rounded-r-lg">Tổng Điểm</th>
                 </tr>
               </thead>
               <tbody>
                  {leaderboard.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-500 font-medium">Chưa có dữ liệu.</td></tr>
                  ) : (
                    leaderboard.flat().sort((a,b)=>a.rank - b.rank).map((player, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-700">{player.rank || idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{player.name || "N/A"}</td>
                        <td className="py-3 px-3 text-center font-medium text-blue-600">{player.group_key || "A"}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{player.matches}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{player.wins} - {player.losses}</td>
                        <td className="py-3 px-4 text-center font-black text-orange-600 text-base">{player.points}</td>
                      </tr>
                    ))
                  )}
               </tbody>
             </table>
          </div>
        </div>
        
        <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm p-5 overflow-hidden flex flex-col max-h-[700px]">
          <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2 shrink-0">
            <Users className="text-blue-500 w-5 h-5"/> Danh sách trận đấu
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
             {bracketData.flatMap(r => r.matches || []).map(match => {
                const p1 = match.player1_id;
                const p2 = match.player2_id;
                const p1Winner = match.winner_id?._id === p1?._id || match.winner_id === p1?._id;
                const p2Winner = match.winner_id?._id === p2?._id || match.winner_id === p2?._id;
                
                return (
                  <div key={match._id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                      <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{match.status}</span>
                      <span>Chạm {match.race_to || 7}</span>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <div className={`flex-1 p-3 rounded-lg text-sm text-center truncate ${p1Winner ? 'bg-green-50 text-green-700 font-bold border border-green-200' : 'bg-slate-50 border border-slate-100 font-medium text-slate-700'}`}>
                        {p1?.fullname || "TBD"}
                      </div>
                      <div className="font-black text-lg text-slate-800 tracking-widest shrink-0 w-20 text-center">
                        {match.player1_score} - {match.player2_score}
                      </div>
                      <div className={`flex-1 p-3 rounded-lg text-sm text-center truncate ${p2Winner ? 'bg-green-50 text-green-700 font-bold border border-green-200' : 'bg-slate-50 border border-slate-100 font-medium text-slate-700'}`}>
                        {p2?.fullname || "TBD"}
                      </div>
                    </div>
                  </div>
                )
             })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
