import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight, X, Star, AlertCircle, CheckCircle2, Loader2, CalendarClock, MessageSquare } from "lucide-react";
import { getMyBookings, verifyBookingPayOSPayment, cancelHold } from "@/services/booking.service";
import { createFeedback, getFeedbackByBookingId, updateFeedback } from "@/services/feedback.service";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";


const STATUS_CONFIG = {
  Pending: { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Booked: { label: "Đã đặt", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Playing: { label: "Đang chơi", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  Completed: { label: "Hoàn thành", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-500" },
};


const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "Pending", label: "Chờ thanh toán" },
  { key: "Booked", label: "Đã đặt" },
  { key: "Cancelled", label: "Đã hủy" },
  { key: "Completed", label: "Hoàn thành" },
];


export const BookingHistoryPage = () => {
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);


  useEffect(() => {
    if (!user) {
      toast("Vui lòng đăng nhập để xem lịch sử đặt bàn", { icon: "🔒" });
      navigate("/auth/login");
      return;
    }
    fetchBookings();
  }, [user, navigate]);


  // Allow navigating with predefined active tab (e.g., from payment page)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      setCurrentPage(1);
    }
  }, [location.state]);


  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      if (res.success) setBookings(res.data);
    } catch {
      toast.error("Không thể tải lịch sử đặt bàn");
    } finally {
      setLoading(false);
    }
  };


  // Auto-refresh khi có Pending bookings (để cập nhật countdown + auto-cancel)
  useEffect(() => {
    const hasPending = bookings.some(b => b.status === "Pending" && b.held_until);
    if (!hasPending) return;


    const interval = setInterval(() => {
      // Kiểm tra nếu có booking nào vừa hết hạn → refresh
      const expired = bookings.some(b =>
        b.status === "Pending" && b.held_until && new Date(b.held_until) <= new Date()
      );
      if (expired) fetchBookings();
    }, 5000);


    return () => clearInterval(interval);
  }, [bookings]);


  const filtered = activeTab === "all" ? bookings : bookings.filter(b => b.status === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedBookings = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const tabCounts = TABS.map(t => ({
    ...t,
    count: t.key === "all" ? bookings.length : bookings.filter(b => b.status === t.key).length
  }));


  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);


  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  const handleCardClick = (booking) => {
    if (booking.status === "Pending") {
      // Redirect to payment page with booking data
      // Tính số phút còn lại từ held_until
      const remainingMs = booking.held_until ? new Date(booking.held_until).getTime() - Date.now() : 0;
      const remainingMins = Math.max(0, Math.ceil(remainingMs / 60000));


      navigate(`/payment/${booking._id}`, {
        state: {
          booking: {
            ...booking,
            depositPercent: 30,
            totalBill: booking.total_bill,
            deposit: booking.deposit
          },
          table: booking.table_info,
          club: booking.club,
          holdMinutes: remainingMins,
          heldUntil: booking.held_until
        }
      });
    } else {
      setSelectedBooking(booking);
    }
  };


  // Khi quay lại từ PayOS (returnUrl có orderCode) -> verify và chuyển Booked
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderCode = params.get("orderCode");
    if (!orderCode) return;


    // Xóa orderCode khỏi URL ngay để tránh lặp lại thông báo khi F5 hoặc quay lại trang
    navigate(location.pathname, { replace: true });


    const verify = async () => {
      try {
        const res = await verifyBookingPayOSPayment(orderCode);
        if (res.success) {
          toast.success("Thanh toán tiền cọc thành công!");
          fetchBookings();
          setActiveTab("Booked");
        } else {
          toast.error(res.message || "Xác thực thanh toán thất bại");
        }
      } catch {
        toast.error("Xác thực thanh toán thất bại");
      }
    };


    verify();
  }, [location.pathname, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="container mx-auto px-6 py-8">


        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Lịch sử đặt bàn</h1>
            <p className="text-slate-500 mt-1">Quản lý và xem lại tất cả các hoạt động đặt bàn bida của bạn.</p>
          </div>
        </div>


        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
          {tabCounts.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${activeTab === tab.key
                ? "bg-green-500 text-white border-green-500 shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${activeTab === tab.key
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-500"
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>


        {/* Booking Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border">
              <CalendarClock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-slate-500 font-medium">Chưa có đơn đặt bàn nào</p>
              <button onClick={() => navigate("/booking")} className="mt-4 text-green-600 font-bold hover:underline">
                Đặt bàn ngay →
              </button>
            </div>
          ) : paginatedBookings.map(booking => {
            const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;
            return (
              <div
                key={booking._id}
                onClick={() => handleCardClick(booking)}
                className="bg-white rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Club Avatar */}
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border">
                  {booking.club?.avatar ? (
                    <img src={booking.club.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-lg">
                      {booking.club?.name?.charAt(0) || "B"}
                    </div>
                  )}
                </div>


                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 truncate">{booking.club?.name || "CLB Billiard"}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sc.color}`}>
                      {sc.label}
                    </span>
                    {booking.status === "Completed" && booking.feedback_status && (
                      booking.feedback_status.rated ? (
                        <>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {booking.feedback_status.rating} sao
                          </span>
                          {booking.feedback_status.has_reply && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                              <MessageSquare className="w-2.5 h-2.5" /> Quán đã phản hồi
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> Chưa đánh giá
                        </span>
                      )
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {booking.start_time} - {booking.end_time}, {booking.play_date ? new Date(booking.play_date).toLocaleDateString("vi-VN") : "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      🎱 Bàn {booking.table_info?.table_number || "—"} ({booking.table_info?.table_type || "Pool"})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {booking.club?.address || "—"}
                    </span>
                  </div>
                </div>


                {/* Price + Action */}
                <div className="flex items-center gap-4 flex-shrink-0 sm:flex-col sm:items-end sm:gap-1">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Tổng tiền</p>
                    <p className="text-lg font-black text-green-600">{(booking.total_bill || 0).toLocaleString()}đ</p>
                    <p className="text-[11px] text-amber-600 font-semibold">
                      Cọc: {(booking.deposit || 0).toLocaleString()}đ
                    </p>
                  </div>
                  {booking.status === "Pending" && booking.held_until && (
                    <HoldCountdown heldUntil={booking.held_until} />
                  )}
                  {booking.status === "Pending" && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                      Thanh toán →
                    </span>
                  )}
                  {(booking.status === "Booked" || booking.status === "Completed" || booking.status === "Cancelled") && (
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      Chi tiết <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>


        {filtered.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-500">
              Trang <span className="font-bold text-slate-900">{currentPage}</span> / {totalPages}
            </p>


            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Truoc
              </button>


              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Sau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRefresh={fetchBookings}
        />
      )}
    </div>
  );
};


// ===== HOLD COUNTDOWN COMPONENT =====
const HoldCountdown = ({ heldUntil }) => {
  const [timeLeft, setTimeLeft] = useState(0);


  useEffect(() => {
    const target = new Date(heldUntil).getTime();


    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(remaining);
    };


    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [heldUntil]);


  if (timeLeft <= 0) {
    return (
      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">
        Hết hạn
      </span>
    );
  }


  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const display = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  const isWarning = timeLeft <= 60;


  return (
    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border flex items-center gap-1 tabular-nums ${isWarning
      ? "text-red-600 bg-red-50 border-red-200 animate-pulse"
      : "text-amber-600 bg-amber-50 border-amber-200"
      }`}>
      <Clock className="w-3 h-3" /> {display}
    </span>
  );
};


// ===== DETAIL MODAL =====
const BookingDetailModal = ({ booking, onClose, onRefresh }) => {
  const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.Pending;
  const [cancelling, setCancelling] = useState(false);
 
  // Feedback States
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);


  useEffect(() => {
    if (booking.status === "Completed") {
      fetchFeedback();
    }
  }, [booking]);


  const fetchFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const res = await getFeedbackByBookingId(booking._id);
      if (res.success && res.data) {
        setFeedback(res.data);
      }
    } catch (err) {
      console.error("Lỗi tải đánh giá", err);
    } finally {
      setLoadingFeedback(false);
    }
  };


  const handleCancelBooking = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt bàn này không? Bàn sẽ được giải phóng ngay lập tức.")) {
      return;
    }


    try {
      setCancelling(true);
      const res = await cancelHold(booking._id);
      if (res.success) {
        toast.success("Đã hủy đơn thành công");
        onRefresh && onRefresh();
        onClose();
      } else {
        toast.error(res.message || "Không thể hủy đơn");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối máy chủ");
    } finally {
      setCancelling(false);
    }
  };


  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    try {
      setSubmittingFeedback(true);
     
      let res;
      if (isEditingFeedback && feedback?._id) {
        res = await updateFeedback(feedback._id, { rating, comment });
      } else {
        res = await createFeedback({
           booking_id: booking._id,
           rating,
           comment
        });
      }


      if (res.success) {
        toast.success(isEditingFeedback ? "Cập nhật đánh giá thành công!" : "Cảm ơn bạn đã đánh giá!");
        setFeedback(res.data);
        setIsEditingFeedback(false);
      } else {
        toast.error(res.message || "Lỗi khi gửi đánh giá");
      }
    } catch (error) {
      toast.error(error?.message || "Lỗi kết nối");
    } finally {
       setSubmittingFeedback(false);
    }
  };


  // Logic to determine if feedback is editable
  const canEditFeedback = () => {
    if (!feedback) return false;
    if (feedback.is_edited) return false;
    const createdAt = new Date(feedback.created_at).getTime();
    const now = Date.now();
    const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  };


  const handleStartEdit = () => {
    setRating(feedback.rating);
    setComment(feedback.comment || "");
    setIsEditingFeedback(true);
  };


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>


        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="font-bold text-slate-900 text-lg">Chi tiết đặt bàn</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>


        <div className="p-6 space-y-6">


          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${sc.color}`}>
              ● {sc.label}
            </span>
          </div>


          {/* Cancelled Banner */}
          {booking.status === "Cancelled" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-800 text-sm">Đặt bàn đã bị hủy</p>
                  <p className="text-xs text-red-600 mt-1">
                    Mã đặt: #{booking.code_number}
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Completed Banner */}
          {booking.status === "Completed" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-sm">Buổi chơi đã hoàn thành</p>
                  <p className="text-xs text-green-600 mt-1">
                    Mã đặt: #{booking.code_number}
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* Club Info */}
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border">
            <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border flex-shrink-0">
              {booking.club?.avatar ? (
                <img src={booking.club.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                  {booking.club?.name?.charAt(0) || "B"}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-slate-900">{booking.club?.name || "CLB Billiard"}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {booking.club?.address || "—"}
              </p>
            </div>
          </div>


          {/* Booking code */}
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase font-bold">Mã đặt bàn</p>
            <p className="text-lg font-black text-slate-900 tracking-wider mt-1">#{booking.code_number}</p>
          </div>


          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">📅 Ngày</p>
              <p className="font-bold text-sm text-slate-900">
                {booking.play_date ? new Date(booking.play_date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" }) : "—"}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">🕐 Giờ nhận</p>
              <p className="font-bold text-sm text-slate-900">{booking.start_time} - {booking.end_time}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">🎱 Số bàn</p>
              <p className="font-bold text-sm text-slate-900">Bàn {booking.table_info?.table_number || "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">🏷️ Loại bàn</p>
              <p className="font-bold text-sm text-slate-900">Bàn {booking.table_info?.table_type || "Pool"}</p>
            </div>
          </div>


          {/* Price Summary */}
          <div className="border-t pt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền bàn ({booking.hour_price?.toLocaleString()}đ/giờ)</span>
              <span className="font-medium text-slate-900">{(booking.total_bill || 0).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền cọc đã thanh toán</span>
              <span className="font-medium text-slate-900">{(booking.deposit || 0).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-dashed">
              <span className="text-slate-700">Tổng cộng</span>
              <span className="text-xl text-emerald-600">{(booking.total_bill || 0).toLocaleString()}đ</span>
            </div>
          </div>


          {/* Feedback Section (Only for Completed) */}
          {booking.status === "Completed" && (
            <div className="border-t pt-5">
               {loadingFeedback ? (
                 <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400"/></div>
               ) : feedback && !isEditingFeedback ? (
                 <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-amber-900 text-sm">Đánh giá của bạn</h4>
                       <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={16} fill={star <= feedback.rating ? "currentColor" : "none"} className={star <= feedback.rating ? "" : "text-amber-200"} />
                          ))}
                       </div>
                    </div>
                    {feedback.comment && <p className="text-amber-800 text-sm italic">"{feedback.comment}"</p>}
                   
                    {canEditFeedback() && (
                      <button
                        onClick={handleStartEdit}
                        className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                      >
                         Sửa đánh giá
                      </button>
                    )}


                    {feedback.reply_content && (
                       <div className="mt-4 pt-4 border-t border-amber-200 text-sm">
                          <p className="font-bold text-slate-700 text-xs mb-1">Phản hồi từ Quán:</p>
                          <p className="text-slate-600">"{feedback.reply_content}"</p>
                       </div>
                    )}
                 </div>
               ) : (
                 <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {isEditingFeedback ? "Sửa đánh giá của bạn" : "⭐ Đánh giá trải nghiệm của bạn"}
                      </h4>
                      {isEditingFeedback && (
                        <button
                          onClick={() => setIsEditingFeedback(false)}
                          className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                   
                    {isEditingFeedback && (
                      <div className="mb-4 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs border border-blue-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Bạn chỉ được phép chỉnh sửa đánh giá <b>1 lần duy nhất</b> trong vòng 3 ngày kể từ khi tạo.</p>
                      </div>
                    )}


                    <div className="flex gap-1 mb-4">
                       {[1,2,3,4,5].map(star => (
                         <button
                           key={star}
                           onMouseEnter={() => setHoverRating(star)}
                           onMouseLeave={() => setHoverRating(0)}
                           onClick={() => setRating(star)}
                           className="focus:outline-none transition-transform hover:scale-110"
                         >
                           <Star size={24} fill={(hoverRating || rating) >= star ? "#fbbf24" : "none"} className={(hoverRating || rating) >= star ? "text-amber-400" : "text-slate-300"} />
                         </button>
                       ))}
                    </div>
                    <textarea
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}
                       placeholder="Để lại vài lời chia sẻ ủng hộ quán nhé (không bắt buộc)..."
                       className="w-full text-sm border-slate-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                    />
                    <button
                       onClick={handleSubmitFeedback}
                       disabled={submittingFeedback}
                       className={`mt-3 w-full py-2.5 font-bold rounded-lg text-sm transition-colors flex justify-center items-center gap-2 ${
                         isEditingFeedback
                           ? "bg-emerald-600 text-white hover:bg-emerald-700"
                           : "bg-slate-900 text-white hover:bg-slate-800"
                       }`}
                    >
                       {submittingFeedback ? <Loader2 className="w-4 h-4 animate-spin"/> : (isEditingFeedback ? "Cập Nhật Đánh Giá" : "Gửi Đánh Giá")}
                    </button>
                 </div>
               )}
            </div>
          )}


          {/* Actions */}
          {(booking.status === "Pending" || booking.status === "Booked") && (
            <div className="pt-4">
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full py-4 bg-white border-2 border-rose-100 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Hủy đơn đặt bàn này</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



