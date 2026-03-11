import { useState } from "react";
import {
  Search,
  Filter,
  User,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";

export const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const accounts = [
    {
      id: 1,
      fullname: "Nguyễn Văn A",
      email: "admin@gmail.com",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: "01/03/2026",
    },
    {
      id: 2,
      fullname: "Trần Văn B",
      email: "staff@gmail.com",
      role: "STAFF_SYSTEM",
      status: "ACTIVE",
      createdAt: "02/03/2026",
    },
    {
      id: 3,
      fullname: "Lê Văn C",
      email: "user@gmail.com",
      role: "USER",
      status: "BLOCKED",
      createdAt: "05/03/2026",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Page title */}
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
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filter role */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF_SYSTEM">System Staff</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tài khoản</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Ngày tạo</th>
              <th className="text-right px-4 py-3 font-medium">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-slate-50">

                {/* User */}
                <td className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="font-medium text-slate-900">
                      {acc.fullname}
                    </p>
                    <p className="text-xs text-slate-500">
                      {acc.email}
                    </p>
                  </div>
                </td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                    <ShieldCheck className="h-3 w-3" />
                    {acc.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {acc.status === "ACTIVE" ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      Blocked
                    </span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-slate-600">
                  {acc.createdAt}
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
        <p>Hiển thị 1 - 10 / 50 tài khoản</p>

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