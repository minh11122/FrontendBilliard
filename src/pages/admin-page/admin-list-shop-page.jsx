import { useEffect, useState } from "react";
import { Search, Store, MapPin, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getAllClubs } from "@/services/admin.service";

const STATUS_STYLE = {
  Approved: { cls: "bg-emerald-100 text-emerald-700 border border-emerald-200", icon: CheckCircle2 },
  Pending:  { cls: "bg-amber-100 text-amber-700 border border-amber-200",   icon: Clock },
  Rejected: { cls: "bg-rose-100 text-rose-700 border border-rose-200",     icon: XCircle },
};

export const ShopManagement = () => {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const res = await getAllClubs({ page, limit: 10, search });
      setClubs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClubs(); }, [page, search]);

  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.page || page;

  const statusCounts = clubs.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50/60 p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .shop-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .shop-row { transition: background 0.12s; }
        .shop-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
      `}</style>

      <div className="shop-root max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Quản lý</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Danh sách quán Billiards</h1>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Tổng quán", value: pagination.total ?? clubs.length, color: "text-emerald-600 bg-emerald-50", icon: Store },
            { label: "Đã duyệt",  value: statusCounts["Approved"] ?? "—",  color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2 },
            { label: "Chờ duyệt", value: statusCounts["Pending"]  ?? "—",  color: "text-amber-600 bg-amber-50",    icon: Clock },
            { label: "Từ chối",   value: statusCounts["Rejected"] ?? "—",  color: "text-rose-600 bg-rose-50",      icon: XCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className={`p-2 rounded-xl ${color}`}><Icon className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-bold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm tên quán..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              className="shop-input w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Quán", "Chủ quán", "Địa chỉ", "Trạng thái"].map((h, i) => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(4)].map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? "60%" : "50%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : clubs.map((club) => {
                    const s = STATUS_STYLE[club.status];
                    const StatusIcon = s?.icon;
                    return (
                      <tr key={club._id} className="shop-row hover:bg-gray-50/80">

                        {/* Club */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center shrink-0">
                              <Store className="h-4 w-4 text-emerald-700" />
                            </div>
                            <span className="font-semibold text-gray-900">{club.name}</span>
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="px-6 py-4 text-gray-600 font-medium">
                          {club.account_id?.fullname ?? "—"}
                        </td>

                        {/* Address */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="text-xs">{club.address}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {s ? (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
                              <StatusIcon className="w-3 h-3" />
                              {club.status}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">{club.status}</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {!loading && clubs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <Store className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Không tìm thấy quán nào</p>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Trang <span className="font-bold text-gray-800">{currentPage}</span> / {totalPages}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};