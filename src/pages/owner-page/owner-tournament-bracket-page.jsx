import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournamentById } from "@/services/tournament.service";
import { TournamentBracket } from "@/components/TournamentBracket";
import { Trophy, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const OwnerTournamentBracketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        const res = await getTournamentById(id);
        if (res?.success) {
          setTournament(res.data);
        }
      } catch (err) {
        toast.error("Không tải được thông tin giải đấu");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[calc(100vh-80px)]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[calc(100vh-80px)] bg-slate-50/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-orange-500" /> Sơ đồ / Kết quả Giải Đấu
          </h1>
          <p className="text-slate-500 mt-1 pl-11 text-lg font-medium">{tournament.name}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all shadow-sm border border-slate-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px]">
         <TournamentBracket tournamentId={id} format={tournament.format} />
      </div>
    </div>
  );
};
