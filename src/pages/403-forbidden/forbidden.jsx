import {  useContext } from "react";
import {  useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Lock } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
export function Forbidden() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
const handleGoHome = () => {
  logout(); // 🧹 Xóa token và reset user trong context
  navigate("/");
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Error code with lock icon */}
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-lg opacity-50"></div>
                <div className="relative bg-slate-800 p-6 rounded-full">
                  <Lock className="w-12 h-12 text-red-400" />
                </div>
              </div>
            </div>
            <h1 className="text-9xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
              403
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-red-400 to-orange-400 mx-auto rounded-full"></div>
          </div>

          {/* Message */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            Truy cập bị từ chối
          </h2>
          <p className="text-lg text-slate-400 mb-12 text-balance">
            Bạn không có quyền truy cập trang này. Nếu bạn cho rằng đây là một lỗi, vui lòng liên hệ với quản trị viên.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-slate-400 hover:text-slate-200 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-500">
              Mã lỗi: 403 | Truy cập bị từ chối
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
