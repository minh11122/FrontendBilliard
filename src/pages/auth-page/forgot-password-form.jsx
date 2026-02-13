import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    console.log("Email:", email)

    setTimeout(() => {
      setIsSubmitting(false)
      alert("Đã gửi yêu cầu (UI demo)")
      setEmail("")
    }, 1000)
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

        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Quên mật khẩu
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Nhập email để nhận mật khẩu tạm
        </p>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-green-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi mật khẩu tạm"}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-4 text-center">
          <Link
            to="/auth/login"
            className="text-sm text-gray-600 hover:text-green-600 transition"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>

        {/* Support Box */}
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

      </div>
    </div>
  )
}
