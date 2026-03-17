import { useEffect, useState } from "react";
import {
  Search,
  Store,
  MapPin,
  MoreVertical,
} from "lucide-react";
import { getAllClubs } from "@/services/admin.service";

export const ShopManagement = () => {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchClubs = async () => {
    try {
      const res = await getAllClubs({
        page,
        limit: 10,
        search,
      });

      setClubs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [page, search]);

  const renderStatus = (status) => {
    if (status === "Approved")
      return (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          Approved
        </span>
      );

    if (status === "Pending")
      return (
        <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
          Pending
        </span>
      );

    if (status === "Rejected")
      return (
        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
          Rejected
        </span>
      );

    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Danh sách quán Billiards
        </h1>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Tìm kiếm tên quán..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Quán</th>
              <th className="text-left px-4 py-3">Chủ quán</th>
              <th className="text-left px-4 py-3">Địa chỉ</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {clubs.map((club) => (
              <tr key={club._id} className="hover:bg-slate-50">
                {/* Club */}
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Store className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="font-medium">{club.name}</p>
                  </div>
                </td>

                {/* Owner */}
                <td className="px-4 py-3">
                  {club.account_id?.fullname}
                </td>

                {/* Address */}
                <td className="px-4 py-3 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {club.address}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {renderStatus(club.status)}
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
      <div className="flex justify-between items-center text-sm">
        <p>
          Trang {pagination.page} / {pagination.totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};