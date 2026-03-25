import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, CreditCard, ListChecks, Loader2 } from "lucide-react";
import bookingService, {
  createPayOSBookingCheckoutPayment,
  getBookingById,
  getBookingServices,
  verifyBookingCheckoutPayOSPayment
} from "@/services/booking.service";

const timeToMinutes = (t = "00:00") => {
  const [h, m] = (t || "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const computeInvoice = (booking, services = []) => {
  if (!booking) {
    return { playCost: 0, serviceTotal: 0, totalBill: 0, deposit: 0, dueAmount: 0 };
  }

  const startMin = timeToMinutes(booking.start_time);
  let endMin = timeToMinutes(booking.end_time);
  if (endMin <= startMin) endMin += 24 * 60;

  const durationHours = (endMin - startMin) / 60;
  const playCost = Math.round(durationHours * (booking.hour_price || 0));

  const serviceTotal = services.reduce(
    (sum, s) => sum + (s.unit_price || 0) * (s.quantity || 0),
    0
  );

  const totalBill = playCost + serviceTotal;
  const deposit = Number(booking.deposit || 0);
  const dueAmount = Math.max(0, totalBill - deposit);

  return { playCost, serviceTotal, totalBill, deposit, dueAmount };
};

export default function BookingCheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [services, setServices] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [payment, setPayment] = useState(null);

  const invoice = useMemo(() => computeInvoice(booking, services), [booking, services]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);

        const bRes = await getBookingById(id);
        if (bRes?.success) setBooking(bRes.data);

        const sRes = await getBookingServices(id);
        if (sRes?.success) setServices(sRes.data || []);
      } catch (e) {
        toast.error(e?.response?.data?.message || e.message || "Lỗi tải hóa đơn");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    const verify = async () => {
      if (!orderCode) return;
      try {
        setProcessing(true);
        const res = await verifyBookingCheckoutPayOSPayment(orderCode);
        if (res?.success) {
          toast.success("Thanh toán thành công. Bàn đã hoàn thành.");
          navigate("/staff/tables", { replace: true });
        } else {
          toast.error(res?.message || "Thanh toán chưa hoàn tất");
        }
      } catch (e) {
        toast.error(e?.response?.data?.message || e.message || "Xác thực thanh toán thất bại");
      } finally {
        setProcessing(false);
      }
    };
    verify();
  }, [orderCode, navigate]);

  const handleCash = async () => {
    try {
      setProcessing(true);
      const res = await bookingService.checkOutBooking(id);
      if (res?.success) {
        toast.success("Thanh toán tiền mặt thành công.");
        navigate("/staff/tables", { replace: true });
      } else {
        toast.error(res?.message || "Thanh toán tiền mặt thất bại");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Lỗi thanh toán tiền mặt");
    } finally {
      setProcessing(false);
    }
  };

  const handleTransferCreate = async () => {
    try {
      setProcessing(true);
      const res = await createPayOSBookingCheckoutPayment(id);
      if (!res?.success) throw new Error(res?.message || "Không tạo được PayOS");

      if (!res?.data?.checkoutUrl) {
        toast.success(res?.message || "Hoàn tất (0đ còn lại).");
        navigate("/staff/tables", { replace: true });
        return;
      }

      setPayment(res.data);
      toast.success("Đã tạo mã PayOS, hãy thanh toán tại QR/Checkout.");
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Không thể tạo PayOS");
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-slate-600">Không tìm thấy booking.</p>
        <button onClick={() => navigate("/staff/tables")} className="text-orange-500 hover:underline font-bold">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/staff/tables")}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <ListChecks size={22} className="text-orange-500" /> Hóa đơn kết thúc
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Mã booking: <span className="font-mono">{booking.code_number}</span>
            </p>
          </div>

          {/* Summary */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tiền bàn</span>
              <span className="font-bold text-slate-900">
                {invoice.playCost.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tiền dịch vụ</span>
              <span className="font-bold text-slate-900">
                {invoice.serviceTotal.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tiền cọc</span>
              <span className="font-bold text-slate-900">
                {invoice.deposit.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
            <div className="flex justify-between text-sm font-black pt-1 border-t border-orange-200">
              <span className="text-slate-800">Tiền phải trả</span>
              <span className="text-orange-700 text-xl font-extrabold">
                {invoice.dueAmount.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>

          {/* Services detail */}
          <div>
            <h2 className="font-bold text-slate-800 mb-3">Các dịch vụ đã gọi</h2>
            {services.length === 0 ? (
              <p className="text-slate-500 text-sm">Chưa có dịch vụ.</p>
            ) : (
              <div className="space-y-2">
                {services.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {s.service_id?.name || "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.quantity} x {Number(s.unit_price || 0).toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                    <div className="text-right font-black text-slate-900">
                      {(Number(s.unit_price || 0) * Number(s.quantity || 0)).toLocaleString("vi-VN")} VNĐ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleCash}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} /> Tiền mặt
            </button>
            <button
              onClick={handleTransferCreate}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold flex items-center justify-center gap-2"
            >
              <CreditCard size={18} /> Chuyển khoản
            </button>
          </div>

          {/* Payment info */}
          {payment?.orderCode && (
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
              <h3 className="font-bold text-slate-800 mb-2">Mã PayOS</h3>
              <p className="text-sm text-slate-700">
                `orderCode`: <span className="font-mono font-bold">{payment.orderCode}</span>
              </p>
              {payment.qrCode && (
                <div className="mt-3">
                  <img
                    src={payment.qrCode}
                    alt="QR PayOS"
                    className="w-44 h-44 object-contain bg-white rounded-lg border border-slate-200 mx-auto"
                  />
                </div>
              )}
              {payment.checkoutUrl && (
                <div className="mt-4 flex justify-center">
                  <a
                    href={payment.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-lg border border-slate-200"
                  >
                    Mở PayOS để thanh toán
                  </a>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500">
            Sau khi thanh toán, hệ thống sẽ tự chuyển booking sang trạng thái <b>Completed</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

