import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, CheckCircle2, ShieldCheck } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"
import toast from "react-hot-toast"
import { register, registerGoogle, verifyOtp, resendOtp } from "@/services/auth.service"
import { GoogleLogin } from "@react-oauth/google"

export function RegisterForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState("register") // register | verify
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRefs = useRef([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (step === "verify" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, step])

  // ✅ Validation schema
  const validationSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    password: Yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
      .required("Vui lòng nhập lại mật khẩu"),
    agreeToTerms: Yup.boolean().oneOf([true], "Bạn phải đồng ý với điều khoản"),
  })

  // ✅ Formik setup
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
        })
        setEmail(values.email)
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để nhập OTP.", { duration: 6000 })
        setStep("verify")
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.")
      } finally {
        setSubmitting(false)
      }
    },
  })

  // OTP Handlers
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pasted)) return
    const newOtp = [...otp]
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char
    })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ✅ Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault()
    const otpCode = otp.join("")
    try {
      await verifyOtp({ email, otp_code: otpCode })
      toast.success("Xác thực thành công!")
      setIsSuccess(true)
      setTimeout(() => navigate("/auth/login"), 2000)
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn")
    }
  }

  // ✅ Resend OTP
  const handleResend = async () => {
    if (countdown > 0) return
    setIsResending(true)
    try {
      await resendOtp(email)
      toast.success("OTP mới đã được gửi!")
      setCountdown(60)
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi lại OTP")
    } finally {
      setIsResending(false)
    }
  }

  const isOtpComplete = otp.every((d) => d !== "")

  // ========== UI ==========
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-4">
      {/* Logo */}
      <Link to="/" className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">Y</div>
        <div className="mt-2 text-2xl font-bold text-gray-900">Yummy<span className="text-orange-500">Go</span></div>
      </Link>

      {/* Step 1: Register */}
      {step === "register" && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-center mb-1">Đăng ký tài khoản</h2>
          <p className="text-center text-gray-600 mb-8">Tạo tài khoản để bắt đầu đặt món ngon</p>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nhập email"
                  className="pl-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              {formik.touched.email && formik.errors.email && <p className="text-red-500 text-sm">{formik.errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nhập mật khẩu"
                  className="pl-10 pr-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && <p className="text-red-500 text-sm">{formik.errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Nhập lại mật khẩu"
                  className="pl-10 pr-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-sm">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start text-sm text-gray-600">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formik.values.agreeToTerms}
                onChange={formik.handleChange}
                className="mt-1 rounded"
              />
              <span className="ml-2">
                Tôi đồng ý với{" "}
                <a href="/terms" className="text-orange-500 hover:underline">Điều khoản</a> và{" "}
                <a href="/privacy" className="text-orange-500 hover:underline">Chính sách</a>
              </span>
            </label>
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <p className="text-red-500 text-sm">{formik.errors.agreeToTerms}</p>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-orange-500 text-white rounded-lg px-4 py-2 hover:bg-orange-600 disabled:opacity-70"
            >
              {formik.isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <GoogleLogin
              onSuccess={async (res) => {
                try {
                  await registerGoogle(res.credential)
                  toast.success("Đăng ký Google thành công!")
                  navigate("/auth/login")
                } catch (error) {
                  toast.error(error.response?.data?.message || "Đăng ký Google thất bại")
                }
              }}
              onError={() => toast.error("Đăng ký Google thất bại")}
            />

            <p className="text-sm text-gray-600 text-center">
              Đã có tài khoản? <a href="/auth/login" className="text-orange-500 hover:underline">Đăng nhập</a>
            </p>
          </form>
        </div>
      )}

      {/* Step 2: Verify */}
      {step === "verify" && (

          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            {isSuccess ? (
              <>
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                {/* Success Message */}
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                  Xác thực thành công!
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Mã OTP của bạn đã được xác thực thành công.
                  <br />
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
                {/* Loading indicator */}
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
                  Xác thực OTP
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Nhập mã OTP đã được gửi đến email{" "}
                  <span className="font-medium text-gray-800">{email}</span>
                </p>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8 text-orange-500" />
                </div>

                {/* Form */}
                <form onSubmit={handleVerify} className="space-y-6">
                  {/* OTP Input */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                        required
                      />
                    ))}
                  </div>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-sm text-gray-600">
                        Gửi lại mã sau{" "}
                        <span className="font-medium text-orange-500">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium transition disabled:opacity-50"
                      >
                        {isResending ? "Đang gửi..." : "Gửi lại mã OTP"}
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!isOtpComplete}
                    className="w-full py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xác thực
                  </button>
                </form>

                {/* Back to login */}
                <div className="mt-4 text-center">
                  <a href="/auth/login" className="text-sm text-gray-600 hover:text-orange-500 transition">
                    ← Quay lại đăng nhập
                  </a>
                </div>

                {/* Support Box */}
                <div className="mt-8 p-4 rounded-xl border bg-gray-50 text-sm text-gray-700 space-y-2">
                  <div className="font-medium text-gray-800">Không nhận được mã?</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Kiểm tra thư mục spam hoặc thư rác</li>
                    <li>Đảm bảo email đã được nhập chính xác</li>
                    <li>Nhấn "Gửi lại mã OTP" để nhận mã mới</li>
                    <li>Liên hệ bộ phận hỗ trợ nếu vẫn gặp vấn đề</li>
                  </ul>
                </div>

                {/* Footer */}
                <p className="mt-6 text-xs text-gray-500 text-center">
                  Cần hỗ trợ?{" "}
                  <a href="/support" className="text-orange-500 hover:underline">
                    Liên hệ với chúng tôi
                  </a>
                </p>
              </>
            )}
          </div>
      )}
    </div>
  )
}
