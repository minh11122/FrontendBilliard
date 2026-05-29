import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { Save, Info, ImagePlus, X } from "lucide-react";
import { updateService, getServiceById } from "@/services/service.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OwnerEditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFetchingData, setIsFetchingData] = useState(true);
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";
  const fileInputRef = useRef(null);

  // Ảnh hiện có từ DB
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Ảnh mới thêm
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      description: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Tên dịch vụ không được để trống").max(150, "Tên tối đa 150 ký tự"),
      price: Yup.number()
        .typeError("Giá phải là số")
        .positive("Giá phải lớn hơn 0")
        .max(100000000, "Giá tối đa 100,000,000 VNĐ")
        .required("Giá không được để trống"),
      description: Yup.string().max(500, "Mô tả tối đa 500 ký tự"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!CLUB_ID) {
        toast.error("Không tìm thấy thông tin quán!");
        return;
      }
      try {
        const formData = new FormData();
        formData.append("club_id", CLUB_ID);
        formData.append("name", values.name.trim());
        formData.append("price", Number(values.price));
        formData.append("description", values.description || "");

        // Ảnh bị xóa
        removedImages.forEach((url) => formData.append("removedImages", url));

        // Ảnh mới upload
        newImageFiles.forEach((file) => formData.append("images", file));

        const res = await updateService(id, formData);
        if (res.data.success) {
          toast.success("Cập nhật dịch vụ thành công!");
          navigate("/owner/services");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật dịch vụ");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getServiceById(id);
        if (res.data.success) {
          const data = res.data.data;
          formik.setValues({
            name: data.name || "",
            price: data.price || "",
            description: data.description || "",
          });
          setExistingImages(data.images || []);
        }
      } catch (error) {
        toast.error("Không thể tải thông tin dịch vụ");
        navigate("/owner/services");
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchData();
  }, [id]);

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = existingImages.length + newImageFiles.length + files.length;
    if (totalCount > 5) {
      toast.error("Tổng số ảnh tối đa là 5!");
      return;
    }
    const updatedFiles = [...newImageFiles, ...files];
    setNewImageFiles(updatedFiles);
    setNewImagePreviews(updatedFiles.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages = existingImages.length + newImageFiles.length;
  const inputClassName = "w-full rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 transition-all text-slate-900 shadow-none";

  if (isFetchingData) {
    return (
      <div className="flex-1 p-6 lg:p-10 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="hidden lg:flex items-center gap-2 text-sm mb-6">
        <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer">Trang chủ</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/owner/services")}>Quản lý Dịch vụ</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Chỉnh sửa dịch vụ</span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Chỉnh sửa dịch vụ</h1>
            <p className="text-slate-500 mt-1">Cập nhật thông tin chi tiết dịch vụ.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all shadow-sm">
              Hủy bỏ
            </button>
            <button type="button" onClick={formik.handleSubmit} disabled={formik.isSubmitting}
              className="px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-[#0fd650] font-semibold transition-all shadow-sm shadow-primary/30 flex items-center gap-2 disabled:opacity-60">
              <Save size={20} /> {formik.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <div className="max-w-2xl flex flex-col gap-6">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Info className="text-slate-400" size={22} />
              Thông tin dịch vụ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Tên dịch vụ <span className="text-red-500">*</span></Label>
                <Input placeholder="VD: Nước suối, Khăn lạnh..." className={`${inputClassName} ${formik.touched.name && formik.errors.name ? "border-red-500" : ""}`} {...formik.getFieldProps("name")} />
                {formik.touched.name && formik.errors.name && <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>}
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Giá (VNĐ) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type="number" placeholder="0" className={`pr-16 text-right font-medium ${inputClassName} ${formik.touched.price && formik.errors.price ? "border-red-500" : ""}`} {...formik.getFieldProps("price")} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium bg-slate-200/60 px-2 py-0.5 rounded">VNĐ</div>
                </div>
                {formik.touched.price && formik.errors.price && <p className="text-xs text-red-500 mt-1">{formik.errors.price}</p>}
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</Label>
                <Textarea placeholder="Mô tả chi tiết về dịch vụ..." rows={4} className={`${inputClassName} resize-none`} {...formik.getFieldProps("description")} />
                <p className="text-xs text-slate-400 mt-2 text-right">{formik.values.description.length}/500 ký tự</p>
              </div>
            </div>
          </div>

          {/* Quản lý ảnh */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <ImagePlus className="text-slate-400" size={22} />
              Hình ảnh dịch vụ
            </h3>
            <p className="text-xs text-slate-400 mb-5">Tối đa 5 ảnh, định dạng JPG/PNG. Hover vào ảnh để xóa.</p>

            {/* Ảnh hiện có */}
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Ảnh hiện tại</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ảnh mới */}
            {newImagePreviews.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Ảnh mới thêm</p>
                <div className="grid grid-cols-3 gap-3">
                  {newImagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-dashed border-primary/50">
                      <img src={src} alt={`Ảnh mới ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nút thêm ảnh */}
            {totalImages < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer"
              >
                <ImagePlus size={28} />
                <span className="text-sm font-medium">Thêm ảnh ({totalImages}/5)</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
}
