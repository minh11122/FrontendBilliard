import { useState, useEffect } from "react";
import { clubService } from "@/services/club.service";
import toast from "react-hot-toast";
import { 
  Wifi, 
  Coffee, 
  Car, 
  CigaretteOff, 
  Save, 
  Sparkles,
  X,
  Plus,
  Info
} from "lucide-react";

const STANDARD_AMENITIES = [
  { id: "Wifi miễn phí", label: "Wifi miễn phí", icon: Wifi },
  { id: "Máy lạnh", label: "Máy lạnh", icon: Coffee },
  { id: "Bãi xe ô tô", label: "Bãi xe ô tô", icon: Car },
  { id: "Không hút thuốc", label: "Không hút thuốc", icon: CigaretteOff },
];

export default function AmenitiesPage() {
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [tempAmenities, setTempAmenities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const clubId = localStorage.getItem("selected_club_id");

  useEffect(() => {
    if (clubId) {
      fetchAmenities();
    }
  }, [clubId]);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const res = await clubService.getClubById(clubId);
      if (res.success && res.data) {
        setSelectedAmenities(res.data.amenities || []);
        setTempAmenities(res.data.amenities || []);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error("Không thể tải thông tin tiện ích");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setTempAmenities([...selectedAmenities]);
    setCustomInput("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTempAmenities([...selectedAmenities]);
    setIsEditing(false);
  };

  const addAmenity = (label) => {
    if (!label.trim()) return;
    if (tempAmenities.includes(label.trim())) {
      toast.error("Tiện ích này đã tồn tại");
      return;
    }
    setTempAmenities(prev => [...prev, label.trim()]);
    setCustomInput("");
  };

  const removeAmenity = (label) => {
    setTempAmenities(prev => prev.filter(item => item !== label));
  };

  const handleSave = async () => {
    if (!clubId) return;
    setSaving(true);
    try {
      await clubService.updateClub(clubId, { amenities: tempAmenities });
      setSelectedAmenities([...tempAmenities]);
      setIsEditing(false);
      toast.success("Cập nhật tiện ích thành công!");
    } catch (error) {
      console.error("Error saving amenities:", error);
      toast.error("Lỗi khi lưu tiện ích");
    } finally {
      setSaving(false);
    }
  };

  const getAmemityIcon = (label) => {
    const standard = STANDARD_AMENITIES.find(s => s.id === label);
    if (standard) {
      const Icon = standard.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Sparkles className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            {isEditing ? "Chỉnh sửa tiện ích" : "Quản lý tiện ích"}
          </h1>
          <p className="text-gray-500">
            {isEditing 
              ? "Tùy chỉnh các tiện ích hiển thị trên trang chi tiết quán của bạn" 
              : "Danh sách các tiện ích hiện có tại cơ sở của bạn"}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Chỉnh sửa
            </button>
          ) : (
            <>
              <button
                onClick={cancelEditing}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Lưu thay đổi
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Amenities Section */}
        <div className={isEditing ? "lg:col-span-2 space-y-6" : "lg:col-span-3"}>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" />
              {isEditing ? `Đang chỉnh sửa (${tempAmenities.length})` : `Tiện ích hiện tại (${selectedAmenities.length})`}
            </h2>
            
            {(isEditing ? tempAmenities : selectedAmenities).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {(isEditing ? tempAmenities : selectedAmenities).map((amenity) => (
                  <div 
                    key={amenity}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl border border-gray-100 transition-all hover:bg-white hover:border-orange-200"
                  >
                    <div className="text-orange-500">
                      {getAmemityIcon(amenity)}
                    </div>
                    <span className="text-sm font-medium">{amenity}</span>
                    {isEditing && (
                      <button 
                        onClick={() => removeAmenity(amenity)}
                        className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400 text-sm">Chưa có tiện ích nào được chọn.</p>
                {!isEditing && (
                  <button onClick={startEditing} className="mt-4 text-orange-500 font-bold hover:underline">
                    Bắt đầu chỉnh sửa ngay
                  </button>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-in slide-in-from-bottom-2">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                Thêm tiện ích tùy chỉnh
              </h2>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAmenity(customInput)}
                  placeholder="Nhập tên tiện ích (VD: Bida VIP, Bia hơi...)"
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
                <button 
                  onClick={() => addAmenity(customInput)}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                >
                  Thêm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Suggestions (Only in edit mode) */}
        {isEditing && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Gợi ý nhanh
              </h2>
              <div className="space-y-2">
                {STANDARD_AMENITIES.map((item) => {
                  const isSelected = tempAmenities.includes(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      disabled={isSelected}
                      onClick={() => addAmenity(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                        isSelected 
                          ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" 
                          : "bg-white border-white hover:border-orange-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-gray-200" : "bg-orange-100 text-orange-600"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      {!isSelected && <Plus className="w-4 h-4 text-orange-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl">
              <p className="text-xs text-orange-700 leading-relaxed">
                <strong>Mẹo:</strong> Thêm các tiện ích đặc trưng để giúp khách hàng dễ dàng tìm thấy và lựa chọn quán của bạn hơn!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
