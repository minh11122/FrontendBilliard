import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { ImagePlus, Save, Info, X } from "lucide-react";

import { updateTable, getTableTypes, getTableById } from "@/services/billiardTable.service";
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

export default function OwnerEditTablePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [tableTypes, setTableTypes] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  // Ảnh hiện có từ DB
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Ảnh mới thêm
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const CLUB_ID = localStorage.getItem("selected_club_id") || "";

  const formik = useFormik({
    initialValues: {
      table_number: "",
      table_type_id: "",
      price: "",
      status: "Available",
      description: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      table_number: Yup.string()
        .trim()
        .required("Tên bàn không được để trống")
        .max(100, "Tên bàn tối đa 100 ký tự"),
      table_type_id: Yup.string().required("Vui lòng chọn loại bàn"),
      price: Yup.number()
        .typeError("Đơn giá phải là số")
        .positive("Đơn giá phải lớn hơn 0")
        .max(100000000, "Đơn giá tối đa 100,000,000 VNĐ")
        .required("Đơn giá không được để trống"),
      status: Yup.string().oneOf(["Available", "Maintenance"], "Trạng thái không hợp lệ").required("Vui lòng chọn trạng thái"),
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
        formData.append("table_number", values.table_number.trim());
        formData.append("table_type_id", values.table_type_id);
        formData.append("price", values.price);
        formData.append("description", values.description || "");
        formData.append("status", values.status);
        formData.append("area", "Khu vực chung");

        // Ảnh bị xóa
        removedImages.forEach((url) => formData.append("removedImages", url));

        // Ảnh mới upload
        newImageFiles.forEach((file) => formData.append("images", file));

        const res = await updateTable(id, formData);

        if (res.data.success) {
          toast.success("Cập nhật thông tin bàn thành công!");
          navigate("/owner/tables");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật bàn");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch danh sách loại bàn + dữ liệu bàn hiện tại
  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesRes = await getTableTypes();
        if (typesRes.data.success) {
          setTableTypes(typesRes.data.data);
        }

        const tableRes = await getTableById(id);
        if (tableRes.data.success) {
          const data = tableRes.data.data;

          formik.setValues({
            table_number: data.table_number || "",
            table_type_id: data.table_type_id?._id || data.table_type_id || "",
            price: data.price || "",
            status: data.status || "Available",
            description: data.description || "",
          });

          // Load ảnh hiện có (hỗ trợ cả images[] lẫn image_url cũ)
          if (data.images && data.images.length > 0) {
            setExistingImages(data.images);
          } else if (data.image_url) {
            setExistingImages([data.image_url]);
          }
        }
      } catch (error) {
        toast.error("Không thể tải thông tin bàn");
        navigate("/owner/tables");
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
          <p className="text-slate-500 font-medium">Đang tải dữ liệu bàn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="hidden lg:flex items-center gap-2 text-sm mb-6">
        <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer">Trang chủ</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/owner/tables")}>Quản lý bàn</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-900 font-medium">Chỉnh sửa thông tin bàn</span>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Chỉnh sửa thông tin bàn</h1>
            <p className="text-slate-500 mt-1">Cập nhật thông tin chi tiết của bàn bida.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-all shadow-sm">
              Hủy bỏ
            </button>
            <button type="button" onClick={formik.handleSubmit} disabled={formik.isSubmitting}
              className="px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-[#0fd650] font-semibold transition-all shadow-sm shadow-primary/30 flex items-center gap-2 disabled:opacity-60">
              <Save size={20} />
              {formik.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Ảnh */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Hình ảnh bàn</h3>
              <p className="text-xs text-slate-400 mb-4">Tối đa 5 ảnh, JPG/PNG. Hover vào ảnh để xóa.</p>

              {/* Ảnh hiện có */}
              {existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">Ảnh hiện tại</p>
                  <div className="grid grid-cols-2 gap-2">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
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
                  <div className="grid grid-cols-2 gap-2">
                    {newImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-dashed border-primary/50">
                        <img src={src} alt={`Ảnh mới ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
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
                  className="w-full h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer"
                >
                  <ImagePlus size={24} />
                  <span className="text-xs font-medium">Thêm ảnh ({totalImages}/5)</span>
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
                  <Select onValueChange={(val) => formik.setFieldValue("table_type_id", val)} value={formik.values.table_type_id}>
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

                <div className="col-span-1">
                  <Label className="block text-sm font-medium text-slate-700 mb-2">Trạng thái <span className="text-red-500">*</span></Label>
                  <Select onValueChange={(val) => formik.setFieldValue("status", val)} value={formik.values.status}>
                    <SelectTrigger className={`${inputClassName} ${formik.touched.status && formik.errors.status ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Sẵn sàng</SelectItem>
                      <SelectItem value="Maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && <p className="text-xs text-red-500 mt-1">{formik.errors.status}</p>}
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
