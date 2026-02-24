import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
            🎮
          </div>
          <span>
            Billiards <span className="text-green-600">Manager</span>
          </span>
        </Link>

        <div className="hidden md:flex gap-6 text-sm text-gray-600">
          <Link to="/">Trang chủ</Link>
          <Link to="#">Giới thiệu</Link>
          <Link to="#">Liên hệ</Link>
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        {/* LEFT — FORM */}
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
          <p className="text-gray-500 mb-6">
            Nhập thông tin đăng nhập để truy cập vào hệ thống quản lý.
          </p>

          {/* Google */}
          <button className="w-full border rounded-xl py-3 mb-6 hover:bg-gray-50 font-medium">
            🔐 Đăng nhập bằng Google
          </button>

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            Hoặc đăng nhập với email
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="email"
                  placeholder="user@fpt.edu.vn"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 border rounded-xl w-full px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between text-sm">
                <label className="font-medium text-gray-700">Mật khẩu</label>
                <a href="#" className="text-green-600 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>

              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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
            </div>

            {/* Remember */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Ghi nhớ đăng nhập
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
            >
              Đăng nhập →
            </button>

            <p className="text-center text-sm text-gray-600">
              Bạn chưa có tài khoản?{" "}
              <a href="#" className="text-green-600 font-medium hover:underline">
                Đăng ký ngay
              </a>
            </p>
          </form>

          <p className="text-xs text-gray-400 mt-8">
            © 2024 FPT Capstone Project. All rights reserved.
          </p>
        </div>

        {/* RIGHT — HERO */}
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
              Quản lý chuyên nghiệp.
              <br />
              <span className="text-green-400">Nâng tầm trải nghiệm.</span>
            </h3>

            <p className="text-white/80 mb-8">
              Hệ thống tối ưu giúp bạn quản lý đặt bàn, tổ chức giải đấu và theo
              dõi doanh thu hiệu quả nhất.
            </p>

            <div className="flex gap-10 text-sm">
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-green-400">CLB Tin Dùng</p>
              </div>
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-green-400">Hỗ Trợ Kỹ Thuật</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}