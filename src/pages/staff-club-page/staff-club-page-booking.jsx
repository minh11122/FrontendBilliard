import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "@/lib/axios";
import {
  Search, Calendar as CalendarIcon, MoreVertical, TrendingUp, Loader2,
  LogIn, List, User, Clock, CreditCard, MapPin, Hash, Phone, ArrowRight,
  CheckCircle, XCircle, PlusCircle, RefreshCw, ChevronLeft, ChevronRight,
  Eye, ShoppingCart, RotateCcw, ArrowLeftRight, Minus, Plus, Trash2, 
  CalendarDays, BadgeCheck, Circle, CheckCircle2, Info, Bell
} from "lucide-react";

import bookingService, { checkInBooking, getClubBookings, createWalkInBooking } from "@/services/booking.service";
import { getTables, updateTable } from "@/services/billiardTable.service";
import { getServices } from "@/services/service.service";
import useDebounce from "@/hooks/useDebounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helpers
const formatTime = (str) => str?.slice(0, 5) || "–";
const formatDate = (dateStr) => {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

const getWeekNumber = (d) => {
  let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23,59,59,999);
  return { start, end };
};

const getMonthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Helper format số bàn
const formatTableNumber = (tableNumber) => {
  if (!tableNumber) return "–";
  // Nếu là số thuần (có thể có số 0 ở đầu như "01", "12")
  if (/^\d+$/.test(tableNumber)) {
    return `Bàn ${parseInt(tableNumber, 10)}`;
  }
  // Nếu đã có định dạng khác (Bàn 1, P3, B1, ...)
  return tableNumber;
};

// Helper lấy ngày hiện tại dạng YYYY-MM-DD cho input date
const formatDateInput = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Helper lấy ngày hôm nay dạng YYYY-MM-DD
const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
};

// Helper lấy giờ hiện tại dạng HH:mm
const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

const timeToMinutes = (t = "00:00") => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

// ─── Shared Components ────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">{icon}{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);

const BookingDetailModal = ({ table, booking, allTables, onClose, onRefresh }) => {
  if (!booking) return null;
  const displayTable = table || booking.table_id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [bookingServices, setBookingServices] = useState([]);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [showExtendPanel, setShowExtendPanel] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(30);
  const [showChangeTablePanel, setShowChangeTablePanel] = useState(false);
  const [selectedNewTable, setSelectedNewTable] = useState("");

  useEffect(() => {
    if (booking) {
      fetchBookingServices();
      if (booking.status === "Playing") {
        fetchAllClubServices();
      }
    }
  }, [booking?._id, booking?.status]);

  const fetchBookingServices = async () => {
    try {
      const res = await bookingService.getBookingServices(booking._id);
      if (res.success) setBookingServices(res.data || []);
    } catch (e) {
      console.error("Lỗi fetch booking services:", e);
    }
  };

  const fetchAllClubServices = async () => {
    try {
      setFetchingServices(true);
      const res = await getServices({ page: 1, limit: 100, status: "Active" });
      if (res.data.success) setAllServices(res.data.data || []);
    } catch (e) {
      console.error("Lỗi fetch club services:", e);
    } finally {
      setFetchingServices(false);
    }
  };

  const handleAddService = async (serviceId) => {
    try {
      setLoading(true);
      await bookingService.addServiceToBooking(booking._id, serviceId, 1);
      toast.success("Đã thêm dịch vụ");
      await fetchBookingServices();
      if (onRefresh) await onRefresh();
    } catch (e) {
      toast.error("Không thể thêm dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceQuantity = async (bsId, currentQty, delta) => {
    try {
      const newQty = currentQty + delta;
      if (newQty < 1) return;
      setLoading(true);
      await bookingService.updateBookingServiceQuantity(booking._id, bsId, newQty);
      toast.success("Đã cập nhật số lượng");
      await fetchBookingServices();
      if (onRefresh) await onRefresh();
    } catch (e) {
      toast.error("Không thể cập nhật số lượng");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (bsId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá dịch vụ này?")) return;
    try {
      setLoading(true);
      await bookingService.deleteBookingService(booking._id, bsId);
      toast.success("Đã xoá dịch vụ");
      await fetchBookingServices();
      if (onRefresh) await onRefresh();
    } catch (e) {
      toast.error("Không thể xoá dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendBooking = async () => {
    try {
      setLoading(true);
      await bookingService.extendBooking(booking._id, extendMinutes);
      toast.success(`Đã gia hạn thêm ${extendMinutes} phút`);
      setShowExtendPanel(false);
      if (onRefresh) await onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể gia hạn");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTable = async () => {
    if (!selectedNewTable) return toast.error("Chọn bàn để chuyển đến");
    try {
      setLoading(true);
      await bookingService.changeTable(booking._id, selectedNewTable);
      toast.success("Chuyển bàn thành công");
      setShowChangeTablePanel(false);
      onClose();
      if (onRefresh) await onRefresh();
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể chuyển bàn");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    // Đồng bộ với luồng ở `staff-club-page-manager-table.jsx`:
    // điều hướng sang trang checkout để chọn PayOS/cash.
    if (!booking) return;
    onClose?.();
    navigate(`/staff/tables/checkout/${booking._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-extrabold text-gray-900 text-xl">Chi tiết đơn #{booking.code_number}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors"><XCircle size={20} className="text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><CalendarDays size={14} /> Thông tin đặt bàn</h3>
            <div className="rounded-xl border border-gray-200 p-4 space-y-4 bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User size={18} /></div>
                <div>
                  <h4 className="font-bold text-gray-800">{booking.guest_name || booking.account_id?.fullname || "Khách"}</h4>
                  <p className="text-xs text-gray-500">{booking.guest_name ? "Khách vãng lai" : (booking.account_id?.phone || "–")}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <InfoRow icon={<MapPin size={14} />} label="Bàn" value={<span className="font-bold text-[#4caf50]">{displayTable?.table_number ? `Bàn ${displayTable.table_number}` : "–"}</span>} />
                <InfoRow 
                  icon={<Clock size={14} />} 
                  label="Thời gian" 
                  value={
                    <div className="flex flex-col">
                      <span>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
                      {booking.actual_end_time && booking.status === "Completed" && (
                        <span className="text-[10px] text-blue-500 font-medium italic">
                          (Thực tế: {formatTime(booking.actual_end_time)})
                        </span>
                      )}
                      {timeToMinutes(booking.end_time) <= timeToMinutes(booking.start_time) && booking.end_time !== "00:00" && (
                        <span className="text-[10px] text-orange-500 font-bold italic">(+1 ngày)</span>
                      )}
                    </div>
                  } 
                />
                <InfoRow icon={<Circle size={14} />} label="Trạng thái" value={<span className="font-semibold">{booking.status}</span>} />
                <InfoRow 
                  icon={<BadgeCheck size={14} />} 
                  label={booking.note?.includes("TournamentMatch:") ? "Loại hình" : "Tổng tiền"} 
                  value={
                    booking.note?.includes("TournamentMatch:") ? (
                      <span className="font-bold text-blue-600 text-lg">Giải đấu</span>
                    ) : (
                      <span className="font-bold text-green-600 text-lg">
                        {booking.status === "Playing" 
                          ? (() => {
                              const startMin = timeToMinutes(booking.start_time);
                              let endMin = timeToMinutes(booking.end_time);
                              if (endMin <= startMin && endMin !== 0) endMin += 24 * 60;
                              const dur = Math.max(0, (endMin - startMin) / 60);
                              const playCost = dur * (booking.hour_price || 0);
                              const serviceTotal = bookingServices.reduce((sum, s) => sum + (s.unit_price * s.quantity), 0);
                              return Math.round(playCost + serviceTotal).toLocaleString("vi-VN");
                            })()
                          : (booking.total_bill || 0)?.toLocaleString("vi-VN")
                        }đ
                      </span>
                    )
                  } 
                />
              </div>

              {booking.note && (
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-1">
                  <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5"><Info size={12}/> Ghi chú / Lịch sử</span>
                  <p className="text-xs text-blue-600 font-medium bg-blue-50 p-2 rounded-lg italic">"{booking.note}"</p>
                </div>
              )}
            </div>

            {!booking.note?.includes("TournamentMatch:") && bookingServices.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-2">Dịch vụ ({bookingServices.length})</h4>
                <div className="space-y-2">
                  {bookingServices.map((bs, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-gray-50 shadow-sm font-sans">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-bold">{bs.service_id?.name}</span>
                        <span className="text-[10px] text-gray-500">{(bs.unit_price).toLocaleString("vi-VN")}đ</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {booking.status === "Playing" ? (
                          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                            <button onClick={() => handleUpdateServiceQuantity(bs._id, bs.quantity, -1)} disabled={loading || bs.quantity <= 1} className="p-1 rounded-md hover:bg-white text-gray-500 disabled:opacity-30"><Minus size={14}/></button>
                            <span className="w-6 text-center font-bold text-xs">{bs.quantity}</span>
                            <button onClick={() => handleUpdateServiceQuantity(bs._id, bs.quantity, 1)} disabled={loading} className="p-1 rounded-md hover:bg-white text-gray-500"><Plus size={14}/></button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">x{bs.quantity}</span>
                        )}
                        <div className="flex flex-col items-end min-w-[80px]">
                          <span className="text-gray-900 font-bold">{(bs.unit_price * bs.quantity).toLocaleString("vi-VN")}đ</span>
                          {booking.status === "Playing" && <button onClick={() => handleDeleteService(bs._id)} disabled={loading} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.status === "Playing" && (
              <div className="space-y-4">
                {!booking.note?.includes("TournamentMatch:") && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => { setShowOrderPanel(!showOrderPanel); setShowExtendPanel(false); setShowChangeTablePanel(false); }} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${showOrderPanel ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-gray-200 text-green-600 hover:bg-green-50'}`}><ShoppingCart size={24} /><span className="text-[11px] font-bold uppercase">ORDER</span></button>
                      <button onClick={() => { setShowExtendPanel(!showExtendPanel); setShowOrderPanel(false); setShowChangeTablePanel(false); }} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${showExtendPanel ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-gray-200 text-green-600 hover:bg-green-50'}`}><RotateCcw size={24} /><span className="text-[11px] font-bold uppercase">GIA HẠN</span></button>
                      <button onClick={() => { setShowChangeTablePanel(!showChangeTablePanel); setShowOrderPanel(false); setShowExtendPanel(false); }} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${showChangeTablePanel ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-gray-200 text-green-600 hover:bg-green-50'}`}><ArrowLeftRight size={24} /><span className="text-[11px] font-bold uppercase">ĐỔI BÀN</span></button>
                    </div>

                    {showExtendPanel && (
                      <div className="border border-green-100 rounded-xl p-4 bg-green-50/30 space-y-3">
                        <h4 className="font-bold text-green-800 text-sm">Gia hạn thêm thời gian</h4>
                        <div className="flex flex-wrap gap-2">
                          {[30, 60, 90, 120].map(mins => (
                            <button key={mins} onClick={() => setExtendMinutes(mins)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${extendMinutes === mins ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}>+{mins}p</button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input type="number" min="1" value={extendMinutes} onChange={(e) => setExtendMinutes(parseInt(e.target.value) || 0)} className="h-9 text-sm" />
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9 px-4 text-white font-bold" onClick={handleExtendBooking} disabled={loading || extendMinutes <= 0}>Lưu</Button>
                        </div>
                      </div>
                    )}

                    {showChangeTablePanel && (
                      <div className="border border-green-100 rounded-xl p-4 bg-green-50/30">
                        <h4 className="font-bold text-green-800 text-sm mb-3">Chọn bàn để chuyển đến</h4>
                        <div className="flex items-center gap-2">
                          <Select value={selectedNewTable} onValueChange={setSelectedNewTable}>
                            <SelectTrigger className="w-full bg-white h-9 border-gray-200 text-sm"><SelectValue placeholder="Bàn trống..." /></SelectTrigger>
                            <SelectContent>{allTables?.filter(t => t.status === "Available" || t.status === "available").map(t => <SelectItem key={t._id} value={t._id}>Bàn {t.table_number}</SelectItem>)}</SelectContent>
                          </Select>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-9 px-4 text-white font-bold shrink-0" onClick={handleChangeTable} disabled={loading || !selectedNewTable}>Xác nhận</Button>
                        </div>
                      </div>
                    )}

                    {showOrderPanel && (
                      <div className="border border-green-100 rounded-xl p-4 bg-green-50/30">
                        <div className="flex items-center justify-between mb-3"><h4 className="font-bold text-green-800 text-sm">Menu dịch vụ</h4>{fetchingServices && <RefreshCw size={14} className="animate-spin text-green-600"/>}</div>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                          {allServices.map(s => (
                            <div key={s._id} className="bg-white p-2 rounded-lg border border-gray-100 flex flex-col gap-1 shadow-sm">
                              <span className="text-xs font-bold text-gray-800 truncate">{s.name}</span>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-gray-500">{s.price?.toLocaleString()}đ</span>
                                <button onClick={() => handleAddService(s._id)} disabled={loading} className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-600 hover:text-white"><Plus size={14}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!booking.note?.includes("TournamentMatch:") ? (
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg rounded-xl" onClick={handleCheckout} disabled={loading}>
                    <CheckCircle2 size={18} className="mr-2" /> Thanh toán / Kết thúc
                  </Button>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <p className="text-sm font-bold text-blue-700">Trận đấu giải đang diễn ra</p>
                    <p className="text-[10px] text-blue-500">Kết quả sẽ được cập nhật tại trang Quản lý giải đấu</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// ─── Check-in Section ─────────────────────────────────────────
const CheckInSection = ({ onCheckInSuccess }) => {
  const [searchCode, setSearchCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [foundBooking, setFoundBooking] = useState(null);
  const [recentCheckIns, setRecentCheckIns] = useState([]);

  // Tìm kiếm booking bằng mã đặt bàn (code_number)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      toast.error("Vui lòng nhập mã đặt bàn");
      return;
    }
    setIsSearching(true);
    setFoundBooking(null);
    try {
      const res = await getClubBookings({ search: searchCode.trim(), status: "Booked" });
      if (res.success && res.data.length > 0) {
        const found = res.data.find(b => b.code_number === searchCode.trim() || b.code_number === searchCode.trim().replace(/^#/, ""));
        if (found) {
          setFoundBooking(found);
        } else {
          // Fallback: lấy kết quả đầu tiên nếu search match
          setFoundBooking(res.data[0]);
        }
      } else {
        toast.error("Không tìm thấy đơn đặt bàn nào ở trạng thái 'Đã đặt' với mã này");
      }
    } catch (error) {
      toast.error("Lỗi tìm kiếm. Thử lại sau.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!foundBooking) return;
    setIsCheckingIn(true);
    try {
      const res = await checkInBooking(foundBooking.code_number);
      if (res.success) {
        toast.success(res.message || "Check-in thành công!");
        // Add to recent check-ins
        setRecentCheckIns(prev => [
          {
            name: foundBooking.account_id?.fullname || "Khách",
            table: formatTableNumber(foundBooking.table_id?.table_number),
            time: new Date(),
          },
          ...prev.slice(0, 4),
        ]);
        setFoundBooking(null);
        setSearchCode("");
        onCheckInSuccess?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi check-in. Kiểm tra lại.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      Pending: "Chờ thanh toán",
      Booked: "Đã đặt",
      Playing: "Đang chơi",
      Completed: "Hoàn thành",
      Cancelled: "Đã hủy"
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    const map = {
      Pending: "bg-amber-100 text-amber-700",
      Booked: "bg-blue-100 text-blue-700",
      Playing: "bg-green-100 text-green-700"
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Check-in Khách</h2>
        <p className="text-sm text-gray-500 mt-1">Nhập mã đặt bàn (code_number) để xác nhận khách đến câu lạc bộ</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Nhập mã đặt bàn (VD: BK12345678)..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#4caf50]"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
            className="bg-[#4caf50] hover:bg-[#43a047] text-white h-11 px-5 font-medium"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm kiếm"}
          </Button>
        </form>
      </div>

      {/* Booking Info Card */}
      {foundBooking && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Card Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Thông tin đặt chỗ</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(foundBooking.status)}`}>
              {getStatusLabel(foundBooking.status)}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[90px]">Tên khách</span>
              <span className="text-sm font-semibold text-gray-900">{foundBooking.guest_name || foundBooking.account_id?.fullname || "–"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[90px]">SĐT</span>
              <span className="text-sm font-semibold text-gray-900">{foundBooking.guest_name ? "–" : (foundBooking.account_id?.phone || "–")}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[90px]">Bàn</span>
              <span className="text-sm font-bold text-[#4caf50]">
                {formatTableNumber(foundBooking.table_id?.table_number)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[90px]">Thời gian</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatTime(foundBooking.start_time)} – {formatTime(foundBooking.end_time)}{" "}
                {timeToMinutes(foundBooking.end_time) <= timeToMinutes(foundBooking.start_time) && foundBooking.end_time !== "00:00" && (
                  <span className="text-[10px] text-orange-500 font-bold italic mr-1">(+1 ngày)</span>
                )}
                <span className="text-gray-400 font-normal">({formatDate(foundBooking.play_date)})</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[90px]">Tiền cọc</span>
              <span className="text-sm font-bold text-gray-900">{foundBooking.deposit?.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex items-center gap-3">
              <Hash size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[90px]">Mã đơn</span>
              <span className="text-sm font-mono font-semibold text-gray-700">{foundBooking.code_number}</span>
            </div>
          </div>

          {/* Confirm Check-in Button */}
          <div className="px-5 pb-5">
            <Button
              onClick={handleConfirmCheckIn}
              disabled={isCheckingIn}
              className="w-full h-12 bg-[#4caf50] hover:bg-[#43a047] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {isCheckingIn ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-5 h-5 mr-2" />
              )}
              XÁC NHẬN CHECK-IN
            </Button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Hệ thống sẽ chuyển trạng thái bàn sang "Đang chơi" ngay lập tức
            </p>
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={14} /> Check-in gần đây
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {recentCheckIns.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-3 shadow-sm min-w-[180px] shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <User size={14} className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {item.table} • {Math.round((Date.now() - item.time.getTime()) / 60000)} phút trước
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// ─── Booking List Section ─────────────────────────────────────
const BookingListSection = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    total: 0, Pending: 0, Booked: 0, Playing: 0, Completed: 0, Cancelled: 0,
  });

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState("all");

  // Bộ lọc Ngày/Tuần/Tháng
  const [dateMode, setDateMode] = useState("day"); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  const [modalTarget, setModalTarget] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const dateInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, dateMode, currentDate, debouncedSearch]);

  useEffect(() => {
    const fetchAvailableTables = async () => {
      try {
        const res = await getTables({ page: 1, limit: 100 });
        if (res.data.success) {
          setAvailableTables(res.data.data.filter(t => t.status === "Available" || t.status === "available"));
        }
      } catch (e) {
        console.error("Lỗi fetch tables:", e);
      }
    };
    fetchAvailableTables();
  }, []);

  const handleDateChange = (dir) => {
    const newDate = new Date(currentDate);
    if (dateMode === 'day') {
      newDate.setDate(newDate.getDate() + (dir === 'next' ? 1 : -1));
    } else if (dateMode === 'week') {
      newDate.setDate(newDate.getDate() + (dir === 'next' ? 7 : -7));
    } else if (dateMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (dir === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      const effectiveStatus = activeTab !== "all" ? activeTab : (statusFilter !== "all" ? statusFilter : "");
      if (effectiveStatus) params.status = effectiveStatus;
      if (debouncedSearch) params.search = debouncedSearch;

      if (dateMode === 'day') {
         const yyyy = currentDate.getFullYear();
         const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
         const dd = String(currentDate.getDate()).padStart(2, '0');
         params.date = `${yyyy}-${mm}-${dd}`;
      } else if (dateMode === 'week') {
         const { start, end } = getWeekRange(currentDate);
         params.startDate = start.toISOString();
         params.endDate = end.toISOString();
      } else if (dateMode === 'month') {
         const { start, end } = getMonthRange(currentDate);
         params.startDate = start.toISOString();
         params.endDate = end.toISOString();
      }

      const res = await getClubBookings(params);
      if (res.success) {
        setBookings(res.data || []);
        setStatusCounts(res.statusCounts || { total: 0, Pending: 0, Booked: 0, Playing: 0, Completed: 0, Cancelled: 0 });
      }
    } catch (error) {
      toast.error("Không thể tải danh sách đặt bàn");
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, dateMode, currentDate, debouncedSearch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const getStatusBadge = (status) => {
    const cfg = {
      Pending: { label: "Chờ thanh toán", cls: "bg-amber-100 text-amber-700" },
      Booked: { label: "Đã đặt", cls: "bg-blue-100 text-blue-700" },
      Playing: { label: "Đang chơi", cls: "bg-green-100 text-green-700" },
      Completed: { label: "Hoàn thành", cls: "bg-gray-100 text-gray-700" },
      Cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
    };
    const c = cfg[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${c.cls}`}>{c.label}</span>;
  };

  const tabs = [
    { key: "all", label: "Tất cả đơn", count: statusCounts.total },
    { key: "Booked", label: "Đã đặt", count: statusCounts.Booked },
    { key: "Playing", label: "Đang chơi", count: statusCounts.Playing },
    { key: "Completed", label: "Hoàn thành", count: statusCounts.Completed },
    { key: "Cancelled", label: "Đã hủy", count: statusCounts.Cancelled },
  ];

  const totalPages = Math.ceil(bookings.length / pageSize);
  const currentBookings = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      {modalTarget && (
        <BookingDetailModal
          booking={modalTarget.booking}
          table={modalTarget.table}
          allTables={availableTables}
          onClose={() => setModalTarget(null)}
          onRefresh={fetchBookings}
        />
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls Row */}
        <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 border-b border-gray-100 bg-white">
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      placeholder="Tìm tên khách, SĐT, mã đơn..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#4caf50] w-full"
                    />
                  </div>
                  <div className="w-full md:w-56 shrink-0">
                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setActiveTab("all"); }}>
                      <SelectTrigger className="w-full h-11 border-gray-200 bg-white">
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="Booked">Đã đặt</SelectItem>
                        <SelectItem value="Playing">Đang chơi</SelectItem>
                        <SelectItem value="Completed">Hoàn thành</SelectItem>
                        <SelectItem value="Cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>

              {/* Advanced Date Row */}
              <div className="flex flex-col md:flex-row gap-4">
                  {/* Date Mode Select */}
                  <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 w-full md:w-auto h-11">
                    {['day', 'week', 'month'].map(mode => (
                       <button
                         key={mode}
                         onClick={() => setDateMode(mode)}
                         className={`flex-1 md:px-5 py-1.5 text-sm font-semibold rounded-md transition-all ${
                           dateMode === mode
                           ? "bg-white text-gray-900 shadow-sm"
                           : "text-gray-500 hover:text-gray-700"
                         }`}
                       >
                         {mode === 'day' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}
                       </button>
                    ))}
                  </div>

                  {/* Date Selector */}
                  <div className="flex items-center justify-between gap-1 sm:gap-3 bg-white border border-gray-200 rounded-lg p-1 h-11 w-full md:w-fit shadow-sm">
                    <button onClick={() => handleDateChange('prev')} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft size={16}/></button>
                    <div 
                      className="relative font-extrabold text-sm min-w-[170px] flex items-center justify-center text-center text-gray-800 hover:bg-gray-50 px-3 py-1.5 rounded-md cursor-pointer transition-all group border border-transparent hover:border-green-200 select-none"
                      onClick={() => dateMode === 'day' && dateInputRef.current?.showPicker?.()}
                    >
                       <CalendarDays size={14} className="mr-2 text-green-600 group-hover:scale-110 transition-transform" />
                       {dateMode === 'day' && `Thứ ${currentDate.getDay() === 0 ? 'CN' : currentDate.getDay() + 1}, ${currentDate.getDate()} Thg ${currentDate.getMonth()+1}, ${currentDate.getFullYear()}`}
                       {dateMode === 'week' && `Tuần ${getWeekNumber(currentDate)}, ${currentDate.getFullYear()}`}
                       {dateMode === 'month' && `Tháng ${currentDate.getMonth()+1}, ${currentDate.getFullYear()}`}
                       
                       <input 
                         ref={dateInputRef}
                         type="date"
                         className="absolute inset-0 opacity-0 cursor-pointer w-full pointer-events-none"
                         value={formatDateInput(currentDate)}
                         onChange={(e) => {
                           if(e.target.value) setCurrentDate(new Date(e.target.value));
                         }}
                       />
                    </div>
                    <button onClick={() => handleDateChange('next')} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><ChevronRight size={16}/></button>
                  </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-[#4caf50] to-[#45a049] rounded-xl p-4 text-white min-w-[220px] shadow-sm flex flex-col justify-center">
            <div className="text-sm font-medium opacity-90 mb-1">Tổng đơn</div>
            <div className="text-3xl font-bold mb-1">{statusCounts.total}</div>
            <div className="text-xs flex items-center font-medium opacity-90">
              <span>Đang chơi: {statusCounts.Playing}</span>
              <span className="mx-2">|</span>
              <span>Đã đặt: {statusCounts.Booked}</span>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="px-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.key
                  ? "border-[#4caf50] text-[#4caf50]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                onClick={() => { setActiveTab(tab.key); setStatusFilter("all"); }}
              >
                {tab.label} <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã đơn</TableHead>
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</TableHead>
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Bàn</TableHead>
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</TableHead>
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-[#4caf50] animate-spin" />
                      <span className="text-sm text-gray-400">Đang tải dữ liệu...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-base font-medium text-gray-600">Không có đơn đặt bàn</span>
                      <span className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc ngày</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentBookings.map((booking) => (
                  <TableRow key={booking._id} className="hover:bg-gray-50 border-b border-gray-50">
                    <TableCell className="px-6 py-4">
                      <span className="font-medium text-[#4caf50]">#{booking.code_number}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {booking.guest_name || booking.account_id?.fullname || "–"}
                        {booking.guest_name && (
                          <span className="ml-2 text-xs font-normal px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Walk-in</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">{booking.guest_name ? "Khách trực tiếp" : (booking.account_id?.phone || "–")}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-bold text-sm">
                        {formatTableNumber(booking.table_id?.table_number)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                          {timeToMinutes(booking.end_time) <= timeToMinutes(booking.start_time) && booking.end_time !== "00:00" && (
                            <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-1 rounded border border-orange-100 italic">(+1 ngày)</span>
                          )}
                        </div>
                        {booking.actual_end_time && booking.status === "Completed" && (
                          <div className="text-[10px] text-blue-500 font-medium italic">
                            Kết thúc thực tế: {formatTime(booking.actual_end_time)}
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5">{formatDate(booking.play_date)}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-medium"
                        onClick={() => setModalTarget({ booking, table: booking.table_id })}
                      >
                        <Eye size={14} className="mr-1.5" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {!loading && bookings.length > 0 && (
          <div className="flex flex-col gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <div>
                Tổng số: <span className="font-semibold text-gray-900">{bookings.length}</span> đơn đặt bàn
              </div>
              <div className="flex items-center gap-4">
                <span>⏱️ Đang chơi: <span className="font-semibold text-green-600">{statusCounts.Playing}</span></span>
                <span>📅 Đã đặt: <span className="font-semibold text-blue-600">{statusCounts.Booked}</span></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span>
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, bookings.length)} trong {bookings.length} đơn đặt bàn
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};


// ─── Main Page ────────────────────────────────────────────────
export const StaffClubPageBooking = () => {
  const [activeSection, setActiveSection] = useState("checkin");
  const [bookingListKey, setBookingListKey] = useState(0);
  const [walkInMountKey, setWalkInMountKey] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get("/staff/notifications");
      if (response.data?.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Loi fetchNotifications:", error);
    }
  }, []);

  const sections = [
    { key: "checkin", label: "Check-in Khách", icon: <LogIn size={16} /> },
    { key: "bookings", label: "Danh sách Đặt bàn", icon: <List size={16} /> },
  ];

  // Khi tạo walk-in xong, refresh danh sách booking
  const handleBookingCreated = () => {
    setBookingListKey((k) => k + 1);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationPopup(false);
      }
    };

    if (showNotificationPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotificationPopup]);

  const handleReadNotification = async (id) => {
    try {
      await axios.patch(`/staff/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Loi mark notification read:", error);
    }
  };

  const handleReadAllNotifications = async () => {
    try {
      await axios.patch("/staff/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.error("Loi mark all notifications read:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-[1440px] mx-auto bg-gray-50/30 min-h-[calc(100vh-80px)] font-sans">

      {/* Page Header + Section Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Đặt bàn</h1>

        {/* Section Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationRef}>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden"
              onClick={() => setShowNotificationPopup((prev) => !prev)}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </Button>

            {showNotificationPopup && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-800">Thong bao</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleReadAllNotifications}
                      className="text-xs font-medium text-green-600 hover:text-green-700"
                    >
                      Danh dau da doc
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-center text-gray-500">
                      Chua co thong bao nao
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif._id}
                        type="button"
                        onClick={() => handleReadNotification(notif._id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.is_read ? "bg-green-50/50" : "bg-white"}`}
                      >
                        <div className="flex gap-3">
                          <div className="pt-1">
                            {!notif.is_read && <span className="block w-2 h-2 rounded-full bg-green-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm line-clamp-1 ${!notif.is_read ? "font-semibold text-gray-900" : "text-gray-900"}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">
                              {notif.created_at ? new Date(notif.created_at).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }) : ""}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
          {sections.map((sec) => (
            <button
              key={sec.key}
              onClick={() => {
                setActiveSection(sec.key);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeSection === sec.key
                ? "bg-[#4caf50] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              {sec.icon}
              {sec.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Active Section Content */}
      {activeSection === "checkin" && <CheckInSection onCheckInSuccess={() => setBookingListKey((k) => k + 1)} />}
      {activeSection === "bookings" && <BookingListSection key={bookingListKey} />}
    </div>
  );
};
