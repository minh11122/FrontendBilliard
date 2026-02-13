import { useState } from "react"
import { Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form Data:", formData)
  }

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

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-1">Đăng nhập</h2>
        <p className="text-center text-gray-600 mb-8">
          Chào mừng bạn đến với <span className="font-medium">Booking Billiard</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 border rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
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

          {/* Remember */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>

            <a href="#" className="text-sm text-green-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium rounded-lg px-4 py-2 hover:bg-green-700"
          >
            Đăng nhập
          </button>

          {/* Register */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a href="#" className="text-green-600 hover:underline font-medium">
                Đăng ký ngay
              </a>
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}
