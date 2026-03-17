import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getSubscriptions,
  getCurrentSubscription,
  createPayOSSubscriptionPayment
} from "@/services/subscription.service";
import { clubService } from "@/services/club.service";
import { getProvinces, getDistrictsByProvince, matchAdministrativeUnit } from "@/services/location.service";
import { uploadImages } from "@/utils/cloudinary";
import { MapAddressPicker } from "@/components/common/MapAddressPicker";
import { 
  Building2, 
  CreditCard, 
  Settings2, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Save,
  MapPin,
  Clock,
  Phone,
  Pencil,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export function SettingPage() {
  const [activeTab, setActiveTab] = useState("info"); // "info", "subscription", "payment"
  
  // Data states
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bgGalleryPage, setBgGalleryPage] = useState(0); // for background image page navigation
  const BG_PER_PAGE = 4;

  // Bank info states
  const [clubBank, setClubBank] = useState({
    payos_client_id: "",
    payos_api_key: "",
    payos_checksum_key: ""
  });
  const [bankSaving, setBankSaving] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isBankRequired, setIsBankRequired] = useState(false);

  // Club Info states
  const [clubData, setClubData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
    opening_time: "",
    closing_time: "",
    lat: 0,
    lng: 0,
    province_code: "",
    district_code: "",
    province_name: "", // Tên hiển thị dự phòng
    district_name: "", // Tên hiển thị dự phòng
    avatar: "",
    backgrounds: []
  });

  const [provinces, setProvinces] = useState([]);
  const [mapSearch, setMapSearch] = useState("");

  const clubId = localStorage.getItem("selected_club_id");

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const loadAllData = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const [subs, current, clubRes, provinceRes] = await Promise.all([
        getSubscriptions(),
        getCurrentSubscription(),
        clubService.getClubById(clubId),
        getProvinces()
      ]);

      setSubscriptions(subs);
      setCurrentSubscription(current);
      setProvinces(provinceRes || []);

      if (clubRes?.data) {
        const club = clubRes.data;
        const avatarImg = club.images?.find(img => img.image_type === "Avatar")?.image_url || "";
        const bgImages = club.images?.filter(img => img.image_type === "Background").map(img => img.image_url) || [];
        
        setClubData({
          name: club.name || "",
          address: club.address || "",
          phone: club.phone || "",
          description: club.description || "",
          opening_time: club.opening_time || "08:00",
          closing_time: club.closing_time || "23:30",
          lat: club.lat || 0,
          lng: club.lng || 0,
          province_code: club.province_code || "",
          district_code: club.district_code || "",
          province_name: club.province_name || "",
          district_name: club.district_name || "",
          avatar: avatarImg,
          backgrounds: bgImages
        });

      }

      // Load bank info of club
      try {
        const bankRes = await clubService.getClubBank(clubId);
        const bank = bankRes?.data;
        if (bank) {
          setClubBank({
            payos_client_id: bank.payos_client_id || "",
            payos_api_key: bank.can_view_payos_secrets ? (bank.payos_api_key || "") : "",
            payos_checksum_key: bank.can_view_payos_secrets ? (bank.payos_checksum_key || "") : ""
          });
          const required = !(bank.payos_client_id && bank.has_payos_keys);
          setIsBankRequired(required);
          if (required) setIsBankModalOpen(true);
        } else {
          setIsBankRequired(true);
          setIsBankModalOpen(true);
        }
      } catch (bankErr) {
        console.error(bankErr);
        toast.error("Không tải được cấu hình PayOS của quán");
        setIsBankRequired(true);
        setIsBankModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không tải được dữ liệu cài đặt");
    } finally {

      setLoading(false);

    }
  };

  const handleLocationSelect = (data) => {
    const { lat, lng, address, provinceName, districtName } = data;
    
    setClubData(prev => ({
      ...prev,
      lat,
      lng,
      address: address || prev.address,
      province_name: provinceName,
      district_name: districtName
    }));

    // Tìm mã tỉnh/huyện tương ứng từ database
    const matchedProvince = matchAdministrativeUnit(provinceName, provinces);

    if (matchedProvince) {
      getDistrictsByProvince(matchedProvince.code).then(res => {
        const dList = res?.data || [];
        const matchedDistrict = matchAdministrativeUnit(districtName, dList);
        
        setClubData(prev => ({
          ...prev,
          province_code: matchedProvince.code,
          district_code: matchedDistrict ? matchedDistrict.code : prev.district_code,
          province_name: matchedProvince.name,
          district_name: matchedDistrict ? matchedDistrict.name : districtName
        }));
      });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const urls = await uploadImages([file], setUploading);
    if (urls.length > 0) {
      setClubData(prev => ({ ...prev, avatar: urls[0] }));
      toast.success("Đã tải lên ảnh đại diện");
    }
  };

  const handleBackgroundsUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const urls = await uploadImages(files, setUploading);
    if (urls.length > 0) {
      setClubData(prev => ({ ...prev, backgrounds: [...prev.backgrounds, ...urls] }));
      toast.success(`Đã tải lên ${urls.length} ảnh không gian`);
    }
  };

  const removeBackground = (index) => {
    setClubData(prev => ({
      ...prev,
      backgrounds: prev.backgrounds.filter((_, i) => i !== index)
    }));
  };

  const handleSaveClubInfo = async () => {
    setSaving(true);
    try {
      await clubService.updateClub(clubId, clubData);
      toast.success("Cập nhật thông tin quán thành công!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    loadAllData(); // reload original data
  };

  const handleSelectPlan = async (id) => {

    try {

      const payment = await createPayOSSubscriptionPayment(id);

      // lưu subscription để verify sau
      localStorage.setItem("pending_subscription", id);

      // redirect PayOS
      window.location.href = payment.checkoutUrl;

    } catch {
      toast.error("Không tạo được thanh toán");

    }

  };

  const handleSaveBankInfo = async () => {
    if (!clubId) {
      toast.error("Không tìm thấy câu lạc bộ được chọn");
      return;
    }
    if (!clubBank.payos_client_id || !clubBank.payos_api_key || !clubBank.payos_checksum_key) {
      toast.error("Vui lòng nhập đầy đủ PayOS Client ID, API Key, Checksum Key");
      return;
    }
    setBankSaving(true);
    try {
      await clubService.saveClubBank(clubId, clubBank);
      toast.success("Lưu cấu hình PayOS thành công");
      setIsBankRequired(false);
      setIsBankModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu cấu hình PayOS");
    } finally {
      setBankSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
            <p className="text-gray-500">Quản lý thông tin quán, gói dịch vụ và thanh toán</p>
          </div>
          
          {activeTab === "info" && (
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                  >
                    <X className="w-4 h-4" /> Hủy
                  </button>
                  <button
                    onClick={handleSaveClubInfo}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
                  >
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    Lưu thay đổi
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
                >
                  <Pencil className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
            </div>
          )}
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-8 w-fit">
          <button
            onClick={() => setActiveTab("info")}
            disabled={isBankRequired}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "info" ? "bg-orange-500 text-white shadow-md shadow-orange-100" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Thông tin quán
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            disabled={isBankRequired}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "subscription" ? "bg-orange-500 text-white shadow-md shadow-orange-100" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Settings2 className="w-4 h-4" />
            Gói dịch vụ
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "payment" ? "bg-orange-500 text-white shadow-md shadow-orange-100" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </button>
        </div>

        {/* TAB CONTENT: CLUB INFO */}
        {activeTab === "info" && (
          <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Col: Basic Info & Images */}
            <div className="lg:col-span-2 space-y-8">
              {/* Form Cơ bản */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                    <div className="w-2 h-6 bg-orange-500 rounded-full" />
                    Thông tin cơ bản
                  </h3>
                  {!isEditing && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-dashed">Chế độ xem — Bấm "Chỉnh sửa" để sửa</span>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Tên câu lạc bộ</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={clubData.name}
                        onChange={(e) => setClubData({...clubData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/30"
                        placeholder="Nhập tên quán..."
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 font-medium">{clubData.name || "—"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={clubData.phone}
                          onChange={(e) => setClubData({...clubData, phone: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-orange-50/30"
                          placeholder="09xx xxx xxx"
                        />
                      </div>
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />{clubData.phone || "—"}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mô tả quán</label>
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={clubData.description}
                        onChange={(e) => setClubData({...clubData, description: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none bg-orange-50/30"
                        placeholder="Giới thiệu về quán của bạn..."
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 leading-relaxed min-h-[80px]">{clubData.description || "Chưa có mô tả."}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer w-fit">
                      <input 
                        type="checkbox" 
                        checked={clubData.opening_time === "00:00" && clubData.closing_time === "00:00"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setClubData({...clubData, opening_time: "00:00", closing_time: "00:00"});
                          } else {
                            setClubData({...clubData, opening_time: "08:00", closing_time: "23:30"});
                          }
                        }}
                        disabled={!isEditing}
                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                      />
                      Quán mở cửa 24/24 
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Giờ mở cửa</label>
                    {isEditing ? (
                      <input 
                        type="time" 
                        value={clubData.opening_time}
                        onChange={(e) => setClubData({...clubData, opening_time: e.target.value})}
                        disabled={clubData.opening_time === "00:00" && clubData.closing_time === "00:00"}
                        className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-orange-50/30 disabled:opacity-50 disabled:bg-gray-100 disabled:border-gray-200" 
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 font-medium">
                        {(clubData.opening_time === "00:00" && clubData.closing_time === "00:00") ? "Mở cửa 24/24" : (clubData.opening_time || "08:00")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Giờ đóng cửa</label>
                    {isEditing ? (
                      <input 
                        type="time" 
                        value={clubData.closing_time}
                        onChange={(e) => setClubData({...clubData, closing_time: e.target.value})}
                        disabled={clubData.opening_time === "00:00" && clubData.closing_time === "00:00"}
                        className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-orange-50/30 disabled:opacity-50 disabled:bg-gray-100 disabled:border-gray-200" 
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-gray-50 text-gray-800 font-medium">
                        {(clubData.opening_time === "00:00" && clubData.closing_time === "00:00") ? "Mở cửa 24/24" : (
                          <>
                            {clubData.closing_time || "23:30"}
                            {clubData.closing_time && parseInt(clubData.closing_time) < parseInt(clubData.opening_time) && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">+1 ngày</span>
                            )}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  {isEditing && !(clubData.opening_time === "00:00" && clubData.closing_time === "00:00") && clubData.opening_time && clubData.closing_time && (
                    <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                      💡 Nếu quán mở xuyên đêm (ví dụ 08:00 - 04:00 sáng hôm sau), hãy để giờ đóng cửa là 04:00.
                    </div>
                  )}
                </div>
              </div>

              {/* Quản lý ảnh */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
                    <div className="w-2 h-6 bg-orange-500 rounded-full" />
                    Hình ảnh quán
                  </h3>

                  <div className="space-y-8">
                    {/* Avatar Item */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">Avatar (Ảnh đại diện quán)</label>
                        {isEditing && (
                          <label className="cursor-pointer text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Thay đổi
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                          </label>
                        )}
                      </div>
                      
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 group">
                        {clubData.avatar ? (
                          <img src={clubData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Backgrounds Items */}
                    <div className="space-y-4 border-t border-gray-50 pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-bold text-gray-700">Backgrounds (Gallery không gian quán)</label>
                          <p className="text-[10px] text-gray-400">{clubData.backgrounds.length} ảnh • {isEditing ? "Bấm X để xóa" : "Chỉnh sửa để thay đổi"}</p>
                        </div>
                        {isEditing && (
                          <label className="cursor-pointer text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Thêm ảnh
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleBackgroundsUpload} />
                          </label>
                        )}
                      </div>

                      {/* Backgrounds grid with pagination */}
                      {clubData.backgrounds.length > 0 ? (
                        <div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {clubData.backgrounds
                              .slice(bgGalleryPage * BG_PER_PAGE, (bgGalleryPage + 1) * BG_PER_PAGE)
                              .map((url, idx) => {
                                const realIdx = bgGalleryPage * BG_PER_PAGE + idx;
                                return (
                                  <div key={realIdx} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                                    <img src={url} alt={`BG ${realIdx}`} className="w-full h-full object-cover" />
                                    {isEditing && (
                                      <button 
                                        onClick={() => removeBackground(realIdx)}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })
                            }
                            {uploading && (
                              <div className="aspect-video rounded-xl border-2 border-dashed border-orange-100 bg-orange-50/50 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          {/* Pagination controls */}
                          {Math.ceil(clubData.backgrounds.length / BG_PER_PAGE) > 1 && (
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-xs text-gray-400">{bgGalleryPage * BG_PER_PAGE + 1}–{Math.min((bgGalleryPage + 1) * BG_PER_PAGE, clubData.backgrounds.length)} / {clubData.backgrounds.length} ảnh</span>
                              <div className="flex gap-2">
                                <button onClick={() => setBgGalleryPage(p => Math.max(0, p - 1))} disabled={bgGalleryPage === 0} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-all">
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setBgGalleryPage(p => Math.min(Math.ceil(clubData.backgrounds.length / BG_PER_PAGE) - 1, p + 1))} disabled={bgGalleryPage >= Math.ceil(clubData.backgrounds.length / BG_PER_PAGE) - 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-all">
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        !uploading && (
                          <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Chưa có ảnh không gian nào</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
              </div>
            </div>

            {/* Right Col: Address & Map Picker */}
            <div className="space-y-8">
               <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-fit">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                      <div className="w-2 h-6 bg-orange-500 rounded-full" />
                      Vị trí hiển thị
                    </h3>
                    {!isEditing && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-dashed">Chế độ xem</span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-6">
                    {/* Tỉnh/Thành phố và Quận/Huyện ở trong setting*/}
                      {/* <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Tỉnh/Thành phố</label>
                        <select
                          value={clubData.province_code ? String(clubData.province_code) : ""}
                          onChange={handleProvinceChange}
                          className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-orange-50/30"
                        >
                          <option value="">Chọn Tỉnh/Thành...</option>
                          {provinces.map(p => <option key={p.code} value={String(p.code)}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Quận/Huyện</label>
                        <select
                          value={clubData.district_code ? String(clubData.district_code) : ""}
                          onChange={(e) => setClubData({...clubData, district_code: e.target.value})}
                          disabled={!clubData.province_code}
                          className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-50 bg-orange-50/30"
                        >
                          <option value="">Chọn Quận/Huyện...</option>
                          {districts.map(d => <option key={d.code} value={String(d.code)}>{d.name_with_type || d.name}</option>)}
                        </select>
                      </div> */}

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" /> Địa chỉ chi tiết
                        </label>
                        <input
                          type="text"
                          value={clubData.address}
                          onChange={(e) => {
                            setClubData({...clubData, address: e.target.value});
                            setMapSearch(e.target.value);
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-orange-50/30"
                          placeholder="Nhập địa chỉ để tìm trên map..."
                        />
                      </div>

                      <div className="w-full h-[400px] border border-gray-100 rounded-2xl overflow-hidden">
                        <MapAddressPicker 
                          onLocationSelect={handleLocationSelect}
                          initialCoords={clubData.lat && clubData.lng ? { lat: clubData.lat, lng: clubData.lng } : null}
                          searchQuery={mapSearch}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tỉnh / Huyện</p>
                        <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 text-sm">
                          {clubData.province_name || "—"} / {clubData.district_name || "—"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3 text-orange-500" /> Địa chỉ</p>
                        <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 text-sm">{clubData.address || "—"}</p>
                      </div>
                      {/* Mini map preview in view mode */}
                      {clubData.lat && clubData.lng && (
                        <div className="w-full h-[260px] border border-gray-100 rounded-2xl overflow-hidden opacity-80 pointer-events-none">
                          <MapAddressPicker
                            onLocationSelect={() => {}}
                            initialCoords={{ lat: clubData.lat, lng: clubData.lng }}
                            searchQuery=""
                          />
                        </div>
                      )}
                      <p className="text-xs text-center text-gray-400 italic">Bấm "Chỉnh sửa" để thay đổi vị trí quán</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: SUBSCRIPTION */}
        {activeTab === "subscription" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
             {/* CURRENT SUBSCRIPTION */}
            {currentSubscription && (
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-600 to-green-700 rounded-3xl shadow-xl shadow-green-100 p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                   <Settings2 className="w-32 h-32" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Gói đang sử dụng</span>
                    <h3 className="text-3xl font-black">{currentSubscription.subscription_id.name}</h3>
                    <p className="opacity-90 max-w-md">{currentSubscription.subscription_id.description}</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-3 min-w-[240px]">
                    <div className="flex justify-between text-sm">
                       <span className="opacity-80">Ngày mua:</span>
                       <span className="font-bold">{new Date(currentSubscription.purchase_date).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="opacity-80">Ngày hết hạn:</span>
                       <span className="font-bold">{new Date(currentSubscription.expire_date).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                       <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                       <span className="text-xs font-bold">Trạng thái: Hoạt động</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
               <h2 className="text-3xl font-black text-gray-900">Chọn gói Subscription</h2>
               <p className="text-gray-500">Nâng cấp trải nghiệm quản lý bida chuyên nghiệp hơn</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {subscriptions.map((sub) => {
                const price = sub.price.toLocaleString("vi-VN");
                const isCurrent = currentSubscription?.subscription_id?._id === sub._id;

                return (
                  <div
                    key={sub._id}
                    className={`bg-white rounded-[2.5rem] shadow-sm p-8 border-2 transition-all hover:shadow-xl hover:shadow-gray-200/50 group flex flex-col
                    ${isCurrent ? "border-orange-500 ring-4 ring-orange-50" : "border-gray-100"}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isCurrent ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                           <ImageIcon className="w-7 h-7" />
                        </div>
                        {isCurrent && (
                          <span className="text-xs font-black bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full uppercase">Current</span>
                        )}
                      </div>

                      <h3 className="text-xl font-black mb-1">{sub.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                         <span className="text-4xl font-black text-gray-900">{price}đ</span>
                         <span className="text-gray-400 font-medium">/tháng</span>
                      </div>

                      <div className="space-y-4 mb-8">
                         <p className="text-gray-500 text-sm leading-relaxed">{sub.description}</p>
                         <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                               <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                               Tính năng quản lý bàn nâng cao
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-600">
                               <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                               Báo cáo doanh thu chi tiết
                            </li>
                         </ul>
                      </div>
                    </div>

                    <button
                      disabled={isCurrent}
                      onClick={() => handleSelectPlan(sub._id)}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all
                      ${isCurrent 
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                        : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"}`}
                    >
                      {isCurrent ? "Đang sử dụng" : "Nâng cấp ngay"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB CONTENT: PAYMENT */}
        {activeTab === "payment" && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                Phương thức thanh toán
              </h3>

              <div className="grid gap-4">
                <div className="p-6 rounded-2xl border-2 border-orange-500 bg-orange-50/20 flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2">
                      <img
                        src="/vnpay-logo.png"
                        alt="VNPay"
                        className="w-full h-auto"
                        onError={(e) => {
                          e.target.src =
                            "https://play-lh.googleusercontent.com/9_S-O96O3K0X5G-w-6S8-3H-6X5-X-O-6-X-O-6-X-O-6-X-O-6-X-O-6-X-O-6-X-O-6-X-O-6-X-O-6-X-O-6-X";
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-black text-gray-900">Ví VNPay / Ngân hàng</p>
                      <p className="text-sm text-gray-500">Mặc định - Đang hoạt động</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">✓</div>
                </div>

                <div className="p-6 rounded-2xl border-2 border-gray-50 bg-gray-50/30 flex items-center justify-between group grayscale hover:grayscale-0 transition-all cursor-not-allowed opacity-60">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2">
                      <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="w-full h-auto" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Ví MoMo</p>
                      <p className="text-sm text-gray-500">Đang bảo trì...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PayOS config for club */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                Thiết lập PayOS cho CLB
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Mỗi CLB dùng 1 PayOS riêng (Client ID, API Key, Checksum Key). Bạn cần hoàn tất bước này trước khi dùng các chức năng quản lý.
              </p>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-6">
                <p className="text-sm text-emerald-800 font-semibold mb-2">Hướng dẫn đăng ký PayOS</p>
                <ol className="text-sm text-emerald-800/80 list-decimal pl-5 space-y-1">
                  <li>Tạo tài khoản Merchant trên PayOS và hoàn tất xác thực doanh nghiệp/cá nhân.</li>
                  <li>Vào phần quản trị PayOS → mục API/Keys.</li>
                  <li>Sao chép 3 thông tin: <b>Client ID</b>, <b>API Key</b>, <b>Checksum Key</b>.</li>
                  <li>Dán vào form bên dưới và bấm lưu.</li>
                </ol>
                <p className="text-xs text-emerald-700 mt-2">
                  Lưu ý: API Key/Checksum Key là bí mật. Không chia sẻ cho người khác.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">PayOS Client ID</label>
                  <input
                    type="text"
                    value={clubBank.payos_client_id}
                    onChange={(e) => setClubBank({ ...clubBank, payos_client_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Nhập PayOS Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">PayOS API Key</label>
                  <input
                    type="password"
                    value={clubBank.payos_api_key}
                    onChange={(e) => setClubBank({ ...clubBank, payos_api_key: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Nhập PayOS API Key"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">PayOS Checksum Key</label>
                  <input
                    type="password"
                    value={clubBank.payos_checksum_key}
                    onChange={(e) => setClubBank({ ...clubBank, payos_checksum_key: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Nhập PayOS Checksum Key"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveBankInfo}
                  disabled={bankSaving}
                  className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all disabled:opacity-60"
                >
                  {bankSaving ? "Đang lưu..." : "Lưu cấu hình PayOS"}
                </button>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl">
              <h4 className="font-bold text-orange-800 mb-2">💡 Lưu ý quan trọng</h4>
              <p className="text-sm text-orange-700/80 leading-relaxed">
                Các giao dịch thanh toán Subscription sẽ được xử lý ngay lập tức thông qua cổng thanh toán bảo mật.
                Hóa đơn điện tử sẽ được gửi về email tài khoản của bạn sau khi thanh toán thành công.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bank info required modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Thiết lập PayOS cho CLB</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng thiết lập PayOS cho CLB. Bạn cần hoàn thành bước này trước khi sử dụng đầy đủ các chức năng quản lý quán.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">PayOS Client ID</label>
                <input
                  type="text"
                  value={clubBank.payos_client_id}
                  onChange={(e) => setClubBank({ ...clubBank, payos_client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Nhập PayOS Client ID"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">PayOS API Key</label>
                <input
                  type="password"
                  value={clubBank.payos_api_key}
                  onChange={(e) => setClubBank({ ...clubBank, payos_api_key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Nhập PayOS API Key"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">PayOS Checksum Key</label>
                <input
                  type="password"
                  value={clubBank.payos_checksum_key}
                  onChange={(e) => setClubBank({ ...clubBank, payos_checksum_key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Nhập PayOS Checksum Key"
                />
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={handleSaveBankInfo}
                disabled={bankSaving}
                className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all disabled:opacity-60"
              >
                {bankSaving ? "Đang lưu..." : "Lưu & tiếp tục"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
