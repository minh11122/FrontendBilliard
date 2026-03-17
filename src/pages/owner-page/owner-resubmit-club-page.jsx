import { useNavigate, useParams, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Building, MapPin, Phone, FileText, Image, Search, Loader } from "lucide-react";
import { updateClub, getClubById } from "@/services/club.service";
import { getProvinces, getDistrictsByProvince, matchAdministrativeUnit } from "@/services/location.service";
import { useState, useEffect } from "react";
import { MapAddressPicker } from "@/components/common/MapAddressPicker";
import { uploadImages } from "@/utils/cloudinary";

export function OwnerResubmitClubPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
    district_code: Yup.string().required("Vui lòng chọn Quận/Huyện/Phường"),
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
        if (!editId) {
          toast.error("Không tìm thấy thông tin quán cần gửi lại");
          return;
        }
        await updateClub(editId, values);
        toast.success("Gửi lại thông tin thành công! Vui lòng chờ admin duyệt lại.");
        navigate("/owner/select-club");
      } catch (error) {
        toast.error(error.response?.data?.message || "Cập nhật thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Load existing data if resubmitting
  useEffect(() => {
    const loadClubData = async () => {
      if (!editId) return;
      try {
        const res = await getClubById(editId);
        if (res?.data) {
          const clubInfo = res.data;
          // Set formik values
          formik.setValues({
            name: clubInfo.name || "",
            province_code: clubInfo.province_code || "",
            district_code: clubInfo.district_code || "",
            address: clubInfo.address || "",
            lat: clubInfo.lat || null,
            lng: clubInfo.lng || null,
            phone: clubInfo.phone || "",
            tax_code: clubInfo.tax_code || "",
            description: clubInfo.description || "",
            legalDocuments: clubInfo.images?.filter(img => img.image_type === "legal documents").map(img => img.image_url) || [],
          });
          
          if (clubInfo.province_code) {
             const dList = await getDistrictsByProvince(clubInfo.province_code);
             setDistricts(dList);
          }
        }
      } catch (error) {
        toast.error("Không thể tải thông tin quán!");
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadClubData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // Fetch districts when province changes interactively
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formik.values.province_code && !initialLoading) { // Avoid refetching during initial load
        try {
          const res = await getDistrictsByProvince(formik.values.province_code);
          setDistricts(res);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      }
    };
    fetchDistricts();
  }, [formik.values.province_code, initialLoading]);

  const handleLocationSelect = async (locationData) => {
    const { lat, lng, address, provinceName, districtName, isFromSearch } = locationData;
    
    formik.setFieldValue("lat", lat);
    formik.setFieldValue("lng", lng);

    if (!isFromSearch) {
      formik.setFieldValue("address", address);
    }

    const matchedProvince = matchAdministrativeUnit(provinceName, provinces);
    if (matchedProvince) {
      formik.setFieldValue("province_code", matchedProvince.code);
      
      try {
        const districtList = await getDistrictsByProvince(matchedProvince.code);
        setDistricts(districtList);
        
        const matchedDistrict = matchAdministrativeUnit(districtName, districtList);
        if (matchedDistrict) {
          formik.setFieldValue("district_code", matchedDistrict.code);
        } else {
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const urls = await uploadImages(files, setIsUploadingImage);
      if (urls.length > 0) {
        // Replace old legal docs or append? The backend takes the list and replaces it entirely for legal documents.
        // It's safer to just let them replace the whole list if they re-upload, or append? Let's append so they can add more.
        formik.setFieldValue("legalDocuments", [...formik.values.legalDocuments, ...urls]);
        toast.success("Tải ảnh thành công!");
      } else {
        toast.error("Tải ảnh thất bại! Vui lòng thử lại.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên.");
    }
  };
  
  const handleRemoveDocument = (index) => {
      const newDocs = formik.values.legalDocuments.filter((_, i) => i !== index);
      formik.setFieldValue("legalDocuments", newDocs);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      
      {/* top bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <Link to="/owner/select-club" className="flex items-center gap-2 font-bold text-gray-500 hover:text-green-600 transition-colors">
          <span>&larr; Quay lại chọn quán</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden">
        
        {/* LEFT FORM */}
        <div className="p-8 md:p-10">

          <h2 className="text-2xl font-bold mb-2 text-red-600">
            Cập nhật lại thông tin câu lạc bộ
          </h2>

          <p className="text-gray-500 mb-6">
            Chỉnh sửa các thông tin chưa chính xác để quản trị viên có thể xét duyệt lại.
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
              </div>
              
              <div className="h-[400px] overflow-hidden rounded-3xl border-4 border-gray-50 shadow-inner relative group">
                <MapAddressPicker 
                    onLocationSelect={handleLocationSelect} 
                    searchQuery={formik.values.address}
                    initialCoords={formik.values.lat ? { lat: formik.values.lat, lng: formik.values.lng } : null}
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
            </div>

            {/* Phone & Tax */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Ảnh giấy phép kinh doanh</label>
                  <label className="cursor-pointer text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                      Tải lên thêm
                      <input type="file" multiple onChange={handleImageUpload} disabled={isUploadingImage} className="hidden" />
                  </label>
              </div>

              {isUploadingImage && <p className="text-sm text-gray-500 font-medium mt-2">Đang tải ảnh lên hệ thống...</p>}
              
              {formik.values.legalDocuments.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                      {formik.values.legalDocuments.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                              <img src={url} alt={`Legal ${idx}`} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => handleRemoveDocument(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                  Xóa
                              </button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="mt-2 border-2 border-dashed rounded-xl p-6 text-center text-gray-400 bg-gray-50 group-hover:border-green-500 cursor-pointer">
                       Chưa có ảnh giấy phép nào
                  </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting || isUploadingImage}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed shadow-lg mt-4"
            >
              {formik.isSubmitting ? "Đang cập nhật..." : "Cập nhật & Gửi lại duyệt"}
            </button>

          </form>
        </div>

        {/* RIGHT HERO */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=1600"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/90 to-black/80" />
          <div className="relative h-full p-10 text-white flex flex-col justify-center">
            <h3 className="text-3xl font-bold mb-4">
              Cập nhật thông tin
            </h3>
            <p className="text-white/80">
              Chỉ mất vài giây để cập nhật lại thông tin hồ sơ kinh doanh của bạn. Hệ thống sẽ ngay lập tức chuyển hồ sơ cho quản trị viên xét duyệt.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OwnerResubmitClubPage;
