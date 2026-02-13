import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, ShieldCheck, CheckCircle2 } from "lucide-react"

export function RegisterForm() {
  const [step, setStep] = useState("register")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agree, setAgree] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRefs = useRef([])

  // Submit Register (UI Demo)
  const handleRegister = (e) => {
    e.preventDefault()
    if (!agree) {
      alert("Bạn phải đồng ý điều khoản")
      return
    }
    setStep("verify")
  }

  // OTP change
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setIsSuccess(true)

    setTimeout(() => {
      setStep("register")
      setIsSuccess(false)
      setOtp(["", "", "", "", "", ""])
    }, 2000)
  }

  const isOtpComplete = otp.every((d) => d !== "")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">

      {/* Logo */}
      <Link to="/" className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
          B
        </div>
        <div className="mt-2 text-2xl font-bold text-gray-900">
          Booking<span className="text-green-600">Billiard</span>
        </div>
      </Link>

      {/* STEP 1 REGISTER */}
      {step === "register" && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          <h2 className="text-2xl font-semibold text-center mb-6">
            Đăng ký tài khoản
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 border rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Terms */}
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="mr-2"
              />
              Tôi đồng ý với điều khoản
            </label>

            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded-lg py-2 hover:bg-green-700"
            >
              Đăng ký
            </button>

            <p className="text-sm text-center">
              Đã có tài khoản?{" "}
              <Link to="/auth/login" className="text-green-600 hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      )}

      {/* STEP 2 VERIFY */}
      {step === "verify" && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

          {isSuccess ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-center">
                Xác thực thành công!
              </h2>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-center mb-4">
                Nhập mã OTP
              </h2>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(index, e.target.value)
                    }
                    className="w-10 h-12 text-center text-lg font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={!isOtpComplete}
                className="w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                Xác thực
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
