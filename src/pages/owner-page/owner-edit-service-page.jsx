import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { Save, Info } from "lucide-react";
import { updateService, getServiceById } from "@/services/service.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OwnerEditServicePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFetchingData, setIsFetchingData] = useState(true);
  const CLUB_ID = localStorage.getItem("selected_club_id") || "";

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      discount_percent: "",
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
      discount_percent: Yup.number()
        .typeError("Giảm giá phải là số")
        .min(0, "Giảm giá không được âm")
        .max(100, "Giảm giá tối đa 100%")
        .nullable(),
      description: Yup.string().max(500, "Mô tả tối đa 500 ký tự"),
    }),
    onSubmit: async (values) => {
      if (!CLUB_ID) {
        toast.error("Không tìm thấy thông tin quán!");
        return;
      }
      try {
        const data = {
          club_id: CLUB_ID,
          name: values.name.trim(),
          price: Number(values.price),
          discount_percent: Number(values.discount_percent) || 0,
          description: values.description || "",
        };

        const res = await updateService(id, data);
        if (res.data.success) {
          toast.success("Cập nhật dịch vụ thành công!");
          navigate("/owner/services");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật dịch vụ");
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
            discount_percent: data.discount_percent || "",
            description: data.description || "",
          });
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
            <button type="button" onClick={formik.handleSubmit} className="px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-[#0fd650] font-semibold transition-all shadow-sm shadow-primary/30 flex items-center gap-2">
              <Save size={20} /> Lưu thay đổi
            </button>
          </div>
        </div>

        <div className="max-w-2xl">
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

              <div className="col-span-1">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Giá (VNĐ) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input type="number" placeholder="0" className={`pr-16 text-right font-medium ${inputClassName} ${formik.touched.price && formik.errors.price ? "border-red-500" : ""}`} {...formik.getFieldProps("price")} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium bg-slate-200/60 px-2 py-0.5 rounded">VNĐ</div>
                </div>
                {formik.touched.price && formik.errors.price && <p className="text-xs text-red-500 mt-1">{formik.errors.price}</p>}
              </div>

              <div className="col-span-1">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Giảm giá (%)</Label>
                <div className="relative">
                  <Input type="number" placeholder="0" className={`pr-12 text-right font-medium ${inputClassName} ${formik.touched.discount_percent && formik.errors.discount_percent ? "border-red-500" : ""}`} {...formik.getFieldProps("discount_percent")} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium bg-slate-200/60 px-2 py-0.5 rounded">%</div>
                </div>
                {formik.touched.discount_percent && formik.errors.discount_percent && <p className="text-xs text-red-500 mt-1">{formik.errors.discount_percent}</p>}
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Mô tả</Label>
                <Textarea placeholder="Mô tả chi tiết về dịch vụ..." rows={4} className={`${inputClassName} resize-none`} {...formik.getFieldProps("description")} />
                <p className="text-xs text-slate-400 mt-2 text-right">{formik.values.description.length}/500 ký tự</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
}
