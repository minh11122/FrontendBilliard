import { useEffect, useState } from "react";
import { DollarSign, Package, Store, TrendingUp, BarChart3 } from "lucide-react";
import { getRevenueWeb, getRevenueWebSummary } from "@/services/admin.service";

export const AdminSettings = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    packagesSold: 0,
    activeShops: 0,
    growth: "+0%",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + "đ";
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, summaryRes] = await Promise.all([
        getRevenueWeb({ page: 1, limit: 8 }),
        getRevenueWebSummary(),
      ]);

      const list = listRes.data.data;
      const summary = summaryRes.data.data;

      setTransactions(list);
      setStats({
        revenue: summary.total_revenue || 0,
        packagesSold: summary.total_orders || 0,
        activeShops: new Set(list.map((i) => i.club_name)).size,
        growth: "+0%",
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const STAT_CARDS = [
    {
      label: "Tổng doanh thu",
      value: formatPrice(stats.revenue),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
      accent: "border-emerald-200",
    },
    {
      label: "Gói đã bán",
      value: stats.packagesSold,
      icon: Package,
      color: "text-violet-600 bg-violet-50",
      accent: "border-violet-200",
    },
    {
      label: "Shop đã mua",
      value: stats.activeShops,
      icon: Store,
      color: "text-sky-600 bg-sky-50",
      accent: "border-sky-200",
    },
    {
      label: "Tăng trưởng",
      value: stats.growth,
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50",
      accent: "border-amber-200",
      valueClass: "text-emerald-600",
    },
  ];

  const PKG_COLORS = [
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const pkgColorMap = {};
  let pkgColorIdx = 0;
  const getPkgColor = (name) => {
    if (!name) return PKG_COLORS[0];
    if (!pkgColorMap[name]) {
      pkgColorMap[name] = PKG_COLORS[pkgColorIdx % PKG_COLORS.length];
      pkgColorIdx++;
    }
    return pkgColorMap[name];
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .rev-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .rev-row { transition: background 0.12s; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -6px rgba(0,0,0,0.1); }
      `}</style>

      <div className="rev-root max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Quản lý</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thống kê doanh thu</h1>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, accent, valueClass }) => (
            <div key={label} className={`stat-card bg-white border ${accent} rounded-2xl p-5 shadow-sm`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-extrabold ${valueClass ?? "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Chart placeholder ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-gray-800">Doanh thu theo tháng</h2>
          </div>
          <div className="h-56 flex flex-col items-center justify-center gap-2 text-gray-300">
            <BarChart3 className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">Chưa có dữ liệu biểu đồ</p>
          </div>
        </div>

        {/* ── Transactions Table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h2 className="font-bold text-gray-800">Giao dịch gần đây</h2>
            </div>
            {!loading && (
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {transactions.length} giao dịch
              </span>
            )}
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/5" />
                  <div className="h-4 bg-gray-100 rounded w-1/6" />
                  <div className="h-4 bg-gray-100 rounded w-1/6" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <DollarSign className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Chưa có giao dịch</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Cửa hàng", "Gói dịch vụ", "Giá", "Ngày mua"].map((h, i) => (
                    <th key={h} className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 ${i === 0 ? "text-left" : i === 3 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {transactions.map((item) => (
                  <tr key={item._id} className="rev-row hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center shrink-0">
                          <Store className="w-3.5 h-3.5 text-emerald-700" />
                        </div>
                        <span className="font-semibold text-gray-900">{item.club_name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${getPkgColor(item.subscription_name)}`}>
                        {item.subscription_name}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{formatPrice(item.purchase_price)}</span>
                    </td>

                    <td className="px-6 py-4 text-right text-gray-400 text-xs font-medium">
                      {formatDate(item.purchase_date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};