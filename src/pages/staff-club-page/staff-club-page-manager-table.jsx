import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Search, LayoutGrid, Circle, Edit2, X,
  CheckCircle2, Clock, AlertCircle, User, CalendarDays,
  PhoneCall, Hash, BadgeCheck, Wrench, RefreshCw, Info,
  ChevronLeft, ChevronRight, ShoppingCart, RotateCcw, ArrowLeftRight,
  Plus, Minus, Trash2
} from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { getTables, getTableTypes, updateTable } from "@/services/billiardTable.service";
import bookingService from "@/services/booking.service";
import { getServices } from "@/services/service.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const TIMELINE_START = 0; // 00:00
const TIMELINE_HOURS = 24; // 24 hours total (one full day)
const HOUR_WIDTH = 140; // px per hour

const HOURS = Array.from({ length: TIMELINE_HOURS }, (_, i) => {
  const trueHour = TIMELINE_START + i;
  const h = trueHour % 24;
  const nextDay = trueHour >= 24;
  return nextDay ? `${h.toString().padStart(2, "0")}:00 (+1)` : `${h.toString().padStart(2, "0")}:00`;
});

const STATUS_META = {
  playing: { label: "Đang chơi", color: "text-green-600", dot: "bg-green-500", blockClass: "bg-green-50 border-green-200 text-green-700 shadow-sm" },
  booked: { label: "Khách đặt", color: "text-blue-600", dot: "bg-blue-500", blockClass: "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" },
  holding: { label: "Giữ chỗ", color: "text-amber-600", dot: "bg-amber-500", blockClass: "bg-amber-50 border-amber-200 text-amber-700 border-dashed" },
  available: { label: "Đang hoạt động", color: "text-gray-500", dot: "bg-gray-300" },
  maintenance: { label: "Bảo trì", color: "text-red-500", dot: "bg-red-400" },
  completed: { label: "Hoàn thành", color: "text-gray-400", blockClass: "bg-gray-50 border-gray-200 text-gray-400 opacity-60 shadow-none" },
  cancelled: { label: "Đã hủy", color: "text-red-400", blockClass: "bg-red-50 border-red-100 text-red-400 opacity-50 shadow-none line-through" },
};

const formatTime = (str) => str?.slice(0, 5) || "–";
const formatDate = (date) => {
  if (!date) return "–";
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

// Returns position and width of a booking block on the timeline
const getBlockStyle = (booking, currentDate) => {
  if (!booking || !booking.start_time) return { left: 0, width: 0, display: 'none' };
  
  const bDate = new Date(booking.play_date);
  bDate.setHours(0, 0, 0, 0);
  const currDate = new Date(currentDate);
  currDate.setHours(0, 0, 0, 0);

  const [sh, sm] = booking.start_time.split(':').map(Number);
  let startMinutes = sh * 60 + sm;
  
  let endMinutes;
  if (booking.end_time) {
    const [eh, em] = booking.end_time.split(':').map(Number);
    endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) endMinutes += 24 * 60; // Next day
  } else {
    endMinutes = startMinutes + 60;
  }

  // Adjust for date difference if the booking is from yesterday
  const diffDays = Math.round((currDate - bDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
     // booking was yesterday
     startMinutes -= diffDays * 24 * 60;
     endMinutes -= diffDays * 24 * 60;
  } else if (diffDays < 0) {
     // booking is tomorrow (shouldn't happen with our fetch normally)
     startMinutes += Math.abs(diffDays) * 24 * 60;
     endMinutes += Math.abs(diffDays) * 24 * 60;
  }

  // Clip to timeline max bounds (0 to 30 hours)
  if (endMinutes <= 0) return { left: 0, width: 0, display: 'none' }; // Ends before timeline starts
  if (startMinutes >= TIMELINE_HOURS * 60) return { left: 0, width: 0, display: 'none' }; // Starts after timeline ends
  
  if (startMinutes < 0) startMinutes = 0;
  if (endMinutes > TIMELINE_HOURS * 60) endMinutes = TIMELINE_HOURS * 60;

  const left = (startMinutes / 60) * HOUR_WIDTH;
  const width = ((endMinutes - startMinutes) / 60) * HOUR_WIDTH;

  return { left: `${left}px`, width: `${width}px` };
};

// Derived status for Table (Y-axis label) based on current time
const getTableDerivedStatus = (table, dateFilter, bookingsForTable) => {
   if (table.status === "Maintenance") return "maintenance";

   const now = new Date();
   const isToday = dateFilter.getDate() === now.getDate() && dateFilter.getMonth() === now.getMonth() && dateFilter.getFullYear() === now.getFullYear();
   
   if (!isToday) {
       return table.status === "Holding" ? "holding" : "available";
   }

   const currentMinutes = now.getHours() * 60 + now.getMinutes();
   
   // Check if any booking overlaps exactly NOW
   const activeBooking = bookingsForTable.find(b => {
      if (b.status === "Cancelled" || b.status === "Completed") return false;
      if (!b.start_time || !b.end_time) return false;

      const bDate = new Date(b.play_date);
      bDate.setHours(0, 0, 0, 0);
      const currDate = new Date(dateFilter);
      currDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((currDate - bDate) / (1000 * 60 * 60 * 24));

      const [sh, sm] = b.start_time.split(':').map(Number);
      let [eh, em] = b.end_time.split(':').map(Number);
      
      let startMin = sh * 60 + sm;
      let endMin = eh * 60 + em;
      if (endMin <= startMin) endMin += 24 * 60;
      
      startMin -= diffDays * 24 * 60;
      endMin -= diffDays * 24 * 60;

      return currentMinutes >= startMin && currentMinutes <= endMin;
   });

   if (activeBooking) {
       if (activeBooking.status === "Playing") return "playing";
       if (activeBooking.status === "Booked") return "booked";
       if (activeBooking.status === "Pending") return "holding";
   }

   return table.status === "Holding" ? "holding" : "available";
};

// ─────────────────────────────────────────────
//  Modal
// ─────────────────────────────────────────────
const TableDetailModal = ({ table, booking, isBookingActive, onClose, onStatusChange, onCheckout, onRefresh }) => {
  if (!table) return null;

  const [loading, setLoading] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [bookingServices, setBookingServices] = useState([]);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [showExtendPanel, setShowExtendPanel] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(30);

  // Use the table's pure DB status unless it's overridden implicitly
  const isTableAvailable = !booking && table.status === "Available";

  useEffect(() => {
    if (booking && booking.status === "Playing") {
      fetchBookingServices();
      fetchAllClubServices();
    }
  }, [booking]);

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

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    await onStatusChange(table._id, newStatus);
    setLoading(false);
    onClose();
  };

  const handleCheckoutClick = async () => {
    if (!booking) return;
    setLoading(true);
    await onCheckout(booking._id);
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-gray-900 text-xl leading-tight">Chi tiết bàn {table.table_number}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Thông tin đặt bàn (nếu có block) */}
          {booking ? (
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CalendarDays size={14} /> Thông tin đặt bàn
              </h3>
              
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-4">
                {booking.account_id && (
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{booking.account_id.fullname || booking.guest_name || "Khách"}</h4>
                      <div className="flex items-center text-xs text-gray-500 gap-2">
                        <span>{booking.account_id.phone || "–"}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <InfoRow icon={<Clock size={14} />} label="Thời gian" value={`${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`} />
                  <InfoRow icon={<Hash size={14} />} label="Mã booking" value={<span className="font-mono text-gray-700">{booking.code_number}</span>} />
                  <InfoRow icon={<Circle size={14} />} label="Trạng thái đơn" value={
                    <span className="font-semibold text-gray-800">{booking.status}</span>
                  } />
                  <InfoRow icon={<BadgeCheck size={14} />} label="Tổng tiền" value={
                    <span className="font-bold text-green-600 text-lg">{(booking.total_bill || 0)?.toLocaleString("vi-VN")}đ</span>
                  } />
                </div>
              </div>

              {/* Dịch vụ đã gọi */}
              {booking.status === "Playing" && bookingServices.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-2">Dịch vụ đã gọi</h4>
                  <div className="space-y-2">
                    {bookingServices.map((bs, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg border border-gray-50 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-800 font-bold">{bs.service_id?.name}</span>
                          <span className="text-[10px] text-gray-500">{(bs.unit_price).toLocaleString("vi-VN")}đ / đơn vị</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                            <button 
                              onClick={() => handleUpdateServiceQuantity(bs._id, bs.quantity, -1)}
                              disabled={loading || bs.quantity <= 1}
                              className="p-1 rounded-md hover:bg-white text-gray-500 disabled:opacity-30 transition-all"
                            >
                              <Minus size={14}/>
                            </button>
                            <span className="w-6 text-center font-bold text-xs">{bs.quantity}</span>
                            <button 
                              onClick={() => handleUpdateServiceQuantity(bs._id, bs.quantity, 1)}
                              disabled={loading}
                              className="p-1 rounded-md hover:bg-white text-gray-500 transition-all"
                            >
                              <Plus size={14}/>
                            </button>
                          </div>

                          <div className="flex flex-col items-end min-w-[80px]">
                            <span className="text-gray-900 font-bold">{(bs.unit_price * bs.quantity).toLocaleString("vi-VN")}đ</span>
                            <button 
                              onClick={() => handleDeleteService(bs._id)}
                              disabled={loading}
                              className="text-red-400 hover:text-red-600 p-1 transition-colors"
                              title="Xoá dịch vụ"
                            >
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Booking (ORDER, GIA HẠN, ĐỔI BÀN) */}
              {booking.status === "Playing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setShowOrderPanel(!showOrderPanel)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${showOrderPanel ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-gray-200 text-green-600 hover:bg-green-50'}`}
                    >
                      <ShoppingCart size={24} />
                      <span className="text-[11px] font-bold uppercase">ORDER</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowExtendPanel(!showExtendPanel);
                        setShowOrderPanel(false);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${showExtendPanel ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-gray-200 text-green-600 hover:bg-green-50'}`}
                    >
                      <RotateCcw size={24} />
                      <span className="text-[11px] font-bold uppercase">GIA HẠN</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white text-green-600 hover:bg-green-50 transition-all">
                      <ArrowLeftRight size={24} />
                      <span className="text-[11px] font-bold uppercase">ĐỔI BÀN</span>
                    </button>
                  </div>

                  {/* Extend Panel */}
                  {showExtendPanel && (
                    <div className="border border-green-100 rounded-xl p-4 bg-green-50/30 animate-in slide-in-from-top-2 duration-200 space-y-3">
                      <h4 className="font-bold text-green-800 text-sm">Gia hạn thêm thời gian</h4>
                      <div className="flex flex-wrap gap-2">
                        {[30, 60, 90, 120].map(mins => (
                          <button
                            key={mins}
                            onClick={() => setExtendMinutes(mins)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${extendMinutes === mins ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'}`}
                          >
                            +{mins}p {mins >= 60 && `(${mins/60}h)`}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          min="1" 
                          value={extendMinutes} 
                          onChange={(e) => setExtendMinutes(parseInt(e.target.value) || 0)}
                          className="h-9 text-sm"
                          placeholder="Số phút..."
                        />
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 h-9 px-4 font-bold"
                          onClick={handleExtendBooking}
                          disabled={loading || extendMinutes <= 0}
                        >
                          Lưu
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Order Panel (Nested UI) */}
                  {showOrderPanel && (
                    <div className="border border-green-100 rounded-xl p-4 bg-green-50/30 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-3">
                         <h4 className="font-bold text-green-800 text-sm">Menu dịch vụ</h4>
                         {fetchingServices && <RefreshCw size={14} className="animate-spin text-green-600"/>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                        {allServices.map(s => (
                          <div key={s._id} className="bg-white p-2 rounded-lg border border-gray-100 flex flex-col gap-1 shadow-sm">
                            <span className="text-xs font-bold text-gray-800 truncate">{s.name}</span>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[10px] text-gray-500">{s.price?.toLocaleString()}đ</span>
                              <button 
                                onClick={() => handleAddService(s._id)}
                                disabled={loading}
                                className="p-1 rounded bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                              >
                                <Plus size={14}/>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="default" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg rounded-xl mt-2"
                    onClick={handleCheckoutClick}
                    disabled={loading}
                  >
                    <CheckCircle2 size={18} className="mr-2" /> Thanh toán / Kết thúc
                  </Button>
                </div>
              )}
            </section>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">
              Nhấn vào thời gian trống để tạo đơn mới nhanh (Walk-in)
            </div>
          )}

          {/* Thay đổi trạng thái bàn */}
          <section className="pt-4 border-t border-gray-100">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Wrench size={12} /> Quản lý trạng thái bàn trực tiếp
              </h3>
              <div className="flex gap-2">
                 {isTableAvailable && (
                  <Button
                    variant="outline"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-white"
                    disabled={loading}
                    onClick={() => handleStatusChange("Maintenance")}
                  >
                    <Wrench size={14} className="mr-1.5" /> Chuyển sang Bảo trì
                  </Button>
                )}
                {table.status === "Maintenance" && (
                  <Button
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50 bg-white"
                    disabled={loading}
                    onClick={() => handleStatusChange("Available")}
                  >
                    <CheckCircle2 size={14} className="mr-1.5" /> Chuyển về Đang hoạt động
                  </Button>
                )}
                {!isTableAvailable && table.status !== "Maintenance" && (
                  <p className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg w-full text-center font-medium border border-gray-100 italic">
                    (Không thể đổi trạng thái khi bàn đang phục vụ)
                  </p>
                )}
              </div>
          </section>

        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">{icon}{label}</span>
    <span className="text-sm text-gray-900">{value}</span>
  </div>
);


// ─────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────
export const StaffClubPageManagerTable = () => {
  const [tables, setTables] = useState([]);
  const [tableTypes, setTableTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // Filter table current derived status

  // Date state
  const [dateMode, setDateMode] = useState("day"); // 'day', 'week', 'month' step for navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal target
  const [modalTarget, setModalTarget] = useState(null); // { table, booking, isBookingActive }
  const timelineScrollRef = useRef(null);

  // Fetch tables
  const fetchTables = async () => {
    try {
      // Fetch all tables ignoring status/search to maintain timeline integrity, 
      // we'll filter them client-side based on derived status
      const res = await getTables({ page: 1, limit: 200 }); 
      if (res.data.success) {
        let fetchedTables = res.data.data;
        setTables(fetchedTables);
      }
    } catch {
      toast.error("Không thể tải danh sách bàn");
    }
  };

  // Fetch bookings for the current date
  const fetchBookingsForDate = async (selectedDate) => {
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const yesterday = new Date(selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yYear = yesterday.getFullYear();
      const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
      const yDay = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayStr = `${yYear}-${yMonth}-${yDay}`;

      const [resToday, resYesterday] = await Promise.all([
         bookingService.getClubBookings({ status: "all", date: dateStr }),
         bookingService.getClubBookings({ status: "all", date: yesterdayStr })
      ]);

      let combinedBookings = [];
      if (resToday.success) {
         combinedBookings = [...(resToday.data || [])];
      }

      if (resYesterday.success) {
         const overnightBookings = (resYesterday.data || []).filter(b => {
             if (b.status === "Cancelled") return false;
             if (!b.start_time || !b.end_time) return false;
             const [sh, sm] = b.start_time.split(':').map(Number);
             const [eh, em] = b.end_time.split(':').map(Number);
             const startMin = sh * 60 + sm;
             const endMin = eh * 60 + em;
             // Goes overnight if endMin <= startMin. It must also extend into today (endMin > 0).
             return endMin <= startMin && endMin > 0;
         });
         
         const existingIds = new Set(combinedBookings.map(b => b._id));
         const uniqueOvernight = overnightBookings.filter(b => !existingIds.has(b._id));
         
         combinedBookings = [...combinedBookings, ...uniqueOvernight];
      }
      setBookings(combinedBookings);
    } catch (e) {
      toast.error("Không thể tải lịch đặt bàn");
      setBookings([]);
    }
  };

  const fetchTableTypes = async () => {
    try {
      const res = await getTableTypes();
      if (res.data.success) setTableTypes(res.data.data);
    } catch { }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTables(),
      fetchBookingsForDate(currentDate)
    ]);
    setLoading(false);
  };

  useEffect(() => { fetchTableTypes(); }, []);
  useEffect(() => { loadData(); }, [currentDate]);

  // Handle Date Navigation
  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    if (dateMode === "day") {
      newDate.setDate(newDate.getDate() + direction);
    } else if (dateMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const formatCurrentDateLabel = () => {
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return `${days[currentDate.getDay()]}, ${currentDate.getDate()} Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
  };

  // Scroll to 08:00 AM on initial load
  useEffect(() => {
    if (timelineScrollRef.current) {
        // scroll to ~ 8 AM (8 * HOUR_WIDTH)
        timelineScrollRef.current.scrollLeft = 8 * HOUR_WIDTH - 100; // offset a bit
    }
  }, []);

  // Filter tables matching client-side search/type/status
  const filteredTables = useMemo(() => {
    let result = tables;
    
    if (typeFilter !== "all") {
       result = result.filter(t => t.table_type_id?._id === typeFilter || t.table_type_id === typeFilter);
    }
    
    if (debouncedSearch) {
       const lower = debouncedSearch.toLowerCase();
       result = result.filter(t => t.table_number?.toLowerCase().includes(lower));
    }

    if (statusFilter !== "all") {
       result = result.filter(t => {
           const bookingsOfTable = bookings.filter(b => b.table_id?._id === t._id);
           const ds = getTableDerivedStatus(t, currentDate, bookingsOfTable);
           return ds === statusFilter;
       });
    }

    return result;
  }, [tables, bookings, currentDate, typeFilter, statusFilter, debouncedSearch]);

  // Actions
  const handleStatusChange = async (tableId, newStatus) => {
    try {
      const currentTable = tables.find(t => t._id === tableId);
      if (!currentTable) return;
      const res = await updateTable(tableId, { 
         status: newStatus,
         table_type_id: currentTable.table_type_id?._id || currentTable.table_type_id,
         table_number: currentTable.table_number,
         price: currentTable.price
      });
      if (res.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchTables(); // Refresh
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleCheckout = async (bookingId) => {
    try {
       const res = await bookingService.checkOutBooking(bookingId);
       if (res.success) {
           toast.success("Thanh toán thành công. Bàn đã chuyển về Đang hoạt động.");
           await loadData(); // Reload both tables and bookings
       }
    } catch(err) {
       toast.error("Thanh toán thất bại");
    }
  };

  const counts = {
    all: tables.length,
    playing: 0,
    booked: 0,
    holding: 0,
    available: 0,
    maintenance: 0
  };

  // Compute counts efficiently
  tables.forEach(t => {
     const bts = bookings.filter(b => b.table_id?._id === t._id);
     const ds = getTableDerivedStatus(t, currentDate, bts);
     if (counts[ds] !== undefined) counts[ds]++;
  });

  return (
    <div className="p-4 md:p-6 w-full max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] flex flex-col h-full bg-white">
      {/* Modal Target */}
      {modalTarget && (
        <TableDetailModal
          table={modalTarget.table}
          booking={modalTarget.booking}
          isBookingActive={modalTarget.isBookingActive}
          onClose={() => setModalTarget(null)}
          onStatusChange={handleStatusChange}
          onCheckout={handleCheckout}
          onRefresh={loadData}
        />
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Date Mode Toggle */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          {['day', 'week', 'month'].map(mode => (
             <button 
               key={mode} 
               onClick={() => setDateMode(mode)}
               className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${dateMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
               {mode === 'day' ? 'Hôm nay' : mode === 'week' ? 'Tuần' : 'Tháng'}
             </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
           <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-gray-50 rounded-md transition-colors"><ChevronLeft size={18} className="text-gray-500"/></button>
           <span className="font-extrabold text-gray-900 min-w-[180px] text-center">{formatCurrentDateLabel()}</span>
           <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-gray-50 rounded-md transition-colors"><ChevronRight size={18} className="text-gray-500"/></button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-sm">
           {[['available', 'Đang hoạt động'], ['playing', 'Đang chơi'], ['booked', 'Khách đặt'], ['maintenance', 'Bảo trì']].map(([key, label]) => {
              const meta = STATUS_META[key];
              return (
                 <div key={key} className="flex items-center gap-1.5 font-medium text-gray-600">
                    <span className={`w-3 h-3 rounded-full ${meta.dot} border border-black/10`} /> {label}
                 </div>
              )
           })}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <Input
            className="w-full pl-10 h-10 rounded-lg border-gray-200 shadow-sm text-sm"
            placeholder="Tìm kiếm số bàn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-lg border-gray-200 bg-white text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <LayoutGrid size={15} className="text-gray-400" />
              <SelectValue placeholder="Tất cả loại bàn" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại bàn</SelectItem>
            {tableTypes.map(type => (
              <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-lg border-gray-200 bg-white text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <Circle size={15} className="text-gray-400" />
              <SelectValue placeholder="Trạng thái" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái ({counts.all})</SelectItem>
            <SelectItem value="available">Đang hoạt động ({counts.available})</SelectItem>
            <SelectItem value="playing">Đang chơi ({counts.playing})</SelectItem>
            <SelectItem value="booked">Đã đặt ({counts.booked})</SelectItem>
            <SelectItem value="maintenance">Bảo trì ({counts.maintenance})</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 ml-auto"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={15} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </Button>
      </div>

      {/* Timeline Calendar View */}
      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
         
         {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
               <RefreshCw className="animate-spin text-gray-400 w-8 h-8"/>
            </div>
         )}

         {/* Header and Body Container */}
         <div className="flex-1 overflow-auto w-full h-full relative no-scrollbar z-0" ref={timelineScrollRef}>
            {/* Header Row (Sticky Top) */}
            <div className="flex sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 w-fit min-w-full">
               {/* Y-Axis Label */}
               <div className="w-44 lg:w-48 sticky left-0 z-40 bg-gray-50/95 border-r border-gray-200 shrink-0 flex items-center justify-center py-3 font-bold text-xs text-gray-500 uppercase tracking-widest backdrop-blur-md shadow-[2px_0_5px_rgba(0,0,0,0.02)] isolate">
                  Bàn
               </div>
               
               {/* Timeline Hours */}
               <div className="flex-1 flex">
                  {HOURS.map(h => (
                     <div key={h} className="shrink-0 flex items-center justify-center font-bold text-sm text-gray-600 border-r border-gray-200 h-11" style={{ width: HOUR_WIDTH }}>
                        {h}
                     </div>
                  ))}
               </div>
            </div>

            {/* Body */}
            <div className="flex w-fit min-w-full">
               {/* Y-Axis Tables */}
               <div className="w-44 lg:w-48 sticky left-0 z-20 bg-white border-r border-gray-200 shrink-0 flex flex-col shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  {filteredTables.map(table => {
                     const ds = getTableDerivedStatus(table, currentDate, bookings.filter(b => b.table_id?._id === table._id));
                     const meta = STATUS_META[ds] || STATUS_META.available;
                     return (
                        <div key={table._id} className="h-[90px] border-b border-gray-100 flex items-center p-3 hover:bg-gray-50 transition-colors cursor-pointer bg-white" onClick={() => setModalTarget({ table })}>
                           <div className="flex items-center gap-3 w-full">
                              <div className={`shrink-0 w-2 h-10 rounded-full ${meta.dot}`} />
                              <div className="overflow-hidden flex-1">
                                 <h3 className="font-extrabold text-gray-900 text-base lg:text-lg">{table.table_number}</h3>
                                 <p className="text-[11px] text-gray-400 font-medium truncate">{table.table_type_id?.name || "Bàn"}</p>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* Grid & Blocks Area */}
               <div className="flex-1 flex flex-col relative z-0">
                  {/* Background Grid Lines (Absolute to stretch full height) */}
                  <div className="absolute inset-0 flex pointer-events-none">
                     {HOURS.map(h => (
                        <div key={`bg-${h}`} className="shrink-0 border-r border-gray-100/60 h-full" style={{ width: HOUR_WIDTH }} />
                     ))}
                  </div>

                  {filteredTables.map(table => {
                      const tableBookings = bookings.filter(b => b.table_id?._id === table._id);
                      return (
                        <div key={`grid-${table._id}`} className="h-[90px] border-b border-gray-100 flex items-center relative hover:bg-gray-50/20 transition-colors w-full">
                           
                           {/* Booking blocks */}
                           {tableBookings.map(booking => {
                              if (booking.status === "Cancelled") return null;
                              const { left, width, display } = getBlockStyle(booking, currentDate);
                              if (display === 'none') return null;
                              
                              const bMeta = STATUS_META[booking.status.toLowerCase()] || STATUS_META.completed;
                              
                              return (
                                <div 
                                  key={booking._id}
                                  className={`absolute top-2 bottom-2 rounded-lg p-2 border overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-md z-10 flex flex-col justify-center ${bMeta.blockClass}`}
                                  style={{ left, width }}
                                  onClick={() => setModalTarget({ table, booking, isBookingActive: true })}
                                >
                                   <div className="flex items-center justify-between gap-2 max-w-full">
                                       <span className="font-bold text-[13px] truncate">
                                         {booking.account_id?.fullname || booking.guest_name || "Khách"}
                                       </span>
                                   </div>
                                   <span className="text-[11px] opacity-80 mt-[2px] truncate font-semibold">
                                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                   </span>
                                </div>
                              );
                           })}
                        </div>
                      );
                  })}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

