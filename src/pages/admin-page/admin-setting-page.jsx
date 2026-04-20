import { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  Store,
  TrendingUp,
  BarChart3,
  CalendarRange,
  ShoppingBag,
  Receipt,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { getRevenueWeb, getRevenueWebSummary } from "@/services/admin.service";


const MONTH_LABELS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];


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


const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price || 0);


const formatCompactPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(price || 0);


const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });


export const AdminSettings = () => {
  const currentYear = new Date().getFullYear();
  const [summary, setSummary] = useState({
    total_revenue: 0,
    total_orders: 0,
  });
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);


  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, summaryRes] = await Promise.all([
        getRevenueWeb({ page: 1, limit: 5000, sortBy: "purchase_date", order: "desc" }),
        getRevenueWebSummary(),
      ]);


      const list = listRes.data?.data || [];
      const summaryData = summaryRes.data?.data || {};
      const years = [...new Set(list.map((item) => new Date(item.purchase_date).getFullYear()))]
        .filter(Boolean)
        .sort((a, b) => b - a);


      setAllTransactions(list);
      setSummary({
        total_revenue: summaryData.total_revenue || 0,
        total_orders: summaryData.total_orders || 0,
      });


      if (years.length > 0 && !years.includes(currentYear)) {
        setSelectedYear(years[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);


  const availableYears = [...new Set(allTransactions.map((item) => new Date(item.purchase_date).getFullYear()))]
    .filter(Boolean)
    .sort((a, b) => b - a);


  const filteredTransactions = allTransactions.filter(
    (item) => new Date(item.purchase_date).getFullYear() === selectedYear,
  );


  const previousYearTransactions = allTransactions.filter(
    (item) => new Date(item.purchase_date).getFullYear() === selectedYear - 1,
  );


  const totalRevenue = filteredTransactions.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
  const totalOrders = filteredTransactions.length;
  const activeShops = new Set(filteredTransactions.map((item) => item.club_name).filter(Boolean)).size;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;


  const previousRevenue = previousYearTransactions.reduce(
    (sum, item) => sum + (item.purchase_price || 0),
    0,
  );
  const growthValue = previousRevenue
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
    : totalRevenue > 0
      ? 100
      : 0;
  const growthLabel = `${growthValue >= 0 ? "+" : ""}${growthValue.toFixed(1)}%`;


  const monthlyRevenue = MONTH_LABELS.map((label, index) => {
    const month = index + 1;
    const monthItems = filteredTransactions.filter(
      (item) => new Date(item.purchase_date).getMonth() + 1 === month,
    );
    const revenue = monthItems.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    return {
      month: label,
      revenue,
      orders: monthItems.length,
    };
  });


  const bestMonth =
    monthlyRevenue.reduce((best, item) => (item.revenue > best.revenue ? item : best), {
      month: "T1",
      revenue: 0,
      orders: 0,
    }) || { month: "T1", revenue: 0, orders: 0 };


  const topPackages = Object.values(
    filteredTransactions.reduce((acc, item) => {
      const key = item.subscription_name || "Khac";
      if (!acc[key]) {
        acc[key] = { name: key, revenue: 0, orders: 0 };
      }
      acc[key].revenue += item.purchase_price || 0;
      acc[key].orders += 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);


  const topClubs = Object.values(
    filteredTransactions.reduce((acc, item) => {
      const key = item.club_name || "Khong ro";
      if (!acc[key]) {
        acc[key] = { name: key, revenue: 0, orders: 0 };
      }
      acc[key].revenue += item.purchase_price || 0;
      acc[key].orders += 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);


  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
    .slice(0, 8);


  const statCards = [
    {
      label: `Doanh thu ${selectedYear}`,
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
      accent: "border-emerald-200",
    },
    {
      label: "Tong so giao dich",
      value: totalOrders,
      icon: Receipt,
      color: "text-violet-600 bg-violet-50",
      accent: "border-violet-200",
    },
    {
      label: "Shop phat sinh giao dich",
      value: activeShops,
      icon: Store,
      color: "text-sky-600 bg-sky-50",
      accent: "border-sky-200",
    },
    {
      label: "Gia tri don trung binh",
      value: formatPrice(avgOrderValue),
      icon: ShoppingBag,
      color: "text-amber-600 bg-amber-50",
      accent: "border-amber-200",
    },
    {
      label: "Tang truong so voi nam truoc",
      value: growthLabel,
      icon: TrendingUp,
      color: "text-rose-600 bg-rose-50",
      accent: "border-rose-200",
      valueClass: growthValue >= 0 ? "text-emerald-600" : "text-rose-600",
    },
    {
      label: "Doanh thu all time",
      value: formatPrice(summary.total_revenue),
      icon: Package,
      color: "text-teal-600 bg-teal-50",
      accent: "border-teal-200",
    },
  ];


  const topPackageMax = topPackages[0]?.revenue || 1;
  const topClubMax = topClubs[0]?.revenue || 1;


  return (
    <div className="min-h-screen bg-gray-50/60 p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .rev-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .rev-row { transition: background 0.12s; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -6px rgba(0,0,0,0.1); }
        .panel-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .panel-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -10px rgba(0,0,0,0.12); }
        .rev-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
      `}</style>


      <div className="rev-root max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
              Quan ly
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Thong ke doanh thu
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tong hop doanh thu, xu huong theo thang, top goi va top shop.
            </p>
          </div>


          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Nam thong ke
              </p>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rev-input border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700"
              >
                {(availableYears.length > 0 ? availableYears : [currentYear]).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>


        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, accent, valueClass }) => (
            <div key={label} className={`stat-card bg-white border ${accent} rounded-2xl p-5 shadow-sm`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                {label}
              </p>
              <p className={`text-2xl font-extrabold ${valueClass ?? "text-gray-900"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>


        <div className="grid xl:grid-cols-[1.6fr_1fr] gap-6">
          <div className="panel-card bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <h2 className="font-bold text-gray-800">Doanh thu theo thang</h2>
              </div>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {selectedYear}
              </span>
            </div>


            {loading ? (
              <div className="h-80 px-6 py-6">
                <div className="h-full w-full rounded-2xl bg-gray-100 animate-pulse" />
              </div>
            ) : monthlyRevenue.some((item) => item.revenue > 0) ? (
              <div className="h-80 px-4 py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecf0f3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCompactPrice(value)}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(value, name) => [
                        name === "Doanh thu" ? formatPrice(value) : value,
                        name,
                      ]}
                    />
                    <Bar dataKey="revenue" name="Doanh thu" radius={[10, 10, 0, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center gap-2 text-gray-300">
                <BarChart3 className="w-10 h-10 opacity-40" />
                <p className="text-sm font-medium">Chua co du lieu bieu do</p>
              </div>
            )}
          </div>


          <div className="space-y-6">
            <div className="panel-card bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-500" />
                <h2 className="font-bold text-gray-800">Top goi dich vu</h2>
              </div>
              <div className="px-6 py-5 space-y-4">
                {topPackages.length === 0 ? (
                  <p className="text-sm text-gray-400">Chua co du lieu goi dich vu.</p>
                ) : (
                  topPackages.map((pkg) => (
                    <div key={pkg.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPkgColor(pkg.name)}`}>
                          {pkg.name}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatPrice(pkg.revenue)}</p>
                          <p className="text-xs text-gray-400">{pkg.orders} giao dich</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${(pkg.revenue / topPackageMax) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>


            <div className="panel-card bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-gray-800">Diem nhan nam {selectedYear}</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                    Thang tot nhat
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-700">{bestMonth.month}</p>
                  <p className="text-sm text-emerald-600 mt-1">{formatPrice(bestMonth.revenue)}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 mb-1">
                    Don hang thang tot nhat
                  </p>
                  <p className="text-2xl font-extrabold text-sky-700">{bestMonth.orders}</p>
                  <p className="text-sm text-sky-600 mt-1">giao dich</p>
                </div>
                <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 mb-1">
                    Ty trong nam {selectedYear}
                  </p>
                  <p className="text-2xl font-extrabold text-violet-700">
                    {summary.total_revenue
                      ? `${((totalRevenue / summary.total_revenue) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                  <p className="text-sm text-violet-600 mt-1">
                    so voi tong doanh thu all time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid xl:grid-cols-[1fr_1.2fr] gap-6">
          <div className="panel-card bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-sky-500" />
              <h2 className="font-bold text-gray-800">Top shop theo doanh thu</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {topClubs.length === 0 ? (
                <p className="text-sm text-gray-400">Chua co du lieu cua hang.</p>
              ) : (
                topClubs.map((club, index) => (
                  <div key={club.name} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-extrabold shrink-0">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{club.name}</p>
                          <p className="text-xs text-gray-400">{club.orders} giao dich</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(club.revenue)}</p>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${(club.revenue / topClubMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>


          <div className="panel-card bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <h2 className="font-bold text-gray-800">Giao dich gan day</h2>
              </div>
              {!loading && (
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {recentTransactions.length} / {filteredTransactions.length}
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
            ) : recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                <DollarSign className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">Chua co giao dich</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Cua hang", "Goi dich vu", "Gia", "Ngay mua"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 ${
                          i === 3 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>


                <tbody className="divide-y divide-gray-50">
                  {recentTransactions.map((item) => (
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
    </div>
  );
};



