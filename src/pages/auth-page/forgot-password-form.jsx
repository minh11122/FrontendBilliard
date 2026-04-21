import { Link } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { forgotPassword } from "@/services/auth.service";
import { SiteLogo } from "@/components/common/SiteLogo";

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
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Top brand */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <SiteLogo className="w-8 h-8 rounded-lg" alt="Billiards Manager logo" />
          <span>
            Billiards <span className="text-green-600">One</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        {/* LEFT */}
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-2">Quên mật khẩu</h2>
          <p className="text-gray-500 mb-6">
            Nhập email để nhận mật khẩu tạm thời.
          </p>

          {/* icon */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  {...formik.getFieldProps("email")}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-green-600
                  ${formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                    }`}
                />
              </div>

              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {formik.isSubmitting ? "Đang gửi..." : "Gửi mật khẩu tạm"}
            </button>
          </form>

          {/* back */}
          <div className="mt-5 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-gray-600 hover:text-green-600 transition"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>

          {/* help */}
          <div className="mt-8 p-4 rounded-xl border bg-gray-50 text-sm text-gray-700 space-y-2">
            <div className="font-medium text-gray-800">
              Không nhận được email?
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kiểm tra thư mục spam hoặc thư rác</li>
              <li>Đảm bảo email đã được nhập chính xác</li>
              <li>Liên hệ bộ phận hỗ trợ nếu vẫn gặp vấn đề</li>
            </ul>
          </div>

          <p className="mt-6 text-xs text-gray-500 text-center">
            Cần hỗ trợ?{" "}
            <a href="/support" className="text-green-600 hover:underline">
              Liên hệ với chúng tôi
            </a>
          </p>
        </div>

        {/* RIGHT HERO */}
        <div className="relative hidden md:block">
          <img
            src="/img-home/backgroundauth.png"
            className="absolute inset-0 w-full h-full object-cover"
            alt="auth background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-black/80" />

          <div className="relative h-full p-10 text-white flex flex-col justify-center">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-6">
              <ShieldCheck />
            </div>

            <h3 className="text-3xl font-bold leading-tight mb-4">
              Khôi phục tài khoản nhanh chóng
            </h3>

            <p className="text-white/80">
              Hệ thống sẽ gửi mật khẩu tạm thời để bạn đăng nhập lại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
