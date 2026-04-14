import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { getTournamentBracket, getLeaderboard } from "@/services/tournament.service";
import { Trophy, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";

const MATCH_CARD_WIDTH = 192; // w-48 = 12rem = 192px
const ROUND_GAP = 48; // gap-12 = 3rem = 48px
const CONNECTOR_COLOR = "#94a3b8"; // slate-400
const CONNECTOR_COLOR_FINISHED = "#22c55e"; // green-500
const CONNECTOR_WIDTH = 2;

const MatchNode = React.forwardRef(({ match, currentUserId }, ref) => {
  const p1 = match.player1_id;
  const p2 = match.player2_id;

  const p1Winner = match.winner_id?._id === p1?._id || match.winner_id === p1?._id;
  const p2Winner = match.winner_id?._id === p2?._id || match.winner_id === p2?._id;

  const p1IsMe = currentUserId && p1 && (p1._id === currentUserId || p1.account_id === currentUserId);
  const p2IsMe = currentUserId && p2 && (p2._id === currentUserId || p2.account_id === currentUserId);
  const hasMe = p1IsMe || p2IsMe;

  return (
    <div
      ref={ref}
      data-match-id={match._id}
      className={`relative flex flex-col bg-white border rounded-lg overflow-hidden shadow-sm w-48 text-sm transition-all ${
        hasMe ? "border-orange-300 ring-1 ring-orange-300 shadow-orange-100 shadow-md" : "border-slate-200"
      } ${
        match.status === "Playing" ? "ring-2 ring-orange-500" : ""
      }`}
    >
      <div className={`border-b px-2 py-1 flex justify-between items-center text-[10px] font-bold uppercase ${hasMe ? "bg-orange-50/50 border-orange-100 text-orange-600" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
        <span>{match.status}</span>
        {match.race_to > 0 && <span>Chạm {match.race_to}</span>}
      </div>

      <div
        className={`flex justify-between items-center px-3 py-2 border-b ${
          p1Winner ? (p1IsMe ? "bg-green-100 border-green-200" : "bg-green-50 border-slate-100") : (p1IsMe ? "bg-orange-50 border-orange-100" : "border-slate-100")
        }`}
      >
        <span
          className={`truncate font-medium flex items-center gap-1 ${
            p1Winner ? "text-green-700 font-bold" : p1IsMe ? "text-orange-700 font-bold" : "text-slate-800"
          }`}
        >
          {p1 ? p1.fullname : <span className="text-slate-400 italic">TBD</span>}
          {p1IsMe && <span className="text-[9px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full inline-block leading-none">BẠN</span>}
        </span>
        <span className="font-bold text-slate-900 ml-2">
          {match.player1_score > 0 || match.status === "Finished" ? match.player1_score : "-"}
        </span>
      </div>

      <div
        className={`flex justify-between items-center px-3 py-2 ${
          p2Winner ? (p2IsMe ? "bg-green-100" : "bg-green-50") : (p2IsMe ? "bg-orange-50" : "")
        }`}
      >
        <span
          className={`truncate font-medium flex items-center gap-1 ${
            p2Winner ? "text-green-700 font-bold" : p2IsMe ? "text-orange-700 font-bold" : "text-slate-800"
          }`}
        >
          {p2 ? p2.fullname : <span className="text-slate-400 italic">TBD</span>}
          {p2IsMe && <span className="text-[9px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full inline-block leading-none">BẠN</span>}
        </span>
        <span className="font-bold text-slate-900 ml-2">
          {match.player2_score > 0 || match.status === "Finished" ? match.player2_score : "-"}
        </span>
      </div>
    </div>
  );
});

MatchNode.displayName = "MatchNode";

/**
 * Check if a match should be hidden from bracket display:
 * - BYE matches (auto-advance, one player against nobody)
 * - Empty matches (both players are TBD/null — placeholder slots)
 */
const isHiddenMatch = (match) => {
  // Explicit BYE result
  if (match.result === "BYE") return true;

  // Finished with only 1 player (auto-advance)
  if (match.status === "Finished" && (!match.player1_id || !match.player2_id)) return true;

  // Both players are null/TBD (empty placeholder match)
  if (!match.player1_id && !match.player2_id) return true;

  return false;
};

/**
 * Build a lookup: matchId -> { nextMatchId, nextSlot } from match data
 * Only includes non-BYE matches that are actually rendered
 */
const buildConnectorMap = (rounds, visibleMatchIds) => {
  const map = {};
  for (const round of rounds) {
    for (const match of round.matches || []) {
      if (!visibleMatchIds.has(match._id)) continue;
      const nextId = match.winner_next_match_id || match.next_match_id;
      const nextSlot = match.winner_next_slot || match.next_slot;
      if (nextId && visibleMatchIds.has(nextId)) {
        map[match._id] = { nextMatchId: nextId, nextSlot, status: match.status };
      }
    }
  }
  return map;
};

/**
 * Pre-process rounds: filter out BYE matches, then filter out empty rounds.
 */
const filterRounds = (rounds) => {
  // Collect all visible (non-BYE) match IDs
  const visibleMatchIds = new Set();
  const filteredRounds = [];

  for (const round of rounds) {
    const visibleMatches = (round.matches || []).filter((m) => !isHiddenMatch(m));
    if (visibleMatches.length > 0) {
      filteredRounds.push({ ...round, matches: visibleMatches });
      visibleMatches.forEach((m) => visibleMatchIds.add(m._id));
    }
  }

  return { filteredRounds, visibleMatchIds };
};

const RoundColumns = ({ rounds, currentUserId }) => {
  const containerRef = useRef(null);
  const matchRefs = useRef({});
  const [connectors, setConnectors] = useState([]);

  const { filteredRounds, visibleMatchIds } = React.useMemo(
    () => filterRounds(rounds),
    [rounds]
  );

  const setMatchRef = useCallback((matchId, el) => {
    if (el) {
      matchRefs.current[matchId] = el;
    }
  }, []);

  // Calculate connector lines after render
  useEffect(() => {
    const calculateConnectors = () => {
      const container = containerRef.current;
      if (!container) return;

      const connectorMap = buildConnectorMap(rounds, visibleMatchIds);
      const containerRect = container.getBoundingClientRect();
      const lines = [];

      for (const [matchId, { nextMatchId, nextSlot, status }] of Object.entries(connectorMap)) {
        const sourceEl = matchRefs.current[matchId];
        const targetEl = matchRefs.current[nextMatchId];

        if (!sourceEl || !targetEl) continue;

        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        // Source: right-center of the match card
        const startX = sourceRect.right - containerRect.left;
        const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top;

        // Target: left-center of the next match card
        const endX = targetRect.left - containerRect.left;
        const endY = targetRect.top + targetRect.height / 2 - containerRect.top;

        const isFinished = status === "Finished";

        lines.push({
          id: `${matchId}-${nextMatchId}`,
          startX,
          startY,
          endX,
          endY,
          isFinished,
        });
      }

      setConnectors(lines);
    };

    // Small delay to let layout settle
    const timer = setTimeout(calculateConnectors, 100);

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(calculateConnectors, 50);
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [rounds, filteredRounds, visibleMatchIds]);

  return (
    <div className="overflow-x-auto p-4 bg-slate-50 rounded-xl border border-slate-200 custom-scrollbar">
      <div ref={containerRef} className="flex gap-12 min-w-max pb-8 relative">
        {/* SVG connector lines layer */}
        {connectors.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "100%", height: "100%", overflow: "visible", zIndex: 1 }}
          >
            {connectors.map(({ id, startX, startY, endX, endY, isFinished }) => {
              const midX = (startX + endX) / 2;
              const color = isFinished ? CONNECTOR_COLOR_FINISHED : CONNECTOR_COLOR;

              return (
                <g key={id}>
                  {/* Horizontal line from source to midpoint */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={midX}
                    y2={startY}
                    stroke={color}
                    strokeWidth={CONNECTOR_WIDTH}
                    strokeLinecap="round"
                  />
                  {/* Vertical line at midpoint */}
                  <line
                    x1={midX}
                    y1={startY}
                    x2={midX}
                    y2={endY}
                    stroke={color}
                    strokeWidth={CONNECTOR_WIDTH}
                    strokeLinecap="round"
                  />
                  {/* Horizontal line from midpoint to target */}
                  <line
                    x1={midX}
                    y1={endY}
                    x2={endX}
                    y2={endY}
                    stroke={color}
                    strokeWidth={CONNECTOR_WIDTH}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Round columns — only rounds with non-BYE matches */}
        {filteredRounds.map((round) => (
          <div key={round._id} className="flex flex-col gap-6 w-56 relative z-10 shrink-0">
            <h3 className="font-bold text-center text-slate-700 bg-white border border-slate-200 py-2 rounded-lg shadow-sm">
              {round.display_name || round.name || `Vòng ${round.round_number}`}
            </h3>
            <div className="flex flex-col gap-8 flex-1 justify-around">
              {(round.matches || []).map((match) => (
                <MatchNode
                  key={match._id}
                  match={match}
                  currentUserId={currentUserId}
                  ref={(el) => setMatchRef(match._id, el)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Section = ({ title, rounds, currentUserId }) => {
  if (!rounds.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">{title}</h3>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <RoundColumns rounds={rounds} currentUserId={currentUserId} />
    </div>
  );
};

export const TournamentBracket = ({ tournamentId, format }) => {
  const { user } = useContext(AuthContext);
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
    return <RoundColumns rounds={bracketData} currentUserId={user?.id} />;
  }

  if (format === "Double Elimination") {
    const winnersRounds = bracketData.filter((round) => round.bracket_side === "Winners");
    const losersRounds = bracketData.filter((round) => round.bracket_side === "Losers");
    const grandFinalRounds = bracketData.filter((round) => round.bracket_side === "GrandFinal");

    return (
      <div className="space-y-8">
        <Section title="Nhánh thắng" rounds={winnersRounds} currentUserId={user?.id} />
        <Section title="Nhánh thua" rounds={losersRounds} currentUserId={user?.id} />
        <Section title="Chung kết" rounds={grandFinalRounds} currentUserId={user?.id} />
      </div>
    );
  }

  if (format === "Round Robin") {
    return (
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Trophy className="text-orange-500 w-5 h-5" /> Bảng xếp hạng
            </h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left rounded-lg">
                  <th className="py-3 px-3 rounded-l-lg">Hạng</th>
                  <th className="py-3 px-3">Tên cơ thủ</th>
                  <th className="py-3 px-3 text-center">Bảng</th>
                  <th className="py-3 px-3 text-center">Trận</th>
                  <th className="py-3 px-3 text-center">T - B</th>
                  <th className="py-3 px-4 text-center font-bold rounded-r-lg">Tổng điểm</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  leaderboard
                    .flat()
                    .sort((a, b) => a.rank - b.rank)
                    .map((player, idx) => {
                      const isMe = user?.id && (player.account_id === user.id || player._id === user.id);
                      return (
                      <tr
                        key={`${player.account_id || idx}-${player.group_key || "A"}`}
                        className={`border-b hover:bg-slate-50/50 transition-colors ${isMe ? "bg-orange-50/70 border-orange-100" : "border-slate-50"}`}
                      >
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {player.rank || idx + 1}
                        </td>
                        <td className={`py-3 px-3 font-bold flex items-center gap-1 ${isMe ? "text-orange-700" : "text-slate-900"}`}>
                          {player.name || player.fullname || "N/A"}
                          {isMe && <span className="text-[9px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full inline-block leading-none mt-0.5">BẠN</span>}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-blue-600">
                          {player.group_key || "A"}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600">{player.matches}</td>
                        <td className="py-3 px-3 text-center text-slate-600">
                          {player.wins} - {player.losses}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-orange-600 text-base">
                          {player.points}
                        </td>
                      </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm p-5 overflow-hidden flex flex-col max-h-[700px]">
          <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2 shrink-0">
            <Users className="text-blue-500 w-5 h-5" /> Danh sách trận đấu
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {bracketData.flatMap((round) => round.matches || []).map((match) => {
              const p1 = match.player1_id;
              const p2 = match.player2_id;
              const p1Winner =
                match.winner_id?._id === p1?._id || match.winner_id === p1?._id;
              const p2Winner = match.winner_id?._id === p2?._id || match.winner_id === p2?._id;
              
              const p1IsMe = user?.id && p1 && (p1._id === user.id || p1.account_id === user.id);
              const p2IsMe = user?.id && p2 && (p2._id === user.id || p2.account_id === user.id);
              const hasMe = p1IsMe || p2IsMe;

              return (
                <div
                  key={match._id}
                  className={`border rounded-xl p-4 bg-white shadow-sm flex flex-col gap-3 transition-colors ${
                    hasMe ? "border-orange-300 ring-1 ring-orange-200" : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span className={`px-2 py-1 rounded border ${hasMe ? "bg-orange-50 border-orange-200 text-orange-600 font-bold" : "bg-slate-100 border-slate-200"}`}>
                      {match.status}
                    </span>
                    <span>Chạm {match.race_to || 7}</span>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <div
                      className={`flex-1 p-3 rounded-lg text-sm text-center truncate relative ${
                        p1Winner
                          ? "bg-green-50 text-green-700 font-bold border border-green-200"
                          : p1IsMe
                          ? "bg-orange-50 text-orange-700 font-bold border border-orange-200"
                          : "bg-slate-50 border border-slate-100 font-medium text-slate-700"
                      }`}
                    >
                      {p1?.fullname || "TBD"}
                      {p1IsMe && <span className="absolute -top-2 right-2 text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">BẠN</span>}
                    </div>
                    <div className="font-black text-lg text-slate-800 tracking-widest shrink-0 w-20 text-center">
                      {match.player1_score} - {match.player2_score}
                    </div>
                    <div
                      className={`flex-1 p-3 rounded-lg text-sm text-center truncate relative ${
                        p2Winner
                          ? "bg-green-50 text-green-700 font-bold border border-green-200"
                          : p2IsMe
                          ? "bg-orange-50 text-orange-700 font-bold border border-orange-200"
                          : "bg-slate-50 border border-slate-100 font-medium text-slate-700"
                      }`}
                    >
                      {p2?.fullname || "TBD"}
                      {p2IsMe && <span className="absolute -top-2 left-2 text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">BẠN</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
