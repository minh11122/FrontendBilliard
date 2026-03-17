import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  User,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";
import { getAccounts } from "@/services/admin.service";

export const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchAccounts = async (page = 1) => {
    try {
      const res = await getAccounts({
        page,
        limit: 10,
        search,
        role: roleFilter,
      });

      setAccounts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts(1);
  }, []);

  return (
    <div className="p-6 space-y-6">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Quản lý tài khoản
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý tất cả tài khoản trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm email hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm"
          />
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="CUSTOMER">Customer</option>
            <option value="STAFF_CLUB">Staff</option>
            <option value="OWNER">Owner</option>
          </select>

          <button
            onClick={() => fetchAccounts(1)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">Tài khoản</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Ngày tạo</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {accounts.map((acc) => (
              <tr key={acc._id} className="hover:bg-slate-50">

                {/* User */}
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="font-medium">{acc.fullname}</p>
                    <p className="text-xs text-slate-500">{acc.email}</p>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-600">
                    <ShieldCheck className="h-3 w-3" />
                    {acc.role_id?.name}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      acc.status === "ACTIVE"
                        ? "text-green-600 bg-green-50"
                        : "text-yellow-600 bg-yellow-50"
                    }`}
                  >
                    {acc.status}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-slate-600">
                  {new Date(acc.created_at).toLocaleDateString()}
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
        <p>
          Trang {pagination.page} / {pagination.totalPages} — {pagination.total} tài khoản
        </p>

        <div className="flex gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => fetchAccounts(pagination.page - 1)}
            className="px-3 py-1 border rounded-lg"
          >
            Trước
          </button>

          {[...Array(pagination.totalPages || 1)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchAccounts(i + 1)}
              className={`px-3 py-1 border rounded-lg ${
                pagination.page === i + 1
                  ? "bg-emerald-50 text-emerald-600"
                  : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchAccounts(pagination.page + 1)}
            className="px-3 py-1 border rounded-lg"
          >
            Sau
          </button>
        </div>
      </div>

    </div>
  );
};