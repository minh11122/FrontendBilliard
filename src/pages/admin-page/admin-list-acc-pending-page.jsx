import { useEffect, useState } from "react";
import {
  Package,
  X,
  Pencil,
  Eye,
  ChevronLeft,
  ChevronRight,
  Tag,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getAllSubscriptions,
  updateSubscription,
  getSubscriptionById,
} from "@/services/admin.service";

export const AccPendingManagement = () => {
  const [packages, setPackages] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    discount_percent: 0,
    duration_days: 30,
    post_limit: 0,
    is_active: true,
    features: {
      allow_priority_post: false,
      allow_highlight: false,
      allow_pin_post: false,
    },
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await getAllSubscriptions({ page, limit: 10 });
      setPackages(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Lỗi load dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const formatPrice = (price) => price?.toLocaleString("vi-VN") + "đ";

  const handleEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      name: pkg?.name || "",
      price: pkg?.price ?? "",
      description: pkg?.description || "",
      discount_percent: pkg?.discount_percent ?? 0,
      duration_days: pkg?.duration_days ?? 30,
      post_limit: pkg?.post_limit ?? 0,
      is_active: pkg?.is_active ?? true,
      features: {
        allow_priority_post: !!pkg?.features?.allow_priority_post,
        allow_highlight: !!pkg?.features?.allow_highlight,
        allow_pin_post: !!pkg?.features?.allow_pin_post,
      },
    });
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.price || !form.duration_days)
        return toast.error("Nhập thiếu dữ liệu");
      if (!editing?._id) return toast.error("Không tìm thấy gói để cập nhật");
      await updateSubscription(editing._id, {
        ...form,
        price: Number(form.price),
        discount_percent: Number(form.discount_percent) || 0,
        duration_days: Number(form.duration_days),
        post_limit: Number(form.post_limit) || 0,
      });
      toast.success("Cập nhật thành công");
      setOpenModal(false);
      fetchPackages();
    } catch {
      toast.error("Lỗi thao tác");
    }
  };

  const handleView = async (id) => {
    try {
      const res = await getSubscriptionById(id);
      setViewDetail(res.data.data);
    } catch {
      toast.error("Không load được chi tiết");
    }
  };

  const CARD_ACCENTS = [
    {
      bg: "from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      dot: "bg-emerald-400",
      badge: "bg-emerald-100 text-emerald-700",
    },
    {
      bg: "from-violet-50 to-purple-50",
      border: "border-violet-200",
      dot: "bg-violet-400",
      badge: "bg-violet-100 text-violet-700",
    },
    {
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      dot: "bg-amber-400",
      badge: "bg-amber-100 text-amber-700",
    },
    {
      bg: "from-sky-50 to-cyan-50",
      border: "border-sky-200",
      dot: "bg-sky-400",
      badge: "bg-sky-100 text-sky-700",
    },
    {
      bg: "from-rose-50 to-pink-50",
      border: "border-rose-200",
      dot: "bg-rose-400",
      badge: "bg-rose-100 text-rose-700",
    },
    {
      bg: "from-indigo-50 to-blue-50",
      border: "border-indigo-200",
      dot: "bg-indigo-400",
      badge: "bg-indigo-100 text-indigo-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .pkg-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .pkg-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .pkg-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12); }
        .pkg-btn-icon { transition: background 0.15s, color 0.15s; }
        .pkg-btn-icon:hover { background: rgba(0,0,0,0.06); }
        .modal-overlay { animation: fadeIn 0.18s ease; }
        .modal-box { animation: slideUp 0.2s ease; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .pkg-input { transition: border-color 0.15s, box-shadow 0.15s; }
        .pkg-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
      `}</style>

      <div className="pkg-root max-w-6xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
              Quản lý
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Gói dịch vụ cửa hàng
            </h1>
          </div>

        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Tổng gói",
              value: pagination.total ?? packages.length,
              icon: Package,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Trang hiện tại",
              value: `${pagination.page ?? 1} / ${pagination.totalPages ?? 1}`,
              icon: Sparkles,
              color: "text-violet-600 bg-violet-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              <div className={`p-2 rounded-xl ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                <p className="text-sm font-bold text-gray-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Cards ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse space-y-3"
              >
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-6 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Package className="w-12 h-12 opacity-30" />
            <p className="font-medium">Chưa có gói nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <div
                  key={pkg._id}
                  className={`pkg-card bg-gradient-to-br ${accent.bg} border ${accent.border} rounded-2xl p-5 flex flex-col gap-3`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${accent.dot}`}
                      />
                      <h3 className="font-bold text-gray-900 text-base truncate">
                        {pkg.name}
                      </h3>
                    </div>
                    {pkg.discount_percent > 0 && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${accent.badge}`}
                      >
                        <Tag className="w-3 h-3" /> -{pkg.discount_percent}%
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-gray-700">
                      {pkg.duration_days || 0} ngày
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-gray-700">
                      {pkg.post_limit || 0} bài đăng
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        pkg.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {pkg.is_active ? "Đang hoạt động" : "Đã tắt"}
                    </span>
                  </div>

                  {/* Note */}
                  <div className="rounded-xl bg-white/70 border border-white/70 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 mb-0.5">
                      Chú thích
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {pkg.description || "Chưa có chú thích cho gói này."}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className={`border-t ${accent.border} mt-auto`} />

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleView(pkg._id)}
                      className="pkg-btn-icon flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem
                    </button>
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="pkg-btn-icon flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-2.5 py-1.5 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Sửa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">
            Trang{" "}
            <span className="font-bold text-gray-800">
              {pagination.page ?? 1}
            </span>{" "}
            / {pagination.totalPages ?? 1}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
            >
              <ChevronLeft className="w-4 h-4" /> Trước
            </button>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50"
            >
              Sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ MODAL CREATE / EDIT ══ */}
      {openModal && (
        <div className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-lg text-gray-900">
                  Cập nhật gói
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chỉnh sửa thông tin gói dịch vụ
                </p>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Tên gói *
                </label>
                <input
                  placeholder="VD: Gói Premium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="pkg-input w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Giá (đ) *
                  </label>
                  <input
                    placeholder="99000"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="pkg-input w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Số ngày hiệu lực *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.duration_days}
                    onChange={(e) =>
                      setForm({ ...form, duration_days: e.target.value })
                    }
                    className="pkg-input w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Giới hạn bài đăng
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.post_limit}
                    onChange={(e) =>
                      setForm({ ...form, post_limit: e.target.value })
                    }
                    className="pkg-input w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Giảm giá (%)
                  </label>
                  <input
                    placeholder="0"
                    type="number"
                    value={form.discount_percent}
                    onChange={(e) =>
                      setForm({ ...form, discount_percent: e.target.value })
                    }
                    className="pkg-input w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <p className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Tính năng
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!form.features?.allow_priority_post}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          features: {
                            ...form.features,
                            allow_priority_post: e.target.checked,
                          },
                        })
                      }
                    />
                    Bài đăng ưu tiên
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!form.features?.allow_highlight}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          features: {
                            ...form.features,
                            allow_highlight: e.target.checked,
                          },
                        })
                      }
                    />
                    Làm nổi bật
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!form.features?.allow_pin_post}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          features: {
                            ...form.features,
                            allow_pin_post: e.target.checked,
                          },
                        })
                      }
                    />
                    Ghim bài đăng
                  </label>
                  
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Chú thích
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập chú thích ngắn về gói dịch vụ..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="pkg-input w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-200 transition-all"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DETAIL MODAL ══ */}
      {viewDetail && (
        <div className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Colored top banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1">
                    Chi tiết gói
                  </p>
                  <h2 className="text-white text-xl font-extrabold">
                    {viewDetail.name}
                  </h2>
                </div>
                <button
                  onClick={() => setViewDetail(null)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-3xl font-extrabold text-white mt-3">
                {formatPrice(viewDetail.price)}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {viewDetail.discount_percent > 0 && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                  <Tag className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-semibold text-rose-600">
                    Giảm {viewDetail.discount_percent}%
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">Hiệu lực</p>
                  <p className="font-semibold text-gray-800">
                    {viewDetail.duration_days || 0} ngày
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">Giới hạn bài đăng</p>
                  <p className="font-semibold text-gray-800">
                    {viewDetail.post_limit || 0}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                  Tính năng
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    Ưu tiên: {viewDetail.features?.allow_priority_post ? "Có" : "Không"}
                  </li>
                  <li>
                    Nổi bật: {viewDetail.features?.allow_highlight ? "Có" : "Không"}
                  </li>
                  <li>
                    Ghim bài: {viewDetail.features?.allow_pin_post ? "Có" : "Không"}
                  </li>
                  <li>
                    Trạng thái: {viewDetail.is_active ? "Đang hoạt động" : "Đã tắt"}
                  </li>
                </ul>
              </div>

              {viewDetail.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                    Chú thích
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {viewDetail.description}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => setViewDetail(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
