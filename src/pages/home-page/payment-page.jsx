import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useBlocker } from "react-router-dom";
import { ChevronLeft, QrCode, Shield, Clock, MapPin, Star, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { clubService } from "@/services/club.service";
import { markPaymentPending } from "@/services/booking.service";

export const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const allowNavRef = useRef(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankInfo, setBankInfo] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Chặn mọi điều hướng trong React Router (back, navbar, link...)
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (allowNavRef.current) return false; // Cho phép điều hướng sau khi xác nhận
    return currentLocation.pathname !== nextLocation.pathname;
  });

  // Khi blocker chặn điều hướng → hiện dialog
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowLeaveDialog(true);
    }
  }, [blocker.state]);

  // Tính thời gian giữ chỗ còn lại
  useEffect(() => {
    if (!bookingData?.heldUntil) return;
    const holdMinutes = 5;
    // const heldUntil = new Date(bookingData.heldUntil).getTime();
    const heldUntil = new Date(Date.now() + holdMinutes * 60 * 1000);
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((heldUntil - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        toast.error("Hết thời gian giữ chỗ. Bàn đã được trả về.");
        allowNavRef.current = true;
        navigate("/booking");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [bookingData?.heldUntil, navigate]);

  // Chặn beforeunload (đóng tab/reload)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Xử lý nút quay lại
  const handleBack = useCallback(() => {
    setShowLeaveDialog(true);
  }, []);

  // Xác nhận rời trang → giữ Pending, KHÔNG hủy booking
  const confirmLeave = () => {
    // Tính thời gian còn lại (phút)
    const remainMins = Math.ceil(timeLeft / 60);
    toast(`Bàn đã được giữ chỗ trong ${remainMins} phút`, { icon: "⏱️" });
    setShowLeaveDialog(false);
    allowNavRef.current = true;

    if (blocker.state === "blocked") {
      blocker.proceed();
    } else {
      navigate(-1);
    }
  };

  // Hủy dialog → ở lại trang
  const cancelLeave = () => {
    setShowLeaveDialog(false);
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  // Fallback nếu không có dữ liệu
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Không có thông tin đặt bàn</p>
        <button onClick={() => navigate("/booking")} className="text-emerald-600 font-bold hover:underline">
          ← Quay lại danh sách CLB
        </button>
      </div>
    );
  }

  const { booking, table, club, holdMinutes } = bookingData;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const isTimerWarning = timeLeft <= 120;

  const description = `Dat ban ${booking?.start_time}-${booking?.end_time} ${new Date(
    booking?.play_date
  ).toLocaleDateString("vi-VN")} ${booking?.account_name || ""} ${booking?.phone || ""}`;

  const qrUrl =
    bankInfo &&
    `https://img.vietqr.io/image/${bankInfo.bank_name}-${bankInfo.account_number}-compact.png?amount=${booking?.deposit}&addInfo=${encodeURIComponent(
      description
    )}&accountName=${encodeURIComponent(bankInfo.account_name)}`;

  useEffect(() => {
    const fetchBankInfo = async () => {
      if (!club?._id) return;
      try {
        setBankLoading(true);
        const res = await clubService.getClubBank(club._id);
        if (res?.success) {
          setBankInfo(res.data);
        }
      } catch (error) {
        console.error("Không lấy được thông tin ngân hàng CLB:", error);
        toast.error("Không lấy được thông tin ngân hàng của quán");
      } finally {
        setBankLoading(false);
      }
    };

    fetchBankInfo();
  }, [club?._id]);

  const handleConfirmPayment = () => {
    if (!agreedToTerms) {
      toast.error("Vui lòng đồng ý với điều khoản đặt bàn");
      return;
    }

    if (!bankInfo) {
      toast.error("Quán chưa thiết lập thông tin ngân hàng, vui lòng liên hệ chủ quán");
      return;
    }

    setShowBankModal(true);
  };

  const handleConfirmBankPaid = async () => {
    try {
      setUpdatingStatus(true);
      await markPaymentPending(booking?._id);
      toast.success("Đã xác nhận, đơn đang chờ quán xác nhận thanh toán");
      allowNavRef.current = true;
      navigate("/my-bookings", { state: { activeTab: "Payment Pending" } });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái booking:", error);
      toast.error(error.response?.data?.message || "Không cập nhật được trạng thái đặt bàn");
    } finally {
      setUpdatingStatus(false);
      setShowBankModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex-1" />
          {/* Countdown Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${isTimerWarning
            ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
            <Clock className="w-4 h-4" />
            <span>THỜI GIAN GIỮ CHỖ</span>
            <span className="text-lg font-black tabular-nums">{timerDisplay}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Thanh toán tiền cọc</h1>
          <p className="text-slate-500 mt-1">Hoàn tất đặt cọc để giữ chỗ cho buổi chơi của bạn.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT: Payment Method */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500" />
                Phương thức thanh toán
              </h2>

              {/* QR Transfer - only option */}
              <div className="border-2 border-emerald-500 bg-emerald-50/50 rounded-xl p-5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Chuyển khoản QR (VietQR)</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Quét mã QR qua ứng dụng ngân hàng bất kỳ.</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-lg px-3 py-2 border shadow-sm">
                    <QrCode className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  Tôi đồng ý với{" "}
                  <span className="text-emerald-600 font-semibold underline decoration-dotted">
                    điều khoản đặt bàn
                  </span>{" "}
                  và{" "}
                  <span className="text-emerald-600 font-semibold underline decoration-dotted">
                    chính sách hoàn tiền
                  </span>{" "}
                  của BilliardMaster.
                </span>
              </label>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmPayment}
              disabled={!agreedToTerms}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.3)] disabled:shadow-none transition-all active:scale-[0.99] flex items-center justify-center gap-3"
            >
              <Lock className="w-5 h-5" />
              Xác nhận thanh toán
            </button>
            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Thanh toán an toàn & bảo mật
            </p>
          </div>

          {/* RIGHT: Booking Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg text-slate-900 mb-5">Tóm tắt đơn đặt</h2>

              {/* Club Info */}
              <div className="flex items-start gap-3 pb-5 border-b">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black text-lg flex-shrink-0">
                  {club?.name?.charAt(0) || "B"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{club?.name || "CLB Billiard"}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {club?.address || "Hà Nội"}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="py-5 space-y-3 border-b">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ngày đặt</p>
                    <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      📅 {booking?.play_date ? new Date(booking.play_date).toLocaleDateString("vi-VN") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Giờ chơi</p>
                    <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      🕐 {booking?.start_time} - {booking?.end_time}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Loại bàn</p>
                    <p className="font-bold text-sm text-slate-900">🎱 Bàn {table?.table_type || "Pool"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Vị trí</p>
                    <p className="font-bold text-sm text-slate-900">Bàn số {table?.table_number || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-5 space-y-3 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phí thuê bàn</span>
                  <span className="font-medium text-slate-900">{booking?.totalBill?.toLocaleString() || 0}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phí dịch vụ</span>
                  <span className="font-medium text-slate-900">0đ</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-dashed">
                  <span className="text-slate-700">Tổng tiền dự kiến</span>
                  <span className="text-slate-900">{booking?.totalBill?.toLocaleString() || 0}đ</span>
                </div>
              </div>

              {/* Deposit */}
              <div className="pt-5">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">Tiền cọc cần thanh toán</span>
                    <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {booking?.depositPercent || 30}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Thanh toán ngay để giữ chỗ</p>
                  <p className="text-3xl font-black text-emerald-600">{booking?.deposit?.toLocaleString() || 0}đ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-16 py-6 text-center text-xs text-slate-400">
        © 2026 BilliardMaster System. All rights reserved.
      </div>
      {showBankModal && bankInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-center mb-4">Thông tin chuyển khoản</h3>

            <div className="flex justify-center mb-4">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="QR thanh toán"
                  className="w-64 h-64 border rounded-xl shadow"
                />
              )}
            </div>

            <div className="text-sm space-y-2 mb-4">
              <p>
                <b>Ngân hàng:</b> {bankInfo.bank_name}
              </p>
              <p>
                <b>Số tài khoản:</b> {bankInfo.account_number}
              </p>
              <p>
                <b>Chủ tài khoản:</b> {bankInfo.account_name}
              </p>
              <p>
                <b>Số tiền cọc:</b> {booking?.deposit?.toLocaleString()}đ
              </p>
              <p>
                <b>Nội dung CK:</b> {description}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Vui lòng chuyển khoản đúng nội dung và số tiền, sau đó bấm "Xác nhận đã thanh toán" để hệ thống ghi nhận yêu cầu.
              </p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowBankModal(false)}
                className="flex-1 py-3 bg-slate-100 rounded-lg font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmBankPaid}
                disabled={updatingStatus}
                className="flex-1 py-3 bg-emerald-500 rounded-lg font-semibold text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
              >
                {updatingStatus ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Leave Dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
              Tạm dừng thanh toán?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Bàn sẽ được <strong className="text-slate-900">giữ chỗ trong {Math.ceil(timeLeft / 60)} phút</strong>.
              Sau thời gian này, bàn sẽ được trả về cho người khác đặt.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLeave}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Tiếp tục thanh toán
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                Xác nhận dừng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
