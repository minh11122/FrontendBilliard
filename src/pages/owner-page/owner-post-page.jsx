import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { Plus, Edit2, Eye, Trash2, ImagePlus, X, Search, ArrowUp, ArrowDown } from "lucide-react";
import axios from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { uploadImages } from "@/utils/cloudinary";
import { PostBlocksRenderer } from "@/components/common/post-blocks-renderer";

const StatusPill = ({ status }) => {
  const map = {
    Pending: { cls: "bg-yellow-50 text-yellow-800 border-yellow-200", label: "Chờ duyệt" },
    Approved: { cls: "bg-green-50 text-green-700 border-green-200", label: "Đã duyệt" },
    Rejected: { cls: "bg-red-50 text-red-700 border-red-200", label: "Từ chối" },
  };

  const v = map[status] || { cls: "bg-gray-50 text-gray-700 border-gray-200", label: status || "—" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${v.cls}`}>
      {v.label}
    </span>
  );
};

const ModalShell = ({ title, children, onClose, footer }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-gray-900 text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[75vh]">{children}</div>

        {footer ? <div className="px-5 py-4 border-t border-gray-100 bg-white">{footer}</div> : null}
      </div>
    </div>
  );
};

export const OwnerPostPage = () => {
  const PAGE_SIZE = 10;
  const CLUB_NAME = localStorage.getItem("selected_club_name") || "CLB của bạn";
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPost, setSelectedPost] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [blocks, setBlocks] = useState([{ type: "text", text: "" }]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/posts/my", {
        params: CLUB_ID ? { club_id: CLUB_ID } : undefined,
      });
      setPosts(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Không thể tải bài đăng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      const t = p.title?.toLowerCase() || "";
      const c = p.content?.toLowerCase() || "";
      return t.includes(q) || c.includes(q);
    });
  }, [posts, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);

    setExistingImageUrl("");
    setRemoveExistingImage(false);
    setImageFile(null);
    setImagePreviewUrl(null);
    setBlocks([{ type: "text", text: "" }]);

    formik.resetForm();
    setFormOpen(true);
  };

  const openEdit = (post) => {
    setMode("edit");
    setEditingId(post._id);

    setExistingImageUrl(post.image_url || "");
    setRemoveExistingImage(false);
    setImageFile(null);
    setImagePreviewUrl(null);

    formik.setValues({
      title: post.title || "",
      content: post.content || "",
    });
    setBlocks(
      Array.isArray(post.content_blocks) && post.content_blocks.length > 0
        ? post.content_blocks
        : [
            ...(post.content ? [{ type: "text", text: post.content }] : []),
            ...(post.image_url ? [{ type: "image", image_url: post.image_url, image_width: "wide", image_align: "center" }] : []),
          ]
    );

    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setMode("create");
    setImageFile(null);
    setImagePreviewUrl(null);
    setExistingImageUrl("");
    setRemoveExistingImage(false);
    setBlocks([{ type: "text", text: "" }]);
  };

  const validationSchema = Yup.object({
    title: Yup.string().trim().required("Vui lòng nhập tiêu đề").max(150, "Tối đa 150 ký tự"),
    content: Yup.string().trim().required("Vui lòng nhập nội dung").max(20000, "Nội dung quá dài"),
  });

  const formik = useFormik({
    initialValues: { title: "", content: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);

        if (!CLUB_ID) {
          toast.error("Vui lòng chọn câu lạc bộ trước");
          return;
        }

        let image_url;
        if (imageFile) {
          const uploaded = await uploadImages([imageFile], setIsUploadingImage);
          image_url = uploaded?.[0] || "";
        } else if (mode === "edit") {
          if (removeExistingImage) image_url = "";
          else image_url = existingImageUrl || "";
        }

        const payload = {
          title: values.title.trim(),
          content: values.content.trim(),
          content_blocks: blocks,
          ...(CLUB_ID ? { club_id: CLUB_ID } : {}),
          ...(image_url !== undefined ? { image_url } : {}),
        };

        if (mode === "create") {
          await axios.post("/posts", payload);
          toast.success("Tạo bài đăng thành công! Đang chờ duyệt.");
        } else {
          await axios.put(`/posts/${editingId}`, payload);
          toast.success("Cập nhật bài đăng thành công! Đang chờ duyệt lại.");
        }

        closeForm();
        fetchPosts();
      } catch (e) {
        toast.error(e?.response?.data?.message || "Có lỗi khi thao tác bài đăng");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const submitDisabled = isUploadingImage || formik.isSubmitting;

  const updateBlock = (idx, patch) => {
    setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const addHeadingBlock = () => setBlocks((prev) => [...prev, { type: "heading", text: "" }]);
  const addTextBlock = () => setBlocks((prev) => [...prev, { type: "text", text: "" }]);
  const addImageBlock = () =>
    setBlocks((prev) => [...prev, { type: "image", image_url: "", image_width: "wide", image_align: "center", image_caption: "" }]);
  const removeBlock = (idx) => setBlocks((prev) => prev.filter((_, i) => i !== idx));
  const moveBlock = (idx, dir) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const uploadImageForBlock = async (idx, file) => {
    if (!file) return;
    const uploaded = await uploadImages([file], setIsUploadingImage);
    const imageUrl = uploaded?.[0];
    if (imageUrl) {
      updateBlock(idx, { image_url: imageUrl });
    }
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRemoveExistingImage(false);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa bài đăng này không?");
    if (!ok) return;
    try {
      await axios.delete(`/posts/${id}`, {
        params: CLUB_ID ? { club_id: CLUB_ID } : undefined,
      });
      toast.success("Đã xóa bài đăng");
      fetchPosts();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể xóa bài đăng");
    }
  };

  const handleOpenDetail = (post) => {
    setSelectedPost(post);
    setDetailOpen(true);
  };

  const detailPost = detailOpen ? selectedPost : null;

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản lý bài viết</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Tạo, chỉnh sửa và quản lý bài đăng của {CLUB_NAME}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="w-[260px] pl-9 bg-slate-50"
                placeholder="Tìm theo tiêu đề hoặc nội dung..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Pending">Chờ duyệt</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Rejected">Từ chối</option>
            </select>

            <Button
              onClick={openCreate}
              className="bg-primary hover:bg-[#0fd650] text-primary-foreground h-11 px-5 rounded-lg font-bold shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.99] flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo bài đăng
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
            Đang tải...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3">
            <span className="font-bold">!</span>
            <div className="flex-1">
              <div className="font-semibold">Lỗi</div>
              <div className="text-sm mt-1">{error}</div>
              <button
                className="mt-3 text-sm font-semibold text-red-600 hover:underline"
                onClick={fetchPosts}
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Danh sách bài đăng</span>
                <span className="text-xs text-slate-500">({filtered.length}/{posts.length})</span>
              </div>
              <button
                onClick={fetchPosts}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Làm mới
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                    <th className="px-6 py-3">Tiêu đề</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3">Ngày tạo</th>
                    <th className="px-6 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                        Chưa có bài đăng phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedPosts.map((p) => (
                      <tr key={p._id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-[420px]">{p.title}</div>
                              <div className="text-xs text-slate-500 truncate max-w-[420px] mt-1">
                                {p.content || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={p.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              onClick={() => handleOpenDetail(p)}
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              onClick={() => openEdit(p)}
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                              onClick={() => handleDelete(p._id)}
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 ? (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 text-sm text-slate-500">
                <span>
                  Hien thi {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filtered.length)} trong {filtered.length} bai dang
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Truoc
                  </Button>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="text-xs text-slate-500">
          Tip: Khi bạn cập nhật bài đăng, hệ thống sẽ đưa về trạng thái <b>Chờ duyệt</b>.
        </div>
      </div>

      {detailPost ? (
        <ModalShell
          title="Chi tiết bài đăng"
          onClose={() => {
            setDetailOpen(false);
            setSelectedPost(null);
          }}
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDetailOpen(false);
                  setSelectedPost(null);
                }}
                className="rounded-xl"
              >
                Đóng
              </Button>
              {detailPost ? (
                <Button
                  onClick={() => openEdit(detailPost)}
                  className="bg-primary hover:bg-[#0fd650] text-primary-foreground rounded-xl"
                >
                  Chỉnh sửa
                </Button>
              ) : null}
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-lg font-extrabold text-slate-900 truncate">{detailPost.title}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {CLUB_NAME} • {detailPost.created_at ? new Date(detailPost.created_at).toLocaleString("vi-VN") : "—"}
                </div>
              </div>
              <StatusPill status={detailPost.status} />
            </div>

            {detailPost.rejected_reason ? (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
                <div className="font-bold mb-1">Lý do từ chối</div>
                <div className="whitespace-pre-wrap">{detailPost.rejected_reason}</div>
              </div>
            ) : null}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Nội dung</div>
              <PostBlocksRenderer
                blocks={detailPost.content_blocks}
                fallbackContent={detailPost.content}
                fallbackImage={detailPost.image_url}
                title={detailPost.title}
              />
            </div>
          </div>
        </ModalShell>
      ) : null}

      {formOpen ? (
        <ModalShell
          title={mode === "create" ? "Tạo bài đăng" : "Chỉnh sửa bài đăng"}
          onClose={closeForm}
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={closeForm} className="rounded-xl">
                Hủy
              </Button>
              <Button
                onClick={formik.handleSubmit}
                disabled={submitDisabled}
                className="bg-primary hover:bg-[#0fd650] text-primary-foreground rounded-xl px-6"
              >
                {formik.isSubmitting || isUploadingImage ? "Đang lưu..." : mode === "create" ? "Đăng bài" : "Lưu thay đổi"}
              </Button>
            </div>
          }
        >
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="title"
                  className="bg-slate-50"
                  placeholder="Ví dụ: Khai mạc giải đấu..."
                />
                {formik.touched.title && formik.errors.title ? (
                  <div className="text-xs text-red-600 mt-1">{formik.errors.title}</div>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <Label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tóm tắt nội dung <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  rows={4}
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="content"
                  className="bg-slate-50 resize-none"
                  placeholder="Mô tả ngắn bài viết..."
                />
                {formik.touched.content && formik.errors.content ? (
                  <div className="text-xs text-red-600 mt-1">{formik.errors.content}</div>
                ) : null}
              </div>

              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">Nội dung chi tiết dạng trang tin</div>
                    <div className="text-xs text-slate-500">Bạn có thể trộn đoạn chữ và ảnh theo ý muốn.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={addHeadingBlock} className="rounded-xl">
                      + Tiêu đề
                    </Button>
                    <Button type="button" variant="outline" onClick={addTextBlock} className="rounded-xl">
                      + Đoạn chữ
                    </Button>
                    <Button type="button" variant="outline" onClick={addImageBlock} className="rounded-xl">
                      + Ảnh
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-600">
                          Block {idx + 1}: {block.type === "heading" ? "Tiêu đề" : block.type === "text" ? "Đoạn chữ" : "Ảnh"}
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveBlock(idx, -1)} className="p-1.5 rounded hover:bg-slate-100">
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => moveBlock(idx, 1)} className="p-1.5 rounded hover:bg-slate-100">
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeBlock(idx)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {block.type === "heading" ? (
                        <Input
                          value={block.text || ""}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                          className="bg-slate-50"
                          placeholder="Nhập tiêu đề nhỏ cho phần nội dung..."
                        />
                      ) : block.type === "text" ? (
                        <Textarea
                          rows={5}
                          value={block.text || ""}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                          className="bg-slate-50"
                          placeholder="Nhập đoạn nội dung..."
                        />
                      ) : (
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => uploadImageForBlock(idx, e.target.files?.[0])}
                            className="block w-full text-sm text-slate-600"
                          />
                          <div className="grid md:grid-cols-2 gap-3">
                            <select
                              value={block.image_width || "wide"}
                              onChange={(e) => updateBlock(idx, { image_width: e.target.value })}
                              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                            >
                              <option value="small">Nhỏ</option>
                              <option value="normal">Vừa</option>
                              <option value="wide">Rộng</option>
                              <option value="full">Toàn chiều ngang</option>
                            </select>
                            <select
                              value={block.image_align || "center"}
                              onChange={(e) => updateBlock(idx, { image_align: e.target.value })}
                              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                            >
                              <option value="left">Canh trái</option>
                              <option value="center">Canh giữa</option>
                              <option value="right">Canh phải</option>
                            </select>
                          </div>
                          <Input
                            value={block.image_caption || ""}
                            onChange={(e) => updateBlock(idx, { image_caption: e.target.value })}
                            className="bg-slate-50"
                            placeholder="Ghi chú ảnh (caption) - tùy chọn"
                          />
                          {block.image_url ? (
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                              <img src={block.image_url} alt={`block-${idx}`} className="w-full max-h-[240px] object-cover" />
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">Chưa có ảnh.</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-slate-500" />
                    <div className="font-bold text-slate-900">Ảnh minh họa</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Tùy chọn. Hệ thống sẽ upload ảnh lên Cloudinary.
                  </div>
                </div>

                {mode === "edit" && existingImageUrl && !removeExistingImage && !imageFile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveExistingImage(true);
                      setImageFile(null);
                      setImagePreviewUrl(null);
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Xóa ảnh hiện tại
                  </button>
                ) : null}
              </div>

              <div className="mt-3 flex gap-4 items-start flex-wrap">
                <div className="flex-1 min-w-[220px]">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handlePickImage}
                    className="block w-full text-sm text-slate-600"
                    disabled={submitDisabled}
                  />
                  {imagePreviewUrl ? (
                    <div className="text-xs text-slate-500 mt-2">Đã chọn ảnh mới.</div>
                  ) : removeExistingImage && mode === "edit" ? (
                    <div className="text-xs text-slate-500 mt-2">Sẽ xóa ảnh hiện tại sau khi lưu.</div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-2">Chưa có ảnh.</div>
                  )}
                </div>

                <div className="w-full md:w-[320px]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                    {imagePreviewUrl ? (
                      <img src={imagePreviewUrl} alt="Preview" className="w-full max-h-[240px] object-cover" />
                    ) : existingImageUrl && !removeExistingImage ? (
                      <img
                        src={existingImageUrl}
                        alt="Ảnh hiện tại"
                        className="w-full max-h-[240px] object-cover"
                      />
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-sm">Chưa có ảnh để hiển thị</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </div>
  );
};

export default OwnerPostPage;
