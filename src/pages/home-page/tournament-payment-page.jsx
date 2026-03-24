import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  createPayOSTournamentPayment,
  getTournamentById,
  verifyTournamentPayOSPayment
} from "@/services/tournament.service";

export const TournamentPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [tournament, setTournament] = useState(null);

  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");
  const canceled = useMemo(() => status === "CANCELLED" || status === "CANCELED", [status]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    const loadTournament = async () => {
      try {
        const res = await getTournamentById(id);
        if (!res.success) throw new Error(res.message || "Không tìm thấy giải đấu");
        setTournament(res.data);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || "Lỗi tải dữ liệu giải đấu");
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [id, navigate]);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderCode) return;
      if (canceled) {
        toast.error("Bạn đã hủy thanh toán.");
        return;
      }

      try {
        setProcessing(true);
        const res = await verifyTournamentPayOSPayment(Number(orderCode));
        if (res.success) {
          toast.success("Thanh toán thành công, bạn đã được duyệt vào giải đấu!");
          navigate(`/tournament/${id}`, { replace: true });
          return;
        }
        toast.error(res.message || "Chưa xác nhận được thanh toán");
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message || "Lỗi xác thực thanh toán");
      } finally {
        setProcessing(false);
      }
    };

    verifyPayment();
  }, [orderCode, canceled, id, navigate]);

  const handleCreatePayment = async () => {
    try {
      setProcessing(true);
      const res = await createPayOSTournamentPayment(id);
      if (!res.success) throw new Error(res.message || "Không thể tạo mã PayOS");

      if (res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

      toast.success(res.message || "Đăng ký giải đấu thành công");
      navigate(`/tournament/${id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Không thể tạo thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-600">Không tìm thấy thông tin giải đấu.</p>
        <button onClick={() => navigate("/tournament")} className="text-orange-500 hover:underline">
          Quay lại danh sách giải đấu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(`/tournament/${id}`)}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6"
        >
          <ArrowLeft size={18} /> Quay lại chi tiết giải đấu
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
          <h1 className="text-2xl font-extrabold text-slate-800">Thanh toán đăng ký giải đấu</h1>
          <p className="text-gray-600">{tournament.name}</p>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">Lệ phí cần thanh toán</p>
            <p className="text-3xl font-black text-orange-600">
              {Number(tournament.fee || 0).toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          <button
            onClick={handleCreatePayment}
            disabled={processing}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold"
          >
            {processing ? "Đang xử lý..." : "Thanh toán với PayOS"}
          </button>
        </div>
      </div>
    </div>
  );
};

