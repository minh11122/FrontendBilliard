import { useEffect, useMemo, useState } from "react";
import { CreditCard, Search } from "lucide-react";

import { transactionService } from "@/services/transaction.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TYPE_META = {
  BOOKING_DEPOSIT: "Cọc đặt bàn",
  BOOKING_FINAL_PAYMENT_TRANSFER: "Chuyển khoản thanh toán nốt",
  BOOKING_FINAL_PAYMENT_CASH: "Thanh toán nốt (tiền mặt)",
};

const STATUS_META = {
  all: "Tất cả trạng thái",
  SUCCESS: "Thành công",
  PENDING: "Đang xử lý",
};

const StatusPill = ({ status }) => {
  const map = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  const cls = map[status] || "bg-gray-50 text-gray-700 border-gray-200";
  const label = status === "SUCCESS" ? "Thành công" : status === "PENDING" ? "Đang xử lý" : status;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
};

const formatMoney = (n) => `${(Number(n) || 0).toLocaleString("vi-VN")}đ`;
const formatDateTime = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

const getContentLabel = (tx) => {
  const typeLabel = TYPE_META[tx.transaction_type] || "Giao dịch";
  if (tx.booking?.code_number) {
    return `${typeLabel} cho booking ${tx.booking.code_number} - bàn ${tx.table?.table_number || "—"}`;
  }
  if (tx.description) return `${typeLabel}: ${tx.description}`;
  return typeLabel;
};

export default function StaffClubPaymentHistoryPage() {
  const PAGE_SIZE = 10;
  // Staff-club: thường club_id đã nằm trong token, nhưng vẫn cho phép fallback từ localStorage
  const clubIdFromStorage = localStorage.getItem("selected_club_id") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await transactionService.getClubTransferHistory(clubIdFromStorage);
      if (res?.data?.success) setTransactions(res.data.data || []);
      else setError(res?.data?.message || "Không thể tải lịch sử");
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải lịch sử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((tx) => {
      const matchType = typeFilter === "all" || tx.transaction_type === typeFilter;
      const matchStatus = statusFilter === "all" || tx.status === statusFilter;
      if (!matchType || !matchStatus) return false;
      const player = tx.player?.fullname || tx.player?.email || "";
      const booking = tx.booking?.code_number || "";
      const table = tx.table?.table_number || "";
      const club = tx.club?.name || "";
      const type = TYPE_META[tx.transaction_type] || tx.transaction_type || "";
      const desc = getContentLabel(tx);
      return `${player} ${booking} ${table} ${club} ${type} ${desc}`.toLowerCase().includes(q);
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  const transactionTypeOptions = useMemo(() => {
    return [...new Set(transactions.map((tx) => tx.transaction_type).filter(Boolean))];
  }, [transactions]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Lịch sử chuyển khoản của CLB</h1>
            <p className="text-slate-500 mt-1">Theo dõi giao dịch liên quan đặt bàn.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[340px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="w-full pl-9 h-11 rounded-xl bg-white border-slate-200"
                placeholder="Tìm theo khách, booking, bàn, loại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option value="all">Tất cả loại giao dịch</option>
              {transactionTypeOptions.map((type) => (
                <option key={type} value={type}>{TYPE_META[type] || type}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm">
              {Object.entries(STATUS_META).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-800">Giao dịch</h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {transactions.length} bản ghi
              </span>
            </div>
            <Button variant="outline" className="rounded-xl" onClick={fetchData} disabled={loading}>
              Làm mới
            </Button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Đang tải...</div>
          ) : error ? (
            <div className="p-6 bg-red-50 border-t border-red-100 text-red-800">
              <div className="font-bold">Lỗi</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">Chưa có giao dịch</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Thời gian</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Khách</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Booking</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Loại</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Nội dung</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold text-right">Số tiền</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(tx.transaction_time)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-semibold text-slate-800">{tx.player?.fullname || "Khách ẩn danh"}</div>
                        {tx.player?.email ? <div className="text-xs text-slate-500 mt-0.5">{tx.player.email}</div> : null}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {tx.booking?.code_number ? (
                          <div>
                            <div className="font-semibold text-slate-800">{tx.booking.code_number}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Bàn {tx.table?.table_number || "—"}</div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        {TYPE_META[tx.transaction_type] || tx.transaction_type || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {getContentLabel(tx)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-emerald-700">
                        {formatMoney(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 text-sm text-slate-500">
              <span>
                Hien thi {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} giao dich
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Truoc
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
          )}
        </div>
      </div>
    </div>
  );
}

