import { useState } from "react";
import {
  Search,
  Store,
  MapPin,
  Star,
  MoreVertical,
} from "lucide-react";

export const ShopManagement = () => {
  const [search, setSearch] = useState("");

  const shops = [
    {
      id: 1,
      name: "Billiards King Club",
      owner: "Nguyễn Văn A",
      address: "Hà Nội",
      rating: 4.5,
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "Pro Billiards",
      owner: "Trần Văn B",
      address: "TP HCM",
      rating: 4.2,
      status: "PENDING",
    },
    {
      id: 3,
      name: "Legend Billiards",
      owner: "Lê Văn C",
      address: "Đà Nẵng",
      rating: 3.9,
      status: "CLOSED",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Danh sách quán Billiards
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý tất cả quán billiards trong hệ thống
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Tìm kiếm tên quán..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Quán</th>
              <th className="text-left px-4 py-3 font-medium">Chủ quán</th>
              <th className="text-left px-4 py-3 font-medium">Địa chỉ</th>
              <th className="text-left px-4 py-3 font-medium">Rating</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-slate-50">

                {/* Shop */}
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Store className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="font-medium text-slate-900">
                      {shop.name}
                    </p>
                  </div>
                </td>

                {/* Owner */}
                <td className="px-4 py-3 text-slate-600">
                  {shop.owner}
                </td>

                {/* Address */}
                <td className="px-4 py-3 flex items-center gap-1 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {shop.address}
                </td>

                {/* Rating */}
                <td className="px-4 py-3 flex items-center gap-1 text-slate-600">
                  <Star className="h-4 w-4 text-yellow-400" />
                  {shop.rating}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {shop.status === "ACTIVE" && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}

                  {shop.status === "PENDING" && (
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  )}

                  {shop.status === "CLOSED" && (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      Closed
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <button className="p-2 rounded-lg hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4 text-slate-500" />
                  </button>
                </td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-slate-500">
        <p>Hiển thị 1 - 10 / 25 quán</p>

        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded-lg hover:bg-slate-50">
            Trước
          </button>

          <button className="px-3 py-1 border rounded-lg bg-emerald-50 text-emerald-600">
            1
          </button>

          <button className="px-3 py-1 border rounded-lg hover:bg-slate-50">
            2
          </button>

          <button className="px-3 py-1 border rounded-lg hover:bg-slate-50">
            Sau
          </button>
        </div>
      </div>

    </div>
  );
};