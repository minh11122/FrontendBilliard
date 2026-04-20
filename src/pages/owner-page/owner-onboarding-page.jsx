import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2, ChevronRight, CreditCard, Package, Image as ImageIcon,
  Users, TableProperties, ConciergeBell, Sparkles, Store, Loader2, X, Plus, Upload
} from "lucide-react";
import { completeOnboarding, getClubBank, saveClubBank } from "@/services/club.service";
import api from "@/lib/axios";
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

function StepSubscription({ clubId, selectedPlan, onSelect, onNext, onBack }) {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/subscriptions"),
      api.get(`/subscriptions/current?club_id=${clubId}`)
    ]).then(([resPlans, resCurrent]) => {
      if (resPlans.data?.success) setPlans(resPlans.data.data);
      if (resCurrent.data?.success && resCurrent.data.data) {
        setCurrentSub(resCurrent.data.data);
        if (resCurrent.data.data.subscription_id?.name) {
          // Find the key like "basic", "pro" from full name
          const subName = resCurrent.data.data.subscription_id.name.toLowerCase();
          const key = ["free", "basic", "pro"].find(k => subName.includes(k)) || "free";
          onSelect(key);
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [clubId, onSelect]);

  const getPrice = (name) => {
    const found = plans.find(p => p.name?.toLowerCase().includes(name));
    return found ? found.price?.toLocaleString("vi-VN") + " đ/tháng" : "---";
  };

  const handleConfirm = async () => {
    const plan = plans.find(p => p.name?.toLowerCase().includes(selectedPlan));
    
    // Check if they already purchased this exact plan and it's active
    const alreadyPurchased = currentSub && 
                             currentSub.subscription_id?._id === plan?._id && 
                             currentSub.status === "Active";
    
    // If it's a paid plan and not yet purchased
    if (plan && plan.price > 0 && !alreadyPurchased) {
      try {
        const returnUrl = window.location.origin + `/owner/onboarding/${clubId}?step=3`;
        const cancelUrl = window.location.origin + `/owner/onboarding/${clubId}?step=2`;
        
        localStorage.setItem(`pending_sub_${clubId}`, plan._id);

        const res = await api.post("/subscriptions/payos/create-payment", {
          subscription_id: plan._id,
          club_id: clubId,
          returnUrl,
          cancelUrl
        });

        if (res.data.success && res.data.data.checkoutUrl) {
          window.location.href = res.data.data.checkoutUrl;
          return; // Wait for redirect
        }
      } catch (err) {
        toast.error("Lỗi khi tạo mã thanh toán, vui lòng thử lại.");
        return;
      }
    }
    
    onNext();
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
          const isPurchased = currentSub && 
                              currentSub.subscription_id?.name?.toLowerCase().includes(plan.key) && 
                              currentSub.status === "Active";
          return (
            <div key={plan.key} onClick={() => onSelect(plan.key)}
              className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${isActive ? c.active : c.border + " hover:shadow-md"}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.badge}`}>{plan.label}</span>
                {isPurchased && <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Đã mua</span>}
              </div>
              <p className="text-xl font-black text-gray-900">{plan.price}</p>
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
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
          Quay lại
        </button>
        <button onClick={handleConfirm} disabled={!selectedPlan} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <ChevronRight size={18} />
          {(() => {
            const currentSelectedPlan = plans.find(p => p.name?.toLowerCase().includes(selectedPlan));
            const isPurchased = currentSelectedPlan && currentSub && currentSub.subscription_id?._id === currentSelectedPlan._id && currentSub.status === "Active";
            if (isPurchased || !currentSelectedPlan || currentSelectedPlan.price === 0) return "Tiếp tục";
            return "Thanh toán & tiếp tục";
          })()}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Ảnh quán ─────────────────────────────────────────────────────
function StepClubImages({ clubId, onNext, onBack }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch existing images to show if user comes back
    api.get(`/clubs/${clubId}`).then(res => {
      if (res.data?.success && res.data.data.images?.length > 0) {
        setExistingImages(
          res.data.data.images
            .filter(img => img.image_type !== "legal documents")
            .map(img => img.image_url)
        );
      }
    }).catch(() => {});
  }, [clubId]);

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
      {existingImages.length > 0 && previews.length === 0 && (
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
           <p className="text-sm text-blue-800 font-medium">Quán đã có {existingImages.length} ảnh được lưu.</p>
           <p className="text-xs text-blue-600 mt-1">Lưu ý: Nếu tải lên ảnh mới, các ảnh cũ sẽ bị thay thế.</p>
           <div className="flex gap-2 mt-2 overflow-x-auto">
             {existingImages.map((src, idx) => (
               <img key={idx} src={src} className="h-16 w-24 object-cover rounded shadow-sm" alt="saved"/>
             ))}
           </div>
         </div>
      )}
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
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
          Quay lại
        </button>
        {files.length === 0 && existingImages.length > 0 ? (
          <button onClick={onNext} className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
            Tiếp tục <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleUpload} disabled={uploading || files.length === 0}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
            {uploading ? "Đang upload..." : "Lưu ảnh & tiếp tục"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Thêm nhân viên ─────────────────────────────────────────────────
function StepAddStaff({ clubId, onNext, onBack }) {
  const [form, setForm] = useState({ password: "", fullname: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState([]);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    staffClubService.getActiveStaff(clubId).then(res => {
      if (res.data?.data) {
        setExistingCount(res.data.data.length);
      }
    }).catch(() => {});
  }, [clubId, added]);

  const handleAdd = async () => {
    if (!form.password || !form.fullname || !form.email) {
      toast.error("Vui lòng nhập Họ tên, Email và Mật khẩu nhân viên");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Email không hợp lệ");
      return;
    }
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    setSaving(true);
    try {
      await staffClubService.createStaff({ ...form, club_id: clubId });
      toast.success(`Đã thêm nhân viên: ${form.fullname}`);
      setAdded(prev => [...prev, form.fullname]);
      setForm({ password: "", fullname: "", phone: "", email: "" });
    } catch (e) {
      toast.error(e.response?.data?.message || "Thêm nhân viên thất bại");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm";

  return (
    <div className="space-y-4">
      {existingCount > 0 && (
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
           <p className="text-sm font-semibold text-blue-700 flex items-center gap-1">
             <CheckCircle2 size={16} /> Quán đang có {existingCount} nhân viên hoạt động.
           </p>
         </div>
      )}
      {added.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Vừa thêm trong phiên này ({added.length}):</p>
          {added.map((n, i) => <p key={i} className="text-sm text-green-800 flex items-center gap-1"><CheckCircle2 size={14} />{n}</p>)}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="Nguyễn Văn A" value={form.fullname}
            onChange={e => setForm(p => ({ ...p, fullname: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
          <input className={inputCls} type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="nhanvien@email.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
          <input className={inputCls} placeholder="0901234567" value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
          Quay lại
        </button>
        <button onClick={handleAdd} disabled={saving}
          className="flex-1 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Thêm nhân viên
        </button>
        <button onClick={onNext} disabled={added.length === 0 && existingCount === 0}
          className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <ChevronRight size={16} />
          Xong & tiếp tục
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Thêm bàn bida ────────────────────────────────────────────────
function StepAddTable({ clubId, onNext, onSkip, onBack }) {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ table_number: "", table_type_id: "", price: "", description: "" });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState([]);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    getTableTypes().then(r => { if (r.data.success) setTypes(r.data.data); });
    api.get("/tables", { params: { club_id: clubId, limit: 100 } }).then(res => {
      if (res.data?.success && res.data.data) {
        setExistingCount(res.data.data.length);
      }
    }).catch(() => {});
  }, [clubId]);

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

  const handleAdd = async () => {
    if (!form.table_number || !form.table_type_id || !form.price) { toast.error("Nhập đủ tên bàn, loại bàn và đơn giá"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("club_id", clubId);
      fd.append("table_number", form.table_number);
      fd.append("table_type_id", form.table_type_id);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("area", "Khu vực chung");
      fd.append("isActive", true);
      
      if (files.length > 0) {
         files.forEach(f => fd.append("images", f));
      }

      await createTable(fd);
      toast.success(`Đã thêm: ${form.table_number}`);
      setAdded(p => [...p, form.table_number]);
      setForm({ table_number: "", table_type_id: "", price: "", description: "" });
      setFiles([]);
      setPreviews([]);
    } catch (e) {
      toast.error(e.response?.data?.message || "Thêm bàn thất bại");
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition text-sm";
  return (
    <div className="space-y-4">
      {existingCount > 0 && (
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
           <p className="text-sm font-semibold text-blue-700 flex items-center gap-1">
             <CheckCircle2 size={16} /> Quán đang có {existingCount} bàn hoạt động.
           </p>
         </div>
      )}
      {added.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-green-700 mb-1">Vừa thêm trong phiên này ({added.length} bàn):</p>
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
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả bàn</label>
          <input className={inputCls} placeholder="Mô tả..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh bàn (tùy chọn, tối đa 5 ảnh)</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 w-32 flex-shrink-0">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-Colors cursor-pointer flex-shrink-0">
                <Upload size={24} />
                <span className="text-xs font-medium">Thêm ảnh ({files.length}/5)</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
          Quay lại
        </button>
        <button onClick={onSkip} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition">
          Bỏ qua
        </button>
        <button onClick={handleAdd} disabled={saving}
          className="flex-1 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}Thêm bàn này
        </button>
        <button onClick={onNext} disabled={added.length === 0 && existingCount === 0}
          className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <ChevronRight size={16} />Xong
        </button>
      </div>
    </div>
  );
}

// ─── Step 6: Thêm dịch vụ ─────────────────────────────────────────────────
function StepAddService({ clubId, onNext, onSkip, onBack }) {
  const [form, setForm] = useState({ name: "", price: "", description: "" });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState([]);
  const [existingCount, setExistingCount] = useState(0);

  useEffect(() => {
    api.get("/services", { params: { club_id: clubId, limit: 100 } }).then(res => {
      if (res.data?.success && res.data.data) {
        setExistingCount(res.data.data.length);
      } else {
        console.warn("[StepAddService] service fetch returned unexpected shape:", res.data);
      }
    }).catch((err) => {
      console.error("[StepAddService] failed to fetch services:", err?.response?.data || err.message);
    });
  }, [clubId]);

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

  const handleAdd = async () => {
    if (!form.name || !form.price) { toast.error("Nhập tên và đơn giá dịch vụ"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("club_id", clubId);
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);

      if (files.length > 0) {
         files.forEach(f => fd.append("images", f));
      }

      await api.post("/services", fd);
      toast.success(`Đã thêm: ${form.name}`);
      setAdded(p => [...p, form.name]);
      setForm({ name: "", price: "", description: "" });
      setFiles([]);
      setPreviews([]);
    } catch (e) {
      toast.error(e.response?.data?.message || "Thêm dịch vụ thất bại");
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition text-sm";
  return (
    <div className="space-y-4">
      {existingCount > 0 && (
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
           <p className="text-sm font-semibold text-blue-700 flex items-center gap-1">
             <CheckCircle2 size={16} /> Quán đang cung cấp {existingCount} dịch vụ.
           </p>
         </div>
      )}
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
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh dịch vụ (tùy chọn, tối đa 5 ảnh)</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 w-32 flex-shrink-0">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
            {files.length < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-Colors cursor-pointer flex-shrink-0">
                <Upload size={24} />
                <span className="text-xs font-medium">Thêm ảnh ({files.length}/5)</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition">
          Quay lại
        </button>
        <button onClick={onSkip} className="flex-1 py-2.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition">Bỏ qua</button>
        <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}Thêm
        </button>
        <button onClick={onNext} disabled={added.length === 0 && existingCount === 0} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          <ChevronRight size={16} />Xong
        </button>
      </div>
    </div>
  );
}

// ─── Step 7: Tiện ích ─────────────────────────────────────────────────────
const INITIAL_AMENITY_OPTIONS = ["WiFi", "Điều hòa", "Bãi đỗ xe", "Toilet", "Camera an ninh", "Đồ uống", "Billiard cue cho thuê", "Hệ thống âm thanh"];

function StepAddAmenity({ clubId, onFinish, onBack }) {
  const [selected, setSelected] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [options, setOptions] = useState(INITIAL_AMENITY_OPTIONS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/clubs/${clubId}`).then(res => {
      if (res.data?.success && res.data.data.amenities) {
        const existingAmenities = res.data.data.amenities.map(a => a.name);
        setSelected(existingAmenities);
        setOptions(p => {
           const newOpts = [...p];
           existingAmenities.forEach(a => { if(!newOpts.includes(a)) newOpts.push(a); });
           return newOpts;
        });
      }
    }).catch(() => {});
  }, [clubId]);

  const toggle = (a) => setSelected(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  const handleAddCustom = () => {
    if (!customAmenity.trim()) return;
    const newAmenity = customAmenity.trim();
    if (!options.includes(newAmenity)) {
      setOptions(p => [...p, newAmenity]);
    }
    if (!selected.includes(newAmenity)) {
      setSelected(p => [...p, newAmenity]);
    }
    setCustomAmenity("");
  };

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
        {options.map(a => {
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
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-2">
         <p className="text-xs text-blue-700">Lưu ý: Bấm hoàn tất sẽ cập nhật lại toàn bộ danh sách tiện ích của quán dựa theo lựa chọn hiện tại.</p>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <input 
          type="text" 
          placeholder="Nhập tiện ích khác..." 
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustom(); } }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none transition text-sm" 
        />
        <button 
          onClick={handleAddCustom}
          disabled={!customAmenity.trim()}
          className="px-4 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition disabled:opacity-50 flex items-center gap-1 text-sm">
          <Plus size={16}/> Thêm
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition">
          Quay lại
        </button>
        <button onClick={onFinish} className="flex-1 py-3 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition">
          Bỏ qua
        </button>
        <button onClick={handleSave} disabled={saving || selected.length === 0}
          className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          Hoàn tất
        </button>
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────
export default function OwnerOnboardingPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = Number(searchParams.get("step")) || 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedPlan, setSelectedPlan] = useState("free");
  const clubName = localStorage.getItem("selected_club_name") || "Quán của bạn";

  useEffect(() => {
    // Check if returned from PayOS
    const orderCode = searchParams.get("orderCode");
    const status = searchParams.get("status");
    if (orderCode && status === "PAID") {
      const subId = localStorage.getItem(`pending_sub_${clubId}`);
      if (subId) {
        api.post("/subscriptions/payos/verify", {
           orderCode, subscription_id: subId, club_id: clubId
        }).then(() => {
           toast.success("Thanh toán thành công!");
           localStorage.removeItem(`pending_sub_${clubId}`);
        }).catch(() => toast.error("Lỗi xác minh thanh toán"));
      }
    }
  }, [searchParams, clubId]);

  const priorStep = () => setCurrentStep(s => Math.max(1, s - 1));
  const next = () => setCurrentStep(s => s + 1);
  const skip = () => setCurrentStep(s => s + 1);

  const handleFinish = async () => {
    try {
      const res = await completeOnboarding(clubId, selectedPlan);
      const realPlan = res?.data?.plan_type || selectedPlan;
      localStorage.setItem("selected_club_plan", realPlan);
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
          {currentStep === 2 && <StepSubscription clubId={clubId} selectedPlan={selectedPlan} onSelect={setSelectedPlan} onNext={next} onBack={priorStep} />}
          {currentStep === 3 && <StepClubImages clubId={clubId} onNext={next} onBack={priorStep} />}
          {currentStep === 4 && <StepAddStaff clubId={clubId} onNext={next} onBack={priorStep} />}
          {currentStep === 5 && <StepAddTable clubId={clubId} onNext={next} onSkip={skip} onBack={priorStep} />}
          {currentStep === 6 && <StepAddService clubId={clubId} onNext={next} onSkip={skip} onBack={priorStep} />}
          {currentStep === 7 && <StepAddAmenity clubId={clubId} onFinish={handleFinish} onBack={priorStep} />}
        </div>
      </div>
    </div>
  );
}
