import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Search, Calendar as CalendarIcon, MoreVertical, TrendingUp, Loader2,
  LogIn, List, User, Clock, CreditCard, MapPin, Hash, Phone, ArrowRight
} from "lucide-react";

import { checkInBooking, getClubBookings } from "@/services/booking.service";
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
    const map = { Pending: "Chờ thanh toán", Booked: "Chờ check-in", Playing: "Đang chơi", Completed: "Hoàn thành", Cancelled: "Đã hủy" };
    return map[status] || status;
  };
  const getStatusColor = (status) => {
    const map = { Pending: "bg-amber-100 text-amber-700", Booked: "bg-blue-100 text-blue-700", Playing: "bg-green-100 text-green-700" };
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
              <span className="text-sm font-semibold text-gray-900">{foundBooking.account_id?.fullname || "–"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-500 min-w-[90px]">SĐT</span>
              <span className="text-sm font-semibold text-gray-900">{foundBooking.account_id?.phone || "–"}</span>
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
  const [statusCounts, setStatusCounts] = useState({
    total: 0, Pending: 0, Booked: 0, Playing: 0, Completed: 0, Cancelled: 0,
  });

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      const effectiveStatus = activeTab !== "all" ? activeTab : (statusFilter !== "all" ? statusFilter : "");
      if (effectiveStatus) params.status = effectiveStatus;
      if (dateFilter) params.date = dateFilter;
      if (debouncedSearch) params.search = debouncedSearch;

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
  }, [activeTab, statusFilter, dateFilter, debouncedSearch]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const getStatusBadge = (status) => {
    const cfg = {
      Booked: { label: "Đã đặt", cls: "bg-blue-100 text-blue-700" },
      Playing: { label: "Đang chơi", cls: "bg-green-100 text-green-700" },
      Pending: { label: "Chờ xác nhận", cls: "bg-orange-100 text-orange-700" },
      Completed: { label: "Hoàn thành", cls: "bg-gray-100 text-gray-700" },
      Cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
    };
    const c = cfg[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${c.cls}`}>{c.label}</span>;
  };

  const tabs = [
    { key: "all", label: "Tất cả đơn", count: statusCounts.total },
    { key: "Pending", label: "Chờ xác nhận", count: statusCounts.Pending },
    { key: "Booked", label: "Đã đặt", count: statusCounts.Booked },
    { key: "Playing", label: "Đang chơi", count: statusCounts.Playing },
    { key: "Completed", label: "Hoàn thành", count: statusCounts.Completed },
    { key: "Cancelled", label: "Đã hủy", count: statusCounts.Cancelled },
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls Row */}
        <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 border-b border-gray-100 bg-white">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Tìm tên khách, SĐT, mã đơn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#4caf50] w-full"
                />
              </div>
              <div className="md:col-span-3">
                <div className="flex items-center border border-gray-200 rounded-md h-11 px-3 bg-white">
                  <CalendarIcon className="text-gray-400 mr-2 shrink-0" size={18} />
                  <input
                    type="date"
                    className="w-full bg-transparent border-none text-sm text-gray-600 focus:outline-none focus:ring-0 h-10 p-0"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setActiveTab("all"); }}>
                  <SelectTrigger className="w-full h-11 border-gray-200 bg-white">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="Booked">Đã đặt</SelectItem>
                    <SelectItem value="Playing">Đang chơi</SelectItem>
                    <SelectItem value="Pending">Chờ xác nhận</SelectItem>
                    <SelectItem value="Completed">Hoàn thành</SelectItem>
                    <SelectItem value="Cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
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
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Tiền cọc</TableHead>
                <TableHead className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Hành động</TableHead>
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
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-base font-medium text-gray-600">Không có đơn đặt bàn</span>
                      <span className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc ngày</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking._id} className="hover:bg-gray-50 border-b border-gray-50">
                    <TableCell className="px-6 py-4">
                      <span className="font-medium text-[#4caf50]">#{booking.code_number}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900">{booking.account_id?.fullname || "–"}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{booking.account_id?.phone || "–"}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-bold text-sm">
                        {formatTableNumber(booking.table_id?.table_number)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{formatDate(booking.play_date)}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right font-medium text-gray-900">
                      {booking.deposit > 0 ? `${booking.deposit.toLocaleString("vi-VN")}đ` : "0đ"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        {!loading && bookings.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="text-sm text-gray-600">
              Tổng số: <span className="font-semibold text-gray-900">{bookings.length}</span> đơn đặt bàn
            </div>
            <div className="text-sm text-gray-600">
              <span className="mr-4">⏱️ Đang chơi: <span className="font-semibold text-green-600">{statusCounts.Playing}</span></span>
              <span>📅 Đã đặt: <span className="font-semibold text-blue-600">{statusCounts.Booked}</span></span>
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

  const sections = [
    { key: "checkin", label: "Check-in Khách", icon: <LogIn size={16} /> },
    { key: "bookings", label: "Danh sách Đặt bàn", icon: <List size={16} /> },
  ];

  return (
    <div className="p-4 md:p-6 w-full max-w-[1440px] mx-auto bg-gray-50/30 min-h-[calc(100vh-80px)] font-sans">

      {/* Page Header + Section Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý Đặt bàn</h1>

        {/* Section Toggle */}
        <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
          {sections.map((sec) => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
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

      {/* Active Section Content */}
      {activeSection === "checkin" && <CheckInSection />}
      {activeSection === "bookings" && <BookingListSection />}
    </div>
  );
};