import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { ImagePlus, Save, Info, X } from "lucide-react";

import { createTable, getTableTypes } from "@/services/billiardTable.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OwnerCreateTablePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [tableTypes, setTableTypes] = useState([]);

  const CLUB_ID = localStorage.getItem("selected_club_id") || "";

  useEffect(() => {
    const fetchTableTypes = async () => {
      try {
        const res = await getTableTypes();
        if (res.data.success) {
          setTableTypes(res.data.data);
        }
      } catch (error) {
        toast.error("Không thể tải danh sách loại bàn");
      }
    };
    fetchTableTypes();
  }, []);

  const formik = useFormik({
    initialValues: {
      table_number: "",
      table_type_id: "",
      price: "",
      description: "",
    },
    validationSchema: Yup.object({
      table_number: Yup.string().required("Tên bàn không được để trống"),
      table_type_id: Yup.string().required("Vui lòng chọn loại bàn"),
      price: Yup.number()
        .typeError("Đơn giá phải là số")
        .positive("Đơn giá phải lớn hơn 0")
        .required("Đơn giá không được để trống"),
      description: Yup.string().max(500, "Mô tả tối đa 500 ký tự"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!CLUB_ID) {
        toast.error("Không tìm thấy thông tin quán. Vui lòng đăng nhập lại!");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("club_id", CLUB_ID);
        formData.append("table_number", values.table_number);
        formData.append("table_type_id", values.table_type_id);
        formData.append("price", values.price);
        formData.append("description", values.description);
        formData.append("area", "Khu vực chung");
        formData.append("isActive", true);

        imageFiles.forEach((file) => formData.append("images", file));

        const res = await createTable(formData);

        if (res.data.success) {
          toast.success("Thêm bàn mới thành công!");
          navigate("/owner/tables");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm bàn");
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
        <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/owner/tables")}>Quản lý bàn</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Thêm bàn mới</span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thêm bàn mới</h1>
            <p className="text-slate-500 mt-1">Nhập thông tin chi tiết để tạo bàn mới vào hệ thống quản lý.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all shadow-sm">
              Hủy bỏ
            </button>
            <button type="button" onClick={formik.handleSubmit} disabled={formik.isSubmitting}
              className="px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-[#0fd650] font-semibold transition-all shadow-sm shadow-primary/30 flex items-center gap-2 disabled:opacity-60">
              <Save size={20} />
              {formik.isSubmitting ? "Đang lưu..." : "Lưu bàn"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Upload ảnh */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hình ảnh bàn</h3>
              <p className="text-xs text-slate-400 mb-4">Tối đa 5 ảnh, JPG/PNG. Hover vào ảnh để xóa.</p>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                      <img src={src} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
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
                  className="w-full h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer"
                >
                  <ImagePlus size={24} />
                  <span className="text-xs font-medium">Thêm ảnh ({imageFiles.length}/5)</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Info className="text-slate-400" size={22} />
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Tên / Số bàn <span className="text-red-500">*</span></Label>
                  <Input placeholder="VD: Bàn 01 - VIP" className={`${inputClassName} ${formik.touched.table_number && formik.errors.table_number ? "border-red-500" : ""}`} {...formik.getFieldProps("table_number")} />
                  {formik.touched.table_number && formik.errors.table_number && <p className="text-xs text-red-500 mt-1">{formik.errors.table_number}</p>}
                </div>

                <div className="col-span-1">
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Loại bàn <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(val) => formik.setFieldValue("table_type_id", val)} defaultValue={formik.values.table_type_id}>
                    <SelectTrigger className={`${inputClassName} ${formik.touched.table_type_id && formik.errors.table_type_id ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn loại bàn" />
                    </SelectTrigger>
                    <SelectContent>
                      {tableTypes.map((type) => (
                        <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.table_type_id && formik.errors.table_type_id && <p className="text-xs text-red-500 mt-1">{formik.errors.table_type_id}</p>}
                </div>

                <div className="col-span-1">
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Đơn giá (VNĐ/giờ) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input type="number" placeholder="0" className={`pr-16 text-right font-medium ${inputClassName} ${formik.touched.price && formik.errors.price ? "border-red-500" : ""}`} {...formik.getFieldProps("price")} />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium bg-slate-200/60 px-2 py-0.5 rounded">đ/giờ</div>
                  </div>
                  {formik.touched.price && formik.errors.price && <p className="text-xs text-red-500 mt-1">{formik.errors.price}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Mô tả thêm</Label>
                  <Textarea placeholder="Nhập mô tả về chất lượng bàn, loại vải nỉ, bóng sử dụng..." rows={4} className={`${inputClassName} resize-none`} {...formik.getFieldProps("description")} />
                  <p className="text-xs text-slate-400 mt-2 text-right">{formik.values.description.length}/500 ký tự</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
}