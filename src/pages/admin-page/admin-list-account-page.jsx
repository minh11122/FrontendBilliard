import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Ban,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import {
  getAccounts,
  toggleBanAccount,
  deleteAccount,
  createAccount,
} from "@/services/admin.service";

const STATUS_STYLE = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  BANNED: "bg-rose-100 text-rose-700 border border-rose-200",
  PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
};

const ROLE_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

const roleColorMap = {};
let roleColorIdx = 0;
const getRoleColor = (role) => {
  if (!role) return ROLE_COLORS[0];
  if (!roleColorMap[role]) {
    roleColorMap[role] = ROLE_COLORS[roleColorIdx % ROLE_COLORS.length];
    roleColorIdx++;
  }
  return roleColorMap[role];
};

const Avatar = ({ src, name, size = "sm" }) => {
  const dim = size === "lg" ? "w-14 h-14 text-xl" : "w-9 h-9 text-sm";
  return (
    <div
      className={`${dim} rounded-full overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center shrink-0`}
    >
      {src ? (
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-emerald-700">
          {name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      )}
    </div>
  );
};

export const AccountManagement = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "", // 👈 THÊM
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async (page = 1) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(1);
  }, []);

  const handleBan = async (id, status) => {
    try {
      await toggleBanAccount(id);
      toast.success(
        status === "BANNED" ? "Đã bỏ ban tài khoản" : "Đã ban tài khoản",
      );
      fetchAccounts(pagination.page);
    } catch {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-800">
            Bạn chắc chắn muốn xóa tài khoản?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={async () => {
                try {
                  await deleteAccount(id);
                  toast.success("Đã xóa tài khoản");
                  fetchAccounts(pagination.page);
                } catch {
                  toast.error("Xóa thất bại");
                }
                toast.dismiss(t.id);
              }}
              className="px-3 py-1.5 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      ),
      { duration: 5000 },
    );
  };

  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.page || 1;

  const pageNumbers = (() => {
    const pages = [];
    const delta = 1;
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  })();

  const handleCreate = async () => {
    try {
      const res = await createAccount({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });

      toast.success(res.data.message || "Tạo nhân viên thành công");

      setShowCreateModal(false);
      setForm({ fullname: "", email: "", password: "", phone: "" });
      fetchAccounts(1);
    } catch (error) {
      console.log(error); // 👈 debug

      toast.error(error?.response?.data?.message || "Tạo thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .acc-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .acc-row { transition: background 0.12s; }
        .acc-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .modal-overlay { animation: fadeIn 0.18s ease; }
        .modal-box { animation: slideUp 0.2s ease; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
      <Toaster position="top-right" />

      <div className="acc-root max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
              Quản lý
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Tài khoản hệ thống
            </h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-200 transition-all"
          >
            + Tạo nhân viên
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Tổng tài khoản",
              value: pagination.total ?? 0,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Trang hiện tại",
              value: `${currentPage} / ${totalPages}`,
              color: "text-violet-600 bg-violet-50",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              <div className={`p-2 rounded-xl ${color}`}>
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm font-bold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm email hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAccounts(1)}
              className="acc-input w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="acc-input border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition-all"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF_SYSTEM">Staff System</option>
              <option value="STAFF_CLUB">Staff Club</option>
              <option value="OWNER">Owner</option>
            </select>

            <button
              onClick={() => fetchAccounts(1)}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-200 transition-all"
            >
              Lọc
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Tài khoản",
                  "Vai trò",
                  "Trạng thái",
                  "Ngày tạo",
                  "Hành động",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-400 ${i === 4 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div
                            className="h-4 bg-gray-100 rounded animate-pulse"
                            style={{ width: j === 0 ? "70%" : "50%" }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : accounts.map((acc) => (
                    <tr
                      key={acc._id}
                      className="acc-row hover:bg-gray-50/80 cursor-pointer"
                      onDoubleClick={() => {
                        setSelectedAccount(acc);
                        setShowModal(true);
                      }}
                    >
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar src={acc.avatar_url} name={acc.fullname} />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {acc.fullname}
                            </p>
                            <p className="text-xs text-gray-400">{acc.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleColor(acc.role_id?.name)}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {acc.role_id?.name}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[acc.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {acc.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {new Date(acc.created_at).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBan(acc._id, acc.status);
                            }}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                              acc.status === "BANNED"
                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {acc.status === "BANNED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Ban className="w-3.5 h-3.5" />
                            )}
                            {acc.status === "BANNED" ? "Bỏ ban" : "Ban"}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(acc._id);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && accounts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <User className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">Không tìm thấy tài khoản</p>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">
            Trang <span className="font-bold text-gray-800">{currentPage}</span>{" "}
            / {totalPages}
            <span className="ml-2 text-gray-400">
              — {pagination.total} tài khoản
            </span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => fetchAccounts(currentPage - 1)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>

            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => fetchAccounts(n)}
                className={`w-8 h-8 text-sm font-bold rounded-lg transition-colors ${
                  n === currentPage
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => fetchAccounts(currentPage + 1)}
              className="flex items-center gap-1 text-sm font-semibold text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ DETAIL MODAL ══ */}
      {showModal && selectedAccount && (
        <div
          className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedAccount.avatar_url}
                    name={selectedAccount.fullname}
                    size="lg"
                  />
                  <div>
                    <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-0.5">
                      Chi tiết tài khoản
                    </p>
                    <h2 className="text-white text-lg font-extrabold leading-tight">
                      {selectedAccount.fullname}
                    </h2>
                    <p className="text-emerald-100 text-xs mt-0.5">
                      {selectedAccount.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Vai trò
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleColor(selectedAccount.role_id?.name)}`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {selectedAccount.role_id?.name}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Trạng thái
                  </p>
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[selectedAccount.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {selectedAccount.status}
                  </span>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Số điện thoại
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedAccount.phone || "Không có"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Ngày tạo
                  </p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedAccount.created_at).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══ CREATE MODAL (SYNC DETAIL UI) ══ */}
      {showCreateModal && (
        <div
          className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner giống DETAIL */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={form.fullname} size="lg" />
                  <div>
                    <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-0.5">
                      Tạo nhân viên
                    </p>
                    <h2 className="text-white text-lg font-extrabold leading-tight">
                      {form.fullname || "Nhân viên mới"}
                    </h2>
                    <p className="text-emerald-100 text-xs mt-0.5">
                      {form.email || "email@example.com"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body giống DETAIL nhưng là INPUT */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* FULLNAME */}
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Họ tên
                  </p>
                  <input
                    value={form.fullname}
                    onChange={(e) =>
                      setForm({ ...form, fullname: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm acc-input"
                    placeholder="Nhập họ tên..."
                  />
                </div>

                {/* EMAIL */}
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Email
                  </p>
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm acc-input"
                    placeholder="Nhập email..."
                  />
                </div>

                {/* PHONE */}
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Số điện thoại
                  </p>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm acc-input"
                    placeholder="Nhập số điện thoại..."
                  />
                </div>

                {/* PASSWORD */}
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Mật khẩu
                  </p>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm acc-input"
                    placeholder="Nhập mật khẩu..."
                  />
                </div>

                {/* ROLE FIXED */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Vai trò
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">
                    <ShieldCheck className="w-3 h-3" />
                    STAFF_SYSTEM
                  </span>
                </div>

                {/* STATUS */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Trạng thái
                  </p>
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Footer giống DETAIL */}
            <div className="px-6 pb-5 flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Hủy
              </button>

              <button
                onClick={handleCreate}
                className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
