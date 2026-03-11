import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { ImagePlus, Save, Info, Trash2, Plus } from "lucide-react";

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

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
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
    onSubmit: async (values) => {
      if (!CLUB_ID) {
        toast.error("Không tìm thấy thông tin quán. Vui lòng đăng nhập lại!");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("club_id", CLUB_ID); // Gửi ID tự động lấy được
        formData.append("table_number", values.table_number);
        formData.append("table_type_id", values.table_type_id);
        formData.append("price", values.price);
        formData.append("description", values.description);

        // Dữ liệu mặc định để không lỗi Backend
        formData.append("area", "Khu vực chung");
        formData.append("isActive", true);

        if (selectedFile) {
          formData.append("image", selectedFile);
        }

        const res = await createTable(formData);

        if (res.data.success) {
          toast.success("Thêm bàn mới thành công!");
          navigate("/owner/tables");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm bàn");
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Ảnh không được vượt quá 5MB");
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
            <button type="button" onClick={formik.handleSubmit} className="px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-[#0fd650] font-semibold transition-all shadow-sm shadow-primary/30 flex items-center gap-2">
              <Save size={20} />
              Lưu bàn
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Hình ảnh bàn</h3>
              <div className="w-full aspect-square relative rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center cursor-pointer group overflow-hidden" onClick={() => !imagePreview && fileInputRef.current?.click()}>
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                      <ImagePlus className="text-primary" size={28} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-700">Tải ảnh lên</p>
                    <p className="mt-1 text-xs text-slate-500">PNG, JPG tối đa 5MB</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleImageChange} />
              </div>
            </div>
          </div>

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