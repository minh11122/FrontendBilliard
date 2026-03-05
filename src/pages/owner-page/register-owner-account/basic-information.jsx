import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Building, MapPin, Phone, FileText, Image } from "lucide-react";
import { registerClub } from "@/services/club.service";

export function RegisterOwnerAccount() {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    name: Yup.string().required("Vui lòng nhập tên CLB"),
    address: Yup.string().required("Vui lòng nhập địa chỉ"),
    phone: Yup.string().required("Vui lòng nhập số điện thoại"),
    tax_code: Yup.string().required("Vui lòng nhập mã số thuế"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      address: "",
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

  // upload ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const urls = files.map((file) => URL.createObjectURL(file));

    formik.setFieldValue("legalDocuments", urls);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      
      {/* top bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
            🎱
          </div>
          <span>
            Billiards <span className="text-green-600">Manager</span>
          </span>
        </Link>
      </div>

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
            <div>
              <label className="text-sm font-medium">Tên CLB</label>
              <div className="relative mt-1">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 text-gray-400"/>
                <input
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  className="pl-10 border rounded-xl w-full px-3 py-2.5"
                  placeholder="CLB Billiards ABC"
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="text-sm font-medium">Địa chỉ</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 text-gray-400"/>
                <input
                  name="address"
                  onChange={formik.handleChange}
                  value={formik.values.address}
                  className="pl-10 border rounded-xl w-full px-3 py-2.5"
                  placeholder="Hà Nội..."
                />
              </div>
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

              <div className="mt-2 border-2 border-dashed rounded-xl p-6 text-center">
                <Image className="mx-auto mb-2 text-gray-400"/>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
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