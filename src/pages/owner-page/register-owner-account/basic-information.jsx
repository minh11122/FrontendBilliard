import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Building, MapPin, Phone, FileText, Image, Search, X } from "lucide-react";
import { registerClub } from "@/services/club.service";
import { getProvinces, getDistrictsByProvince, matchAdministrativeUnit } from "@/services/location.service";
import { useState, useEffect, useRef } from "react";
import { MapAddressPicker } from "@/components/common/MapAddressPicker";
import { uploadImages } from "@/utils/cloudinary";

export function RegisterOwnerAccount() {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await getProvinces();
        setProvinces(res);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  const validationSchema = Yup.object({
    name: Yup.string().required("Vui lòng nhập tên CLB"),
    province_code: Yup.string().required("Vui lòng chọn Tỉnh/Thành phố"),
    district_code: Yup.string().required("Vui lòng chọn Quận/Phuyện/Phường"),
    address: Yup.string().required("Vui lòng nhập địa chỉ chi tiết"),
    phone: Yup.string().required("Vui lòng nhập số điện thoại"),
    tax_code: Yup.string().required("Vui lòng nhập mã số thuế"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      province_code: "",
      district_code: "",
      address: "",
      lat: null,
      lng: null,
      phone: "",
      tax_code: "",
      description: "",
      legalDocuments: [],
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        await registerClub(values);

        toast.success("Đăng ký CLB thành công! Chờ admin duyệt.");

        navigate("/");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Đăng ký CLB thất bại"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formik.values.province_code) {
        try {
          const res = await getDistrictsByProvince(formik.values.province_code);
          setDistricts(res);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [formik.values.province_code]);

  const handleLocationSelect = async (locationData) => {
    const { lat, lng, address, provinceName, districtName, isFromSearch } = locationData;
    
    // 1. Update lat/lng
    formik.setFieldValue("lat", lat);
    formik.setFieldValue("lng", lng);

    // Nếu không phải từ search (tức là từ kéo marker), update lại ô input địa chỉ cho chuẩn
    if (!isFromSearch) {
      formik.setFieldValue("address", address);
    }

    // 2. Map Province Name to Code
    const matchedProvince = matchAdministrativeUnit(provinceName, provinces);
    if (matchedProvince) {
      formik.setFieldValue("province_code", matchedProvince.code);
      
      // 3. Map District Name to Code
      try {
        const districtList = await getDistrictsByProvince(matchedProvince.code);
        setDistricts(districtList);
        
        const matchedDistrict = matchAdministrativeUnit(districtName, districtList);
        if (matchedDistrict) {
          formik.setFieldValue("district_code", matchedDistrict.code);
        } else {
            // Xóa code nếu không khớp để tránh data cũ
            formik.setFieldValue("district_code", "");
        }
      } catch (error) {
        console.error("Error matching district:", error);
      }
    } else {
        formik.setFieldValue("province_code", "");
        formik.setFieldValue("district_code", "");
    }
  };

  useEffect(() => {
    return () => {
      previewImages.forEach((image) => {
        if (image.previewUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, [previewImages]);

  // upload ảnh
  const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || []);
  e.target.value = "";

  if (files.length === 0) return;

  const newPreviewItems = files.map((file) => ({
    id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    previewUrl: URL.createObjectURL(file),
    uploadedUrl: "",
  }));

  setPreviewImages((prev) => [...prev, ...newPreviewItems]);

  try {
    const urls = await uploadImages(files, setIsUploadingImage);
    if (urls.length > 0 && urls.length === newPreviewItems.length) {
      setPreviewImages((prev) => {
        const uploadedMap = new Map(
          newPreviewItems.map((item, index) => [item.id, urls[index]])
        );

        const updatedPreviews = prev.map((item) =>
          uploadedMap.has(item.id)
            ? { ...item, uploadedUrl: uploadedMap.get(item.id) }
            : item
        );

        formik.setFieldValue(
          "legalDocuments",
          updatedPreviews
            .map((item) => item.uploadedUrl)
            .filter(Boolean)
        );

        return updatedPreviews;
      });
      toast.success("Tải ảnh thành công!");
    } else {
      newPreviewItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPreviewImages((prev) =>
        prev.filter((item) => !newPreviewItems.some((newItem) => newItem.id === item.id))
      );
      toast.error("Tải ảnh thất bại!");
    }
  } catch {
    newPreviewItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setPreviewImages((prev) =>
      prev.filter((item) => !newPreviewItems.some((newItem) => newItem.id === item.id))
    );
    toast.error("Có lỗi xảy ra khi tải ảnh.");
  }
};

  const handleRemoveImage = (imageId) => {
    setPreviewImages((prev) => {
      const imageToRemove = prev.find((item) => item.id === imageId);
      if (!imageToRemove) return prev;

      if (imageToRemove.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      const updatedPreviews = prev.filter((item) => item.id !== imageId);

      formik.setFieldValue(
        "legalDocuments",
        updatedPreviews.map((item) => item.uploadedUrl).filter(Boolean)
      );

      return updatedPreviews;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      
      

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden">
        
        {/* LEFT FORM */}
        <div className="p-8 md:p-10">

          <h2 className="text-2xl font-bold mb-2">
            Đăng ký làm chủ câu lạc bộ
          </h2>

          <p className="text-gray-500 mb-6">
            Điền thông tin để đăng ký quản lý câu lạc bộ billiards.
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-5">

            {/* Tên CLB */}
            <div className="group">
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Tên câu lạc bộ</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors"/>
                <input
                  name="name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                  className="pl-11 border-2 border-gray-100 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-2xl w-full px-3 py-3 outline-none transition-all"
                  placeholder="Ví dụ: Billiards Club Hà Đông"
                />
              </div>
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-[11px] mt-1 ml-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Địa chỉ chi tiết (Search Box) */}
            <div className="group">
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">Địa chỉ chi tiết (Dùng để tìm trên Map)</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors"/>
                <input
                  name="address"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                  className="pl-11 border-2 border-gray-100 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-2xl w-full px-3 py-3 outline-none transition-all font-medium"
                  placeholder="Gõ số nhà, tên đường để Map tự tìm..."
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">
                💡 Bản đồ bên dưới sẽ tự động di chuyển khi bạn nhập địa chỉ.
              </p>
            </div>

            {/* Bản đồ chọn địa chỉ */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <MapPin className="w-5 text-green-600" />
                  </div>
                  Xác nhận vị trí trên bản đồ
                </label>
                {formik.values.lat && (
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-mono border border-gray-200">
                    {formik.values.lat.toFixed(6)}, {formik.values.lng.toFixed(6)}
                  </span>
                )}
              </div>
              
              <div className="h-[400px] overflow-hidden rounded-3xl border-4 border-gray-50 shadow-inner relative group">
                <MapAddressPicker 
                    onLocationSelect={handleLocationSelect} 
                    searchQuery={formik.values.address}
                />
              </div>

              {/* Thông tin vùng hành chính tự động */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 transition-all hover:bg-blue-50">
                  <span className="text-[10px] text-blue-600 uppercase font-black tracking-wider block mb-1">Tỉnh / Thành phố</span>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {provinces.find(p => p.code === formik.values.province_code)?.name || (
                        <span className="text-gray-400 font-normal italic">Đang xác định...</span>
                    )}
                  </p>
                </div>
                <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50 transition-all hover:bg-orange-50">
                  <span className="text-[10px] text-orange-600 uppercase font-black tracking-wider block mb-1">Quận / Huyện</span>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {districts.find(d => d.code === formik.values.district_code)?.name_with_type || (
                         <span className="text-gray-400 font-normal italic">Đang xác định...</span>
                    )}
                  </p>
                </div>
              </div>

              {(formik.errors.province_code || formik.errors.address) && formik.touched.address && (
                <div className="bg-red-50 text-red-600 text-[11px] p-3 rounded-2xl border border-red-100 flex items-start gap-3 animate-pulse">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0">!</div>
                  <p className="leading-relaxed">
                    Hệ thống chưa tìm thấy tọa độ chính xác. Vui lòng gõ địa chỉ chi tiết hơn hoặc kéo biểu tượng ghim trên bản đồ.
                  </p>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 text-gray-400"/>
                <input
                  name="phone"
                  onChange={formik.handleChange}
                  value={formik.values.phone}
                  className="pl-10 border rounded-xl w-full px-3 py-2.5"
                />
              </div>
            </div>

            {/* Tax code */}
            <div>
              <label className="text-sm font-medium">Mã số thuế</label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 text-gray-400"/>
                <input
                  name="tax_code"
                  onChange={formik.handleChange}
                  value={formik.values.tax_code}
                  className="pl-10 border rounded-xl w-full px-3 py-2.5"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                name="description"
                rows="3"
                onChange={formik.handleChange}
                value={formik.values.description}
                className="border rounded-xl w-full px-3 py-2.5"
                placeholder="Giới thiệu về câu lạc bộ..."
              />
            </div>

            {/* Upload */}
            <div>
              <label className="text-sm font-medium">
                Ảnh giấy phép kinh doanh
              </label>

              <div
                className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  isUploadingImage
                    ? "bg-gray-50 border-gray-300"
                    : "hover:border-green-500 bg-white cursor-pointer"
                }`}
                onClick={() => {
                  if (!isUploadingImage) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <Image className="mx-auto mb-2 text-gray-400" />
                {isUploadingImage ? (
                  <p className="text-sm text-gray-500 font-medium">Đang tải ảnh lên hệ thống...</p>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-700 font-medium">
                      Bấm vào đây để chọn một hoặc nhiều ảnh
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ảnh sẽ hiển thị ngay sau khi bạn chọn.
                    </p>
                    {formik.values.legalDocuments.length > 0 && (
                      <p className="text-xs text-green-600 mt-3 font-medium">
                        Đã tải lên {formik.values.legalDocuments.length} ảnh hợp lệ
                      </p>
                    )}
                  </>
                )}
              </div>

              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previewImages.map((image) => (
                    <div key={image.id} className="relative rounded-xl border overflow-hidden bg-gray-50">
                      <img
                        src={image.previewUrl}
                        alt="Giấy phép kinh doanh"
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveImage(image.id);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 hover:bg-black/80 text-white flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting || isUploadingImage}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Đang gửi..." : "Đăng ký CLB"}
            </button>

          </form>
        </div>

        {/* RIGHT HERO */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1600"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-black/80" />

          <div className="relative h-full p-10 text-white flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">
              Quản lý câu lạc bộ billiards
            </h3>

            <p className="text-white/80">
              Quản lý bàn, nhân viên, lịch đặt bàn và doanh thu
              trong một hệ thống duy nhất.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}