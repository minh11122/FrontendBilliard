import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { login } from "@/services/auth.service";
import Cookies from "js-cookie";
import { AuthContext } from "@/context/AuthContext";
import { SiteLogo } from "@/components/common/SiteLogo";

export function LoginSystem() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: loginContext } = useContext(AuthContext);

  const savedEmail = Cookies.get("rememberedEmail") || "";
  const savedPassword = Cookies.get("rememberedPassword") || "";

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
    password: Yup.string()
      .min(6, "Mật khẩu tối thiểu 6 ký tự")
      .required("Vui lòng nhập mật khẩu"),
  });

  const formik = useFormik({
    initialValues: {
      email: savedEmail,
      password: savedPassword,
      rememberMe: !!savedEmail,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await login(values);

        const { token, role, fullname } = res.data;

        if (fullname) {
          localStorage.setItem("user_fullname", fullname);
        }

        loginContext(token);

        // remember me
        if (values.rememberMe) {
          Cookies.set("rememberedEmail", values.email, { expires: 7 });
          Cookies.set("rememberedPassword", values.password, { expires: 7 });
        } else {
          Cookies.remove("rememberedEmail");
          Cookies.remove("rememberedPassword");
        }


        if (role === "ADMIN") {
          toast.success("Đăng nhập thành công!");
          navigate("/admin/list-user");
        } else if (role === "STAFF_SYSTEM") {
          toast.success("Đăng nhập thành công!");
          navigate("/systemstaff/systemstaff1");
        } else {
          toast.error("Bạn không có quyền truy cập hệ thống");
          navigate("/");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <SiteLogo className="w-8 h-8 rounded-lg" alt="Billiards Manager logo" />
          <span>
            Billiards <span className="text-green-600">One</span>
          </span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        {/* LEFT */}
        <div className="p-6 sm:p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
          <p className="text-gray-500 mb-6">
            Đăng nhập để truy cập hệ thống quản lý billiards.
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="pl-10 border rounded-xl w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between text-sm">
                <label className="font-medium text-gray-700">Mật khẩu</label>
                <Link
                  to="/auth/forgot-password"
                  className="text-green-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="pl-10 pr-10 border rounded-xl w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
              />
              Ghi nhớ đăng nhập
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-70"
            >
              {formik.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập →"}
            </button>

            {/* <p className="text-center text-sm text-gray-600">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/auth/register"
                className="text-green-600 font-medium hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p> */}
          </form>
        </div>

        {/* RIGHT HERO */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1603297631954-df2d0f7f4d7c?q=80&w=1600"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-black/80" />

          <div className="relative h-full p-10 text-white flex flex-col justify-center">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-6">
              <ShieldCheck />
            </div>

            <h3 className="text-3xl font-bold leading-tight mb-4">
              Quản lý billiards chuyên nghiệp
            </h3>

            <p className="text-white/80">
              Quản lý bàn, đặt lịch và doanh thu trong một nền tảng duy nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
