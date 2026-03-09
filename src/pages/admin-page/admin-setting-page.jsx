import {
  DollarSign,
  Package,
  Store,
  TrendingUp,
} from "lucide-react";

export const AdminSettings = () => {

  const stats = {
    revenue: "120,000,000đ",
    packagesSold: 245,
    activeShops: 180,
    growth: "+18%",
  };

  const transactions = [
    {
      id: 1,
      shop: "Billiards King Club",
      package: "Pro",
      price: "499,000đ",
      date: "10/03/2026",
    },
    {
      id: 2,
      shop: "Pro Billiards",
      package: "Basic",
      price: "199,000đ",
      date: "09/03/2026",
    },
    {
      id: 3,
      shop: "Legend Billiards",
      package: "Enterprise",
      price: "999,000đ",
      date: "08/03/2026",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Thống kê doanh thu gói dịch vụ
        </h1>
        <p className="text-sm text-slate-500">
          Tổng quan doanh thu từ các gói dịch vụ của hệ thống
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="text-emerald-500" />
            <div>
              <p className="text-sm text-slate-500">Tổng doanh thu</p>
              <p className="text-lg font-bold">{stats.revenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Package className="text-emerald-500" />
            <div>
              <p className="text-sm text-slate-500">Gói đã bán</p>
              <p className="text-lg font-bold">{stats.packagesSold}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Store className="text-emerald-500" />
            <div>
              <p className="text-sm text-slate-500">Shop đang dùng</p>
              <p className="text-lg font-bold">{stats.activeShops}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-emerald-500" />
            <div>
              <p className="text-sm text-slate-500">Tăng trưởng</p>
              <p className="text-lg font-bold text-emerald-600">
                {stats.growth}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">

        <h2 className="text-lg font-semibold mb-4">
          Doanh thu theo tháng
        </h2>

        <div className="h-60 flex items-center justify-center text-slate-400">
          (Biểu đồ doanh thu sẽ hiển thị tại đây)
        </div>

      </div>

      {/* Transactions table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold">Giao dịch gần đây</h2>
        </div>

        <table className="w-full text-sm">

          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Cửa hàng</th>
              <th className="text-left px-4 py-3 font-medium">Gói</th>
              <th className="text-left px-4 py-3 font-medium">Giá</th>
              <th className="text-left px-4 py-3 font-medium">Ngày</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {transactions.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">

                <td className="px-4 py-3 font-medium">
                  {item.shop}
                </td>

                <td className="px-4 py-3">
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-1 text-xs rounded-full">
                    {item.package}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {item.price}
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {item.date}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};