import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Search, LayoutGrid, Circle, Edit2, PowerOff, X,
  CheckCircle2, Clock, AlertCircle, User, CalendarDays,
  PhoneCall, Hash, BadgeCheck, Wrench, RefreshCw, Info
} from "lucide-react";

import useDebounce from "@/hooks/useDebounce";
import { getTables, updateTable, getTableTypes } from "@/services/billiardTable.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// ─────────────────────────────────────────────
//  Helpers: resolve combined status from table + booking
// ─────────────────────────────────────────────
/**
 * Returns a "display status" derived from billiard_table.status and the activeBooking.status.
 * Priority: Maintenance > Playing > (Booked/Pending that are happening now) > Holding > Available.
 * Upcoming bookings in the future will NOT block the table; the table is treated as available until the start time.
 */
const getDisplayStatus = (table) => {
  const booking = table.activeBooking;

  // Helper: parse booking times to Date
  const parseBookingRange = (bk) => {
    if (!bk?.play_date || !bk?.start_time || !bk?.end_time) return {};
    const start = new Date(`${bk.play_date}T${bk.start_time}`);
    const end = new Date(`${bk.play_date}T${bk.end_time}`);
    return { start, end };
  };

  const now = new Date();
  const { start, end } = parseBookingRange(booking);
  const isOngoing = start && end && now >= start && now <= end;

  if (table.status === "Maintenance") return "maintenance";
  // Only treat booking as blocking if it is ongoing
  if (isOngoing && booking?.status === "Playing") return "playing";
  if (isOngoing && booking?.status === "Booked") return "booked";
  if (isOngoing && (booking?.status === "Pending" || table.status === "Holding")) return "holding";
  // Holding status on table itself
  if (table.status === "Holding") return "holding";
  return "available";
};

const STATUS_META = {
  playing: { label: "Đang chơi", color: "text-green-600", bg: "bg-green-50", border: "border-green-500 border-l-4", dot: "bg-green-500" },
  booked: { label: "Đã đặt", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-400 border-l-4", dot: "bg-blue-500" },
  holding: { label: "Giữ chỗ", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-400 border-l-4", dot: "bg-amber-500" },
  available: { label: "Bàn trống", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200 border-l-4 border-l-gray-300", dot: "bg-gray-400" },
  maintenance: { label: "Bảo trì", color: "text-gray-400", bg: "bg-gray-100", border: "border-gray-300 opacity-75", dot: "bg-gray-400" },
};

const formatTime = (str) => str?.slice(0, 5) || "–";
const formatDate = (dateStr) => {
  if (!dateStr) return "–";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

// ─────────────────────────────────────────────
//  Table Detail Modal
// ─────────────────────────────────────────────
const TableDetailModal = ({ table, onClose, onStatusChange }) => {
  if (!table) return null;

  const displayStatus = getDisplayStatus(table);
  const meta = STATUS_META[displayStatus];
  const booking = table.activeBooking;
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Kiểm tra xem bàn có đang trống không (không có booking và status là Available)
  const isTableAvailable = !table.activeBooking && table.status === "Available";

  const handleStatusChange = async (newStatus) => {
    setLoadingStatus(true);
    await onStatusChange(table._id, newStatus);
    setLoadingStatus(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b border-gray-100`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${meta.bg} ${meta.color}`}>
              {table.table_number?.replace(/\D/g, "") || table.table_number?.slice(0, 2) || "?"}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{table.table_number}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                {meta.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* === Thông tin bàn === */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info size={13} /> Thông tin bàn
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow icon={<LayoutGrid size={14} />} label="Loại bàn" value={table.table_type_id?.name || "–"} />
              <InfoRow icon={<BadgeCheck size={14} />} label="Trạng thái bàn" value={
                <span className={`font-semibold ${table.status === "Available" ? "text-gray-600" :
                  table.status === "Maintenance" ? "text-red-500" :
                    "text-amber-600"
                  }`}>
                  {table.status === "Available" ? "Trống" :
                    table.status === "Maintenance" ? "Bảo trì" : "Giữ chỗ"}
                </span>
              } />
              <InfoRow icon={<Circle size={14} />} label="Đơn giá" value={`${table.price?.toLocaleString("vi-VN")}đ/h`} />
              {table.description && (
                <InfoRow icon={<Info size={14} />} label="Mô tả" value={table.description} />
              )}
            </div>
          </section>

          {/* === Thông tin đặt bàn === */}
          {booking ? (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CalendarDays size={13} /> Thông tin đặt bàn
              </h3>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Trạng thái booking</span>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow icon={<Hash size={14} />} label="Mã đặt bàn" value={
                    <span className="font-mono font-bold text-gray-800">{booking.code_number}</span>
                  } />
                  <InfoRow icon={<CalendarDays size={14} />} label="Ngày chơi" value={formatDate(booking.play_date)} />
                  <InfoRow icon={<Clock size={14} />} label="Khung giờ" value={`${formatTime(booking.start_time)} – ${formatTime(booking.end_time)}`} />
                  <InfoRow icon={<Circle size={14} />} label="Giá/giờ" value={`${booking.hour_price?.toLocaleString("vi-VN")}đ`} />
                  <InfoRow icon={<Circle size={14} />} label="Tiền cọc" value={
                    <span className="font-semibold text-orange-600">{booking.deposit?.toLocaleString("vi-VN")}đ</span>
                  } />
                  {booking.total_bill && (
                    <InfoRow icon={<Circle size={14} />} label="Tổng bill" value={
                      <span className="font-semibold text-gray-800">{booking.total_bill?.toLocaleString("vi-VN")}đ</span>
                    } />
                  )}
                </div>

                {/* Khách hàng */}
                {booking.account_id && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={12} /> Khách hàng</p>
                    <div className="grid grid-cols-1 gap-2">
                      <InfoRow icon={<User size={14} />} label="Họ tên" value={booking.account_id.fullname || "–"} />
                      <InfoRow icon={<PhoneCall size={14} />} label="SĐT" value={booking.account_id.phone || "–"} />
                    </div>
                  </div>
                )}

                {booking.note && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Ghi chú: <span className="text-gray-700 font-medium">{booking.note}</span></p>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-400">
              Không có đặt bàn nào đang hoạt động
            </div>
          )}

          {/* === Thay đổi trạng thái bàn - CHỈ HIỂN THỊ KHI BÀN TRỐNG === */}
          {/* === Thay đổi trạng thái bàn - CHỈ HIỂN THỊ KHI BÀN TRỐNG HOẶC ĐANG BẢO TRÌ === */}
          {(isTableAvailable || table.status === "Maintenance") && (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Edit2 size={13} /> Cập nhật trạng thái bàn
              </h3>
              <div className="flex gap-2 flex-wrap">
                {/* Nếu bàn đang trống -> chỉ hiển thị nút chuyển sang bảo trì */}
                {isTableAvailable && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    disabled={loadingStatus}
                    onClick={() => handleStatusChange("Maintenance")}
                  >
                    <Wrench size={14} className="mr-1.5" /> Chuyển sang Bảo trì
                  </Button>
                )}

                {/* Nếu bàn đang bảo trì -> hiển thị nút chuyển về trống */}
                {table.status === "Maintenance" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                    disabled={loadingStatus}
                    onClick={() => handleStatusChange("Available")}
                  >
                    <CheckCircle2 size={14} className="mr-1.5" /> Chuyển về Bàn trống
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {isTableAvailable
                  ? "Chuyển bàn sang trạng thái bảo trì khi cần sửa chữa"
                  : "Bàn đã sửa xong, chuyển về trạng thái sẵn sàng phục vụ"}
              </p>
            </section>
          )}
          {/* Thông báo khi bàn không thể thay đổi trạng thái */}
          {!isTableAvailable && table.status === "Maintenance" && (
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-500">
                Bàn đang trong trạng thái <span className="font-semibold text-red-500">Bảo trì</span>
              </p>
            </div>
          )}

          {!isTableAvailable && booking && (
            <div className="rounded-xl bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-600">
                <span className="font-semibold">⚠️ Không thể thay đổi trạng thái</span>
                <br />
                <span className="text-xs">Bàn đang có đặt bàn hoặc đang được sử dụng</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const InfoRow = ({ icon, label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[11px] text-gray-400 flex items-center gap-1">{icon}{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

const BookingStatusBadge = ({ status }) => {
  const cfg = {
    Playing: { label: "Đang chơi", cls: "bg-green-100 text-green-700" },
    Booked: { label: "Đã đặt", cls: "bg-blue-100 text-blue-700" },
    Pending: { label: "Chờ thanh toán", cls: "bg-amber-100 text-amber-700" },
    Cancelled: { label: "Đã huỷ", cls: "bg-red-100 text-red-600" },
    Completed: { label: "Hoàn thành", cls: "bg-gray-100 text-gray-600" },
  };
  const c = cfg[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.cls}`}>{c.label}</span>
  );
};

// ─────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────
export const StaffClubPageManagerTable = () => {
  const [tables, setTables] = useState([]);
  const [tableTypes, setTableTypes] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    total: 0, available: 0, inUse: 0, booked: 0, holding: 0, maintenance: 0,
  });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedTable, setSelectedTable] = useState(null);

  // ── Fetch tables ──────────────────────────
  const fetchTables = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
        search: debouncedSearch,
        status: statusFilter === "all" ? "" : statusFilter,
        table_type_id: typeFilter === "all" ? "" : typeFilter,
      };
      const res = await getTables(params);
      if (res.data.success) {
        setTables(res.data.data);
        setStatusCounts(res.data.statusCounts);
      }
    } catch {
      toast.error("Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableTypes = async () => {
    try {
      const res = await getTableTypes();
      if (res.data.success) setTableTypes(res.data.data);
    } catch { }
  };

  useEffect(() => { fetchTables(); }, [debouncedSearch, statusFilter, typeFilter]);
  useEffect(() => { fetchTableTypes(); }, []);

  // ── Status change from modal ──────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      const currentTable = tables.find(t => t._id === id);
      if (!currentTable) return;
      const res = await updateTable(id, {
        table_type_id: currentTable.table_type_id?._id || currentTable.table_type_id,
        table_number: currentTable.table_number,
        price: currentTable.price,
        status: newStatus,
      });
      if (res.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchTables();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };

  // ── Filter tabs (client-side by displayStatus) ──
  const filteredTables = tables.filter(t => {
    if (statusFilter === "all") return true;
    const ds = getDisplayStatus(t);
    if (statusFilter === "playing") return ds === "playing";
    if (statusFilter === "booked") return ds === "booked";
    if (statusFilter === "holding") return ds === "holding";
    if (statusFilter === "Available") return ds === "available";
    if (statusFilter === "Maintenance") return ds === "maintenance";
    return true;
  });

  // ── Stat cards ──
  const statCards = [
    { label: "Tổng số bàn", value: statusCounts.total, cls: "text-gray-900" },
    { label: "Đang chơi", value: statusCounts.inUse, cls: "text-green-600" },
    { label: "Đã đặt", value: statusCounts.booked || 0, cls: "text-blue-600" },
    { label: "Đang giữ chỗ", value: statusCounts.holding || 0, cls: "text-amber-600" },
    { label: "Bàn trống", value: statusCounts.available, cls: "text-gray-500" },
    { label: "Bảo trì", value: statusCounts.maintenance, cls: "text-red-400" },
  ];

  return (
    <div className="p-4 md:p-6 w-full max-w-[1440px] mx-auto bg-gray-50/50 min-h-[calc(100vh-80px)]">
      {/* Modal */}
      {selectedTable && (
        <TableDetailModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-1 mb-7">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sơ đồ bàn bi-a</h1>
        <p className="text-gray-500 text-sm">Xem trạng thái và quản lý bàn theo thời gian thực.</p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-white border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black mb-0.5 ${s.cls}`}>{s.value ?? 0}</span>
              <span className="text-[11px] text-gray-400 font-medium text-center leading-tight">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <Input
            className="w-full pl-10 h-10 rounded-lg border-gray-200 bg-white text-sm shadow-sm"
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
        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-gray-500 hover:text-gray-700"
          onClick={fetchTables}
        >
          <RefreshCw size={15} className="mr-1.5" /> Làm mới
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-6 overflow-x-auto no-scrollbar mb-5 border-b border-gray-200 pb-2">
        {[
          { key: "all", label: `Tất cả (${statusCounts.total || 0})` },
          { key: "playing", label: `Đang chơi (${statusCounts.inUse || 0})` },
          { key: "booked", label: `Đã đặt (${statusCounts.booked || 0})` },
          { key: "holding", label: `Giữ chỗ (${statusCounts.holding || 0})` },
          { key: "Available", label: `Bàn trống (${statusCounts.available || 0})` },
          { key: "Maintenance", label: `Bảo trì (${statusCounts.maintenance || 0})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`pb-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 -mb-[9px]
              ${statusFilter === tab.key
                ? "text-green-600 border-green-500"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-100 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTables.map((table) => {
            const ds = getDisplayStatus(table);
            const meta = STATUS_META[ds];
            const booking = table.activeBooking;

            return (
              <div
                key={table._id}
                className={`rounded-xl border ${meta.border} overflow-hidden bg-white shadow-sm flex flex-col h-full transition-all hover:shadow-md cursor-pointer group`}
                onClick={() => setSelectedTable(table)}
              >
                {/* Card Header */}
                <div className="p-4 flex gap-3 border-b border-gray-100">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-black shrink-0 ${meta.bg} ${meta.color}`}>
                    {table.table_number?.replace(/\D/g, "") || table.table_number?.slice(0, 2) || "?"}
                  </div>
                  <div className="flex-1 flex flex-col justify-center overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-bold text-gray-900 text-sm truncate">{table.table_number}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${meta.bg} ${meta.color}`}>
                        {table.table_type_id?.name?.toUpperCase() || "BÀN"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  {/* Booking info snippet */}
                  {booking ? (
                    <div className={`rounded-lg px-3 py-2 ${meta.bg} space-y-1`}>
                      {booking.account_id?.fullname && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <User size={11} className="shrink-0" />
                          <span className="truncate font-medium">{booking.account_id.fullname}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock size={11} className="shrink-0" />
                        <span>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</span>
                        <span className="ml-auto font-mono text-[10px] text-gray-400">{booking.code_number}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <BookingStatusBadge status={booking.status} />
                        <span className="text-[11px] text-gray-400">{formatDate(booking.play_date)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-xs text-gray-400 italic">Không có đặt bàn</span>
                    </div>
                  )}

                  {/* Price row */}
                  <div className="flex justify-between items-center text-xs mt-auto pt-2 border-t border-gray-50">
                    <span className="text-gray-400">Đơn giá</span>
                    <span className="font-semibold text-gray-700">{table.price?.toLocaleString("vi-VN")}đ/h</span>
                  </div>

                  {/* View detail hint */}
                  <div className="text-center">
                    <span className="text-[11px] text-gray-300 group-hover:text-gray-400 transition-colors">
                      Nhấn để xem chi tiết & quản lý
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTables.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3">
              <AlertCircle className="w-12 h-12 text-gray-300" />
              <span className="text-base font-semibold text-gray-700">Không tìm thấy bàn</span>
              <span className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
