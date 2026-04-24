import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CreditCard, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";


import { AuthContext } from "@/context/AuthContext";
import { transactionService } from "@/services/transaction.service";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const TYPE_META = {
  BOOKING_DEPOSIT: "Cọc đặt bàn",
  BOOKING_FINAL_PAYMENT_TRANSFER: "Chuyển khoản thanh toán nốt",
  BOOKING_FINAL_PAYMENT_CASH: "Thanh toán nốt (tiền mặt)",
  TOURNAMENT_FEE: "Phí tham gia giải đấu",
  SUBSCRIPTION: "Thanh toán gói subscription",
};

const STATUS_META = {
  all: "Tất cả trạng thái",
  SUCCESS: "Thành công",
  PENDING: "Đang xử lý",
};


const StatusPill = ({ status }) => {
  const map = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    SUCCESS: "bg-green-50 text-green-700 border-green-200",
  };
  const cls = map[status] || "bg-gray-50 text-gray-700 border-gray-200";
  const label = status === "SUCCESS" ? "Thành công" : status === "PENDING" ? "Đang xử lý" : status;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
};


const formatMoney = (n) => {
  if (n === null || n === undefined) return "0đ";
  const num = Number(n) || 0;
  return `${num.toLocaleString("vi-VN")}đ`;
};


const formatDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN");
};


const getContentLabel = (tx) => {
  const typeLabel = TYPE_META[tx.transaction_type] || "Giao dịch";
  if (tx.booking?.code_number) {
    const tablePart = tx.table?.table_number ? ` - Bàn ${tx.table.table_number}` : "";
    const clubPart = tx.club?.name ? ` (${tx.club.name})` : "";
    return `${typeLabel} cho booking ${tx.booking.code_number}${tablePart}${clubPart}`;
  }
  if (tx.tournament?.name) return `${typeLabel}: ${tx.tournament.name}`;
  if (tx.description) return `${typeLabel}: ${tx.description}`;
  return "—";
};


export const PaymentHistoryPage = () => {
  const ITEMS_PER_PAGE = 15;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    if (!user?.id) {
      toast("Vui lòng đăng nhập để xem lịch sử chuyển khoản", { icon: "🔒" });
      navigate("/auth/login");
      return;
    }


    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await transactionService.getMyTransferHistory();
        if (res?.data?.success) {
          setTransactions(res.data.data || []);
        } else {
          setError(res?.data?.message || "Không thể tải lịch sử");
        }
      } catch (e) {
        setError(e?.response?.data?.message || "Không thể tải lịch sử");
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, [user?.id, navigate]);


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchType = typeFilter === "all" || tx.transaction_type === typeFilter;
      const matchStatus = statusFilter === "all" || tx.status === statusFilter;
      if (!matchType || !matchStatus) return false;
      if (!q) return true;
      const typeText = TYPE_META[tx.transaction_type] || tx.transaction_type || "";
      const text = `${typeText} ${tx.transaction_type || ""} ${tx.description || ""} ${getContentLabel(tx)}`.toLowerCase();
      return text.includes(q);
    });
  }, [transactions, search, typeFilter, statusFilter]);


  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedTransactions = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [filtered, currentPage],
  );


  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  const transactionTypeOptions = useMemo(() => {
    const uniqueTypes = [...new Set(transactions.map((tx) => tx.transaction_type).filter(Boolean))];
    return uniqueTypes;
  }, [transactions]);


  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);


  return (
    <div className="min-h-screen bg-white  text-slate-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Lịch sử chuyển khoản</h1>
            <p className="text-slate-500 mt-1">
              Xem các giao dịch nạp/cọc/thanh toán bạn đã thực hiện.
            </p>
          </div>


          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="w-full pl-9 h-11 rounded-xl bg-white border-slate-200"
                placeholder="Tìm theo nội dung hoặc loại giao dịch..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="all">Tất cả loại giao dịch</option>
              {transactionTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {TYPE_META[type] || type}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              {Object.entries(STATUS_META).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>


        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-slate-800">Giao dịch</h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {transactions.length} bản ghi
              </span>
            </div>
          </div>


          {loading ? (
            <div className="p-8 text-center text-slate-500">Đang tải...</div>
          ) : error ? (
            <div className="p-6 bg-red-50 border-t border-red-100 text-red-800">
              <div className="font-bold">Lỗi</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <div className="font-semibold">Chưa có giao dịch phù hợp</div>
              <div className="text-sm mt-1">Hãy thử từ khóa khác.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Thời gian</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Loại</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Nội dung</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold text-right">Số tiền</th>
                    <th className="px-6 py-3 text-xs uppercase text-slate-500 font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDateTime(tx.transaction_time)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        {TYPE_META[tx.transaction_type] || tx.transaction_type || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {getContentLabel(tx)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-green-700">
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
        </div>


        {filtered.length > 0 && (
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-500">
              Trang <span className="font-bold text-slate-900">{currentPage}</span> / {totalPages}
            </p>


            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" /> Truoc
              </Button>


              <Button
                type="button"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="rounded-xl"
              >
                Sau <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}


        <div className="mt-5 text-xs text-slate-500">
          Lưu ý: một số giao dịch chưa hoàn tất có thể hiển thị trạng thái “Đang xử lý”.
        </div>
      </div>
    </div>
  );
};


export default PaymentHistoryPage;





