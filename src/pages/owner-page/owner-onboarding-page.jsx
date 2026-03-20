import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2, ChevronRight, CreditCard, Package, Image as ImageIcon,
  Users, TableProperties, ConciergeBell, Sparkles, Store, Loader2, X, Plus, Upload
} from "lucide-react";
import api from "@/lib/axios";
import { completeOnboarding, getClubBank, saveClubBank, getSubscriptions } from "@/services/club.service";
import { createTable, getTableTypes } from "@/services/billiardTable.service";
import { staffClubService } from "@/services/staff-club.service";
import { uploadImages } from "@/utils/cloudinary";

const STEPS = [
  { id: 1, label: "Tài khoản ngân hàng", icon: CreditCard, required: true },
  { id: 2, label: "Gói dịch vụ", icon: Package, required: true },
  { id: 3, label: "Ảnh quán", icon: ImageIcon, required: true },
  { id: 4, label: "Nhân viên", icon: Users, required: true },
  { id: 5, label: "Bàn bida", icon: TableProperties, required: false },
  { id: 6, label: "Dịch vụ", icon: ConciergeBell, required: false },
  { id: 7, label: "Tiện ích", icon: Sparkles, required: false },
];

// ─── Step 1: Tài khoản ngân hàng (PayOS) ───────────────────────────────────
function StepBankAccount({ clubId, onNext }) {
  const [form, setForm] = useState({ payos_client_id: "", payos_api_key: "", payos_checksum_key: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClubBank(clubId).then(res => {
      if (res?.data) {
        setForm({
          payos_client_id: res.data.payos_client_id || "",
          payos_api_key: res.data.payos_api_key || "",
          payos_checksum_key: res.data.payos_checksum_key || "",
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [clubId]);

  const handleSave = async () => {
    if (!form.payos_client_id || !form.payos_api_key || !form.payos_checksum_key) {
      toast.error("Vui lòng nhập đầy đủ thông tin PayOS");
      return;
    }
    setSaving(true);
    try {
      await saveClubBank(clubId, form);
      toast.success("Đã lưu thông tin thanh toán");
      onNext();
    } catch (e) {
      toast.error(e.response?.data?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm";

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="space-y-6">
      {/* Cảnh báo / Hướng dẫn đăng ký */}
      {(!form.payos_client_id || !form.payos_api_key) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
              <CreditCard size={18} /> Bạn chưa có mã kết nối PayOS?
            </h4>
            <p className="text-sm text-blue-700">
              Vui lòng tạo tài khoản trên PayOS và tạo Kênh thanh toán để lấy 3 mã xác thực kết nối quán bida của bạn.
            </p>
          </div>
          <a
            href="https://my.payos.vn/register"
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Đăng ký & Lấy mã ngay
          </a>
        </div>
      )}

      {/* Form điền mã kết nối */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">PayOS Client ID <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="Nhập PayOS Client ID" value={form.payos_client_id}
            onChange={e => setForm(p => ({ ...p, payos_client_id: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">PayOS API Key <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="Nhập PayOS API Key" value={form.payos_api_key}
            onChange={e => setForm(p => ({ ...p, payos_api_key: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">PayOS Checksum Key <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="Nhập PayOS Checksum Key" value={form.payos_checksum_key}
            onChange={e => setForm(p => ({ ...p, payos_checksum_key: e.target.value }))} />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
        {saving ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
        {saving ? "Đang lưu..." : "Lưu và tiếp tục"}
      </button>
    </div>
  );
}

// ─── Step 2: Chọn gói dịch vụ ─────────────────────────────────────────────
const PLAN_FEATURES = {
  free: ["Quản lý bàn", "Quản lý nhân viên", "Quản lý dịch vụ", "Quản lý tiện ích"],
  basic: ["Tất cả tính năng Free", "+ Trang Tổng quan (Dashboard)"],
  pro: ["Tất cả tính năng Basic", "+ Quản lý Giải đấu", "+ Đăng bài quảng cáo"],
};

function StepSubscription({ clubId, selectedPlan, onSelect, onNext }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptions().then(res => {
      if (res?.success) setPlans(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getPrice = (name) => {
    const found = plans.find(p => p.name?.toLowerCase().includes(name));
    return found ? found.price?.toLocaleString("vi-VN") + " đ/tháng" : "---";
  };

  const planCards = [
    { key: "free", label: "Free", price: "Miễn phí", color: "gray", desc: "Dành cho quán mới bắt đầu" },
    { key: "basic", label: "Basic", price: getPrice("basic"), color: "blue", desc: "Thêm tính năng tổng quan quản lý" },
    { key: "pro", label: "Pro", price: getPrice("pro"), color: "purple", desc: "Đầy đủ tính năng, bao gồm giải đấu & bài đăng" },
  ];

  const colorMap = {
    gray: { border: "border-gray-200", bg: "bg-gray-50", active: "border-gray-500 ring-2 ring-gray-300", badge: "bg-gray-100 text-gray-700" },
    blue: { border: "border-blue-200", bg: "bg-blue-50", active: "border-blue-500 ring-2 ring-blue-300", badge: "bg-blue-100 text-blue-700" },
    purple: { border: "border-purple-200", bg: "bg-purple-50", active: "border-purple-500 ring-2 ring-purple-300", badge: "bg-purple-100 text-purple-700" },
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {planCards.map(plan => {
          const c = colorMap[plan.color];
          const isActive = selectedPlan === plan.key;
          return (
            <div key={plan.key} onClick={() => onSelect(plan.key)}
              className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${isActive ? c.active : c.border + " hover:shadow-md"}`}>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.badge}`}>{plan.label}</span>
              <p className="mt-3 text-xl font-black text-gray-900">{plan.price}</p>
              <p className="text-xs text-gray-500 mt-1 mb-4">{plan.desc}</p>
              <ul className="space-y-1.5">
                {PLAN_FEATURES[plan.key].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {selectedPlan === "free" && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Gói Free giới hạn một số tính năng. Bạn có thể nâng cấp bất kỳ lúc nào trong Cài đặt.
        </p>
      )}
      <button onClick={onNext} disabled={!selectedPlan} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
        <ChevronRight size={18} />
        Xác nhận gói & tiếp tục
      </button>
    </div>
  );
}

// ─── Step 3: Ảnh quán ─────────────────────────────────────────────────────
function StepClubImages({ clubId, onNext }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 5) { toast.error("Tối đa 5 ảnh!"); return; }
    const newFiles = [...files, ...selected];
    setFiles(newFiles);
    setPreviews(newFiles.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeFile = (idx) => {
    const nf = files.filter((_, i) => i !== idx);
    setFiles(nf);
    setPreviews(nf.map(f => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (files.length === 0) { toast.error("Vui lòng thêm ít nhất 1 ảnh quán"); return; }
    try {
      const cloudinary = await uploadImages(files, setUploading);
      if (cloudinary.length === 0) {
        toast.error("Upload ảnh thất bại. Vui lòng thử lại.");
        return;
      }
      // Save first as Avatar, rest as Background
      const [avatar, ...backgrounds] = cloudinary;
      await api.put(`/clubs/${clubId}`, { avatar, backgrounds });
      toast.success("Đã lưu ảnh quán");
      onNext();
    } catch (e) {
      toast.error("Upload ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((src, idx) => (
            <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
              {idx === 0 && <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-2 py-0.5 rounded">Ảnh đại diện</span>}
            </div>
          ))}
        </div>
      )}
      {files.length < 5 && (
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-Colors cursor-pointer">
          <Upload size={24} />
          <span className="text-sm font-medium">Thêm ảnh ({files.length}/5)</span>
          <span className="text-xs">Ảnh đầu tiên sẽ là ảnh đại diện quán</span>
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <button onClick={handleUpload} disabled={uploading || files.length === 0}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
        {uploading ? "Đang upload..." : "Lưu ảnh & tiếp tục"}
      </button>
    </div>
  );
}

// ─── Step 4: Thêm nhân viên ─────────────────────────────────────────────────
function StepAddStaff({ clubId, onNext }) {
  const [form, setForm] = useState({ username: "", password: "", fullname: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState([]);

  const handleAdd = async () => {
    if (!form.username || !form.password || !form.fullname) {
      toast.error("Vui lòng nhập Tên đăng nhập, Mật khẩu và Họ tên nhân viên");
      return;
    }
    setSaving(true);
    try {
      await staffClubService.createStaff({ ...form, club_id: clubId });
      toast.success(`Đã thêm nhân viên: ${form.fullname}`);
      setAdded(prev => [...prev, form.fullname]);
      setForm({ username: "", password: "", fullname: "", phone: "", email: "" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Thêm nhân viên thất bại");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm";

  return (
    <div className="space-y-4">
      {added.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Đã thêm ({added.length}):</p>
          {added.map((n, i) => <p key={i} className="text-sm text-green-800 flex items-center gap-1"><CheckCircle2 size={14} />{n}</p>)}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đăng nhập <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="username" value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
          <input className={inputCls} type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="Nguyễn Văn A" value={form.fullname}
            onChange={e => setForm(p => ({ ...p, fullname: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
          <input className={inputCls} placeholder="0901234567" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input className={inputCls} placeholder="nhanvien@email.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={handleAdd} disabled={saving}
          className="flex-1 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Thêm nhân viên này
        </button>
        <button onClick={onNext} disabled={added.length === 0}
          className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <ChevronRight size={16} />
          Xong & tiếp tục
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Thêm bàn bida ────────────────────────────────────────────────
function StepAddTable({ clubId, onNext, onSkip }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ table_number: "", table_type_id: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState([]);

  useEffect(() => {
    getTableTypes().then(r => { if (r.data.success) setTypes(r.data.data); });
  }, []);

  const handleAdd = async () => {
    if (!form.table_number || !form.table_type_id || !form.price) { toast.error("Nhập đủ tên bàn, loại bàn và đơn giá"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("club_id", clubId);
      fd.append("table_number", form.table_number);
      fd.append("table_type_id", form.table_type_id);
      fd.append("price", form.price);
      fd.append("area", "Khu vực chung");
      fd.append("isActive", true);
      await createTable(fd);
      toast.success(`Đã thêm: ${form.table_number}`);
      setAdded(p => [...p, form.table_number]);
      setForm({ table_number: "", table_type_id: "", price: "" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Thêm bàn thất bại");
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition text-sm";
  return (
    <div className="space-y-4">
      {added.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Đã thêm ({added.length} bàn):</p>
          {added.map((n, i) => <p key={i} className="text-sm text-green-800 flex items-center gap-1"><CheckCircle2 size={14} />{n}</p>)}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên / Số bàn</label>
          <input className={inputCls} placeholder="Bàn 01" value={form.table_number} onChange={e => setForm(p => ({ ...p, table_number: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại bàn</label>
          <select className={inputCls} value={form.table_type_id} onChange={e => setForm(p => ({ ...p, table_type_id: e.target.value }))}>
            <option value="">-- Chọn loại --</option>
            {types.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn giá (đ/giờ)</label>
          <input className={inputCls} type="number" placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onSkip} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition">
          Bỏ qua
        </button>
        <button onClick={handleAdd} disabled={saving}
          className="flex-1 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <Plus size={16} />Thêm bàn này
        </button>
        <button onClick={onNext} disabled={added.length === 0}
          className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <ChevronRight size={16} />Xong
        </button>
      </div>
    </div>
  );
}

// ─── Step 6: Thêm dịch vụ ─────────────────────────────────────────────────
function StepAddService({ clubId, onNext, onSkip }) {
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState([]);

  const handleAdd = async () => {
    if (!form.name || !form.price) { toast.error("Nhập tên và đơn giá dịch vụ"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("club_id", clubId);
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      await api.post("/services", fd);
      toast.success(`Đã thêm: ${form.name}`);
      setAdded(p => [...p, form.name]);
      setForm({ name: "", price: "", description: "" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Thêm dịch vụ thất bại");
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition text-sm";
  return (
    <div className="space-y-4">
      {added.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          {added.map((n, i) => <p key={i} className="text-sm text-green-800 flex items-center gap-1"><CheckCircle2 size={14} />{n}</p>)}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên dịch vụ</label>
          <input className={inputCls} placeholder="Nước ngọt, Cue thuê..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn giá (đ)</label>
          <input className={inputCls} type="number" placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả (tùy chọn)</label>
          <input className={inputCls} placeholder="Mô tả ngắn về dịch vụ" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onSkip} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition">Bỏ qua</button>
        <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <Plus size={16} />Thêm
        </button>
        <button onClick={onNext} disabled={added.length === 0} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <ChevronRight size={16} />Xong
        </button>
      </div>
    </div>
  );
}

// ─── Step 7: Tiện ích ─────────────────────────────────────────────────────
const AMENITY_OPTIONS = ["WiFi", "Điều hòa", "Bãi đỗ xe", "Toilet", "Camera an ninh", "Đồ uống", "Billiard cue cho thuê", "Hệ thống âm thanh"];

function StepAddAmenity({ clubId, onFinish }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggle = (a) => setSelected(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/clubs/${clubId}`, { amenities: selected });
      toast.success("Đã lưu tiện ích");
      onFinish();
    } catch (e) {
      toast.error("Lưu thất bại");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AMENITY_OPTIONS.map(a => {
          const active = selected.includes(a);
          return (
            <button key={a} type="button" onClick={() => toggle(a)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${active ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
              {active && <CheckCircle2 size={14} className="inline mr-1.5" />}
              {a}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button onClick={onFinish} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition">
          Bỏ qua
        </button>
        <button onClick={handleSave} disabled={saving || selected.length === 0}
          className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          Hoàn tất thiết lập
        </button>
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────
export default function OwnerOnboardingPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const clubName = localStorage.getItem("selected_club_name") || "Quán của bạn";

  const next = () => setCurrentStep(s => s + 1);
  const skip = () => setCurrentStep(s => s + 1);

  const handleFinish = async () => {
    try {
      await completeOnboarding(clubId, selectedPlan);
      localStorage.setItem("selected_club_plan", selectedPlan);
      toast.success("Thiết lập hoàn tất! Chào mừng bạn 🎉");
      navigate("/owner/dashboard");
    } catch (e) {
      toast.error("Có lỗi khi hoàn tất. Vui lòng thử lại.");
    }
  };

  const progress = Math.round(((currentStep - 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
            <Store className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Thiết lập quán: {clubName}</h1>
            <p className="text-gray-500 text-sm">Hoàn thành các bước dưới đây để bắt đầu quản lý.</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Tiến độ</span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STEPS.map(step => {
            const Icon = step.icon;
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${done ? "bg-green-100 border-green-300 text-green-700" : active ? "bg-blue-100 border-blue-400 text-blue-700" : "bg-white border-gray-200 text-gray-400"}`}>
                {done ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                {step.label}
                {step.required ? null : <span className="opacity-60">(tùy chọn)</span>}
              </div>
            );
          })}
        </div>

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              {(() => { const Icon = STEPS[currentStep - 1]?.icon; return Icon ? <Icon size={20} className="text-blue-500" /> : null; })()}
              <h2 className="text-xl font-bold text-gray-900">
                Bước {currentStep}: {STEPS[currentStep - 1]?.label}
              </h2>
              {!STEPS[currentStep - 1]?.required && (
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Tùy chọn</span>
              )}
            </div>
          </div>

          {currentStep === 1 && <StepBankAccount clubId={clubId} onNext={next} />}
          {currentStep === 2 && <StepSubscription clubId={clubId} selectedPlan={selectedPlan} onSelect={setSelectedPlan} onNext={next} />}
          {currentStep === 3 && <StepClubImages clubId={clubId} onNext={next} />}
          {currentStep === 4 && <StepAddStaff clubId={clubId} onNext={next} />}
          {currentStep === 5 && <StepAddTable clubId={clubId} onNext={next} onSkip={skip} />}
          {currentStep === 6 && <StepAddService clubId={clubId} onNext={next} onSkip={skip} />}
          {currentStep === 7 && <StepAddAmenity clubId={clubId} onFinish={handleFinish} />}
        </div>
      </div>
    </div>
  );
}
