import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {
  register,
  registerGoogle,
  verifyOtp,
  resendOtp,
} from "@/services/auth.service";
import { GoogleLogin } from "@react-oauth/google";

export function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState("register");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // countdown
  useEffect(() => {
    if (step === "verify" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, step]);

  // validation
  const validationSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    password: Yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
      .required("Vui lòng nhập lại mật khẩu"),
    agreeToTerms: Yup.boolean().oneOf([true], "Bạn phải đồng ý điều khoản"),
  });

  // formik
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register({
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        setEmail(values.email);
        toast.success("Đăng ký thành công! Kiểm tra email để lấy OTP.");
        setStep("verify");
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng ký thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // otp handlers
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = [...otp];
    pasted.split("").forEach((c, i) => {
      if (i < 6) newOtp[i] = c;
    });
    setOtp(newOtp);
  };

  // verify
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ email, otp_code: otp.join("") });
      toast.success("Xác thực thành công!");
      setIsSuccess(true);
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP không hợp lệ");
    }
  };

  // resend
  const handleResend = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      await resendOtp(email);
      toast.success("Đã gửi OTP mới!");
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* top */}
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

      {/* ===== REGISTER ===== */}
      {step === "register" && (
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
          {/* LEFT */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-2">Tạo tài khoản</h2>
            <p className="text-gray-500 mb-6">
              Đăng ký để sử dụng hệ thống quản lý billiards.
            </p>

            <div className="mb-6">
              <GoogleLogin
                onSuccess={async (res) => {
                  try {
                    await registerGoogle(res.credential);
                    toast.success("Đăng ký Google thành công!");
                    navigate("/auth/login");
                  } catch (error) {
                    toast.error("Đăng ký Google thất bại");
                  }
                }}
                onError={() => toast.error("Đăng ký Google thất bại")}
              />
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              {/* email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pl-10 border rounded-xl w-full px-3 py-2.5 focus:ring-2 focus:ring-green-600"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* password */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pl-10 pr-10 border rounded-xl w-full px-3 py-2.5 focus:ring-2 focus:ring-green-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* confirm */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pl-10 pr-10 border rounded-xl w-full px-3 py-2.5 focus:ring-2 focus:ring-green-600"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* terms */}
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formik.values.agreeToTerms}
                  onChange={formik.handleChange}
                />
                Tôi đồng ý với điều khoản
              </label>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
              >
                Đăng ký
              </button>

              <p className="text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/auth/login"
                  className="text-green-600 font-medium hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
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
              <ShieldCheck />
              <h3 className="text-3xl font-bold mt-4">
                Bắt đầu quản lý CLB của bạn
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* ===== VERIFY ===== */}
      {step === "verify" && (
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8">
          {isSuccess ? (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold">Xác thực thành công!</h2>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <h2 className="text-xl font-bold text-center">Nhập OTP</h2>

              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!isOtpComplete}
                className="w-full bg-green-600 text-white py-2 rounded-lg"
              >
                Xác thực
              </button>

              <div className="text-center text-sm">
                {countdown > 0 ? (
                  <span>Gửi lại sau {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-green-600 font-medium"
                  >
                    Gửi lại OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}