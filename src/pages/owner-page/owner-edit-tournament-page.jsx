import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Save, Trophy, Info, ImagePlus, X, Calendar, Users, Swords,
  DollarSign, Award, Settings2, ChevronLeft, Loader2
} from "lucide-react";
import { getTournamentById, updateTournament } from "@/services/tournament.service";

export default function OwnerEditTournamentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const bannerInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [errors, setErrors] = useState({});

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: "",
    description: "",
    format: "Knockout",
    max_players: "",
    fee: "",
    prize_pool: "",
    registration_open: "",
    registration_deadline: "",
    play_date: "",
    auto_bracket: true,
  });

  const formatOptions = [
    { value: "Knockout", label: "Loại trực tiếp", desc: "Thua là loại" },
    { value: "Double Elimination", label: "Nhánh thắng / thua", desc: "Thua 1 trận xuống nhánh thua" },
    ...(form.format === "Round Robin"
      ? [{ value: "Round Robin", label: "Vòng tròn", desc: "Giữ tương thích giải cũ" }]
      : []),
  ];

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTournamentById(id);
        if (res.success && res.data) {
          const t = res.data;
          setForm({
            name: t.name || "",
            description: t.description || "",
            format: t.format || "Knockout",
            max_players: t.max_players || "",
            fee: t.fee || "",
            prize_pool: t.prize_pool || "",
            registration_open: t.registration_open ? t.registration_open.split("T")[0] : "",
            registration_deadline: t.registration_deadline ? t.registration_deadline.split("T")[0] : "",
            play_date: t.play_date ? t.play_date.split("T")[0] : "",
            auto_bracket: t.auto_bracket !== undefined ? t.auto_bracket : true,
          });
          // Only show valid remote URLs (not blob: from old data)
          const isValidUrl = t.banner && !t.banner.startsWith("blob:") && t.banner.startsWith("http");
          if (isValidUrl) setBannerPreview(t.banner);
        }
      } catch (err) {
        toast.error("Không thể tải thông tin giải đấu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  useEffect(() => {
    const newErrors = {};

    // Date validations
    if (form.registration_open && form.registration_deadline) {
      if (new Date(form.registration_open) >= new Date(form.registration_deadline)) {
        newErrors.dates = "Ngày mở đăng ký phải trước ngày đóng đăng ký";
      }
    }
    if (form.registration_deadline && form.play_date && !newErrors.dates) {
      if (new Date(form.registration_deadline) >= new Date(form.play_date)) {
        newErrors.dates = "Ngày đóng đăng ký phải trước ngày thi đấu";
      }
    }
    if (form.registration_open && form.play_date && !newErrors.dates) {
      if (new Date(form.registration_open) >= new Date(form.play_date)) {
        newErrors.dates = "Ngày mở đăng ký phải trước ngày thi đấu";
      }
    }

    // Prize > Fee validation
    const feeNum = Number(form.fee) || 0;
    const prizeNum = Number(form.prize_pool) || 0;
    if (feeNum > 0 && prizeNum > 0 && prizeNum <= feeNum) {
      newErrors.prize = "Giải thưởng phải lớn hơn phí tham gia";
    }

    const prizeRaw = String(form.prize_pool ?? "").trim();
    const strictPrizeNum = Number(prizeRaw);
    if (!prizeRaw) {
      newErrors.prize = "Vui lòng nhập tiền thưởng";
    } else if (!Number.isFinite(strictPrizeNum) || strictPrizeNum <= 0) {
      newErrors.prize = "Tiền thưởng phải lớn hơn 0";
    } else if ((Number(form.fee) || 0) > 0 && strictPrizeNum <= (Number(form.fee) || 0)) {
      newErrors.prize = "Tiền thưởng phải lớn hơn phí tham gia";
    }

    setErrors(newErrors);
  }, [form]);

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên giải đấu");
      return;
    }
    if (!form.max_players || Number(form.max_players) < 2) {
      toast.error("Số lượng người chơi tối thiểu là 2");
      return;
    }

    if (!String(form.prize_pool ?? "").trim()) {
      toast.error("Vui lòng nhập tiền thưởng");
      return;
    }

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin bị lỗi");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("format", form.format);
      formData.append("max_players", Number(form.max_players));
      formData.append("fee", Number(form.fee) || 0);
      formData.append("prize_pool", String(form.prize_pool).trim());
      formData.append("auto_bracket", form.auto_bracket);
      if (form.registration_open) formData.append("registration_open", form.registration_open);
      if (form.registration_deadline) formData.append("registration_deadline", form.registration_deadline);
      if (form.play_date) formData.append("play_date", form.play_date);
      // Only append banner file if user selected a new one
      if (bannerFile) formData.append("banner", bannerFile);

      const res = await updateTournament(id, formData);
      if (res.success) {
        toast.success("Cập nhật giải đấu thành công! ✅");
        navigate("/owner/tournaments");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-sm mb-6">
        <span className="text-slate-500 hover:text-orange-600 cursor-pointer" onClick={() => navigate("/owner/tournaments")}>Quản lý Giải đấu</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Chỉnh sửa giải đấu</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" /> Chỉnh sửa Giải đấu
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Cập nhật thông tin giải đấu.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-all shadow-sm">
            Hủy bỏ
          </button>
          <button type="button" onClick={handleSubmit} disabled={submitting || Object.keys(errors).length > 0}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            <Save className="w-5 h-5" /> {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Section 1: Thông tin cơ bản --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Info className="text-slate-400 w-5 h-5" /> Thông tin cơ bản
          </h3>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Tên giải đấu <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="VD: Giải Billiard Mùa Xuân 2026" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mô tả</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Mô tả chi tiết về giải đấu..."
                rows={4} className={`${inputClass} resize-none`} />
              <p className="text-xs text-slate-400 mt-1 text-right">{form.description.length}/1000</p>
            </div>
          </div>
        </div>

        {/* --- Section 2: Thể thức & Cài đặt --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Swords className="text-slate-400 w-5 h-5" /> Thể thức & Cài đặt
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Thể thức thi đấu <span className="text-red-500">*</span></label>
              <div className="flex gap-3">
                {formatOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, format: opt.value }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
                      form.format === opt.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className={`block text-sm font-bold ${form.format === opt.value ? "text-orange-700" : "text-slate-700"}`}>{opt.label}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Số lượng người chơi <span className="text-red-500">*</span></label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" name="max_players" value={form.max_players} onChange={handleChange}
                  placeholder="VD: 8, 16, 32..." min="2" className={`${inputClass} pl-10`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Phí tham gia (VNĐ)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" name="fee" value={form.fee} onChange={handleChange}
                  placeholder="0 = Miễn phí" min="0" className={`${inputClass} pl-10`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Giải thưởng (VNĐ)</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="number" name="prize_pool" value={form.prize_pool} onChange={handleChange}
                  placeholder="VD: 5000000" min="0" className={`${inputClass} pl-10 ${errors.prize ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
              </div>
              {errors.prize && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.prize}</p>}
            </div>

            {/* Auto Bracket Toggle */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-slate-400" />
                  <div>
                    <span className="text-sm font-bold text-slate-700">Tự động tạo bracket</span>
                    <p className="text-xs text-slate-400">Hệ thống sẽ tự động xếp lịch thi đấu sau khi đóng đăng ký.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="auto_bracket" checked={form.auto_bracket} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* --- Section 3: Thời gian --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="text-slate-400 w-5 h-5" /> Thời gian
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Mở đăng ký</label>
              <input type="date" name="registration_open" value={form.registration_open} onChange={handleChange} min={todayStr} className={`${inputClass} ${errors.dates ? "border-red-500" : ""}`} />
            </div>
            <div>
              <label className={labelClass}>Đóng đăng ký</label>
              <input type="date" name="registration_deadline" value={form.registration_deadline} onChange={handleChange} min={form.registration_open || todayStr} className={`${inputClass} ${errors.dates ? "border-red-500" : ""}`} />
            </div>
            <div>
              <label className={labelClass}>Ngày thi đấu</label>
              <input type="date" name="play_date" value={form.play_date} onChange={handleChange} min={form.registration_deadline || form.registration_open || todayStr} className={`${inputClass} ${errors.dates ? "border-red-500" : ""}`} />
            </div>
          </div>
          {errors.dates && <p className="text-red-500 text-sm mt-3 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">{errors.dates}</p>}
        </div>

        {/* --- Section 4: Banner --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ImagePlus className="text-slate-400 w-5 h-5" /> Banner / Ảnh giải đấu
          </h3>
          <p className="text-xs text-slate-400 mb-5">Ảnh banner hiển thị ở trang chủ giải đấu.</p>

          {bannerPreview ? (
            <div className="relative aspect-[2.5/1] rounded-xl overflow-hidden border border-slate-200 group">
              <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
              <button
                type="button"
                onClick={removeBanner}
                className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer"
            >
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Nhấn để chọn ảnh banner</span>
            </button>
          )}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleBannerChange}
          />
        </div>
      </form>

      <div className="h-10"></div>
    </div>
  );
}
