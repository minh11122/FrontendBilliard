import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { Save, Info, ImagePlus, X } from "lucide-react";
import { createService } from "@/services/service.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OwnerCreateServicePage() {
  const navigate = useNavigate();
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";
  const fileInputRef = useRef(null);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      description: "",
    },
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
        imageFiles.forEach((file) => formData.append("images", file));

        const res = await createService(formData);
        if (res.data.success) {
          toast.success("Tạo dịch vụ mới thành công!");
          navigate("/owner/services");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo dịch vụ");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh!");
      return;
    }
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const inputClassName = "w-full rounded-lg border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-primary/20 transition-all text-slate-900 shadow-none";

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="hidden lg:flex items-center gap-2 text-sm mb-6">
        <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer">Trang chủ</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/owner/services")}>Quản lý Dịch vụ</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Thêm dịch vụ mới</span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thêm dịch vụ mới</h1>
            <p className="text-slate-500 mt-1">Nhập thông tin chi tiết để tạo dịch vụ mới.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all shadow-sm">
              Hủy bỏ
            </button>
            <button type="button" onClick={formik.handleSubmit} disabled={formik.isSubmitting}
              className="px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-[#0fd650] font-semibold transition-all shadow-sm shadow-primary/30 flex items-center gap-2 disabled:opacity-60">
              <Save size={20} /> {formik.isSubmitting ? "Đang lưu..." : "Lưu dịch vụ"}
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
                <Input placeholder="VD: Nước suối, Khăn lạnh, Cho thuê cơ..." className={`${inputClassName} ${formik.touched.name && formik.errors.name ? "border-red-500" : ""}`} {...formik.getFieldProps("name")} />
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

          {/* Upload ảnh */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <ImagePlus className="text-slate-400" size={22} />
              Hình ảnh dịch vụ
            </h3>
            <p className="text-xs text-slate-400 mb-5">Tối đa 5 ảnh, định dạng JPG/PNG. Ảnh giúp khách hàng nhận biết dịch vụ dễ hơn.</p>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={src} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageFiles.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer"
              >
                <ImagePlus size={28} />
                <span className="text-sm font-medium">Nhấn để chọn ảnh ({imageFiles.length}/5)</span>
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
