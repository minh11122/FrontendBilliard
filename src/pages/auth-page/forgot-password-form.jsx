import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { forgotPassword } from "@/services/auth.service";

export function ForgotPasswordForm() {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Email không hợp lệ")
        .required("Vui lòng nhập email"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await forgotPassword(values.email);
        toast.success("Mật khẩu tạm thời đã được gửi tới email của bạn");
        resetForm();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
      {/* Logo + Brand OUTSIDE card */}
      <Link to="/" className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
          Y
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          Yummy<span className="text-orange-500">Go</span>
        </div>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Quên mật khẩu
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Nhập email để nhận mật khẩu tạm
        </p>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-orange-500" />
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                {...formik.getFieldProps("email")}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400
                  ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                  }`}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition disabled:opacity-50"
          >
            {formik.isSubmitting ? "Đang gửi..." : "Gửi mật khẩu tạm"}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <Link
            to="/auth/login"
            className="text-sm text-gray-600 hover:text-orange-500 transition"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>

        {/* Support Box */}
        <div className="mt-8 p-4 rounded-xl border bg-gray-50 text-sm text-gray-700 space-y-2">
          <div className="font-medium text-gray-800">Không nhận được email?</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kiểm tra thư mục spam hoặc thư rác</li>
            <li>Đảm bảo email đã được nhập chính xác</li>
            <li>Liên hệ bộ phận hỗ trợ nếu vẫn gặp vấn đề</li>
          </ul>
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Cần hỗ trợ?{" "}
          <a href="/support" className="text-orange-500 hover:underline">
            Liên hệ với chúng tôi
          </a>
        </p>
      </div>
    </div>
  );
}
