import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export  function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Error code */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
          </div>

          {/* Message */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            Trang không tìm thấy
          </h2>
          <p className="text-lg text-slate-400 mb-12 text-balance">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Hãy quay lại trang chủ để tiếp tục.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-slate-400 hover:text-slate-200 transition-all duration-300"
            >
              
              Quay lại
            </button>
          </div>

          {/* Decorative elements */}
          <div className="mt-16 pt-8 border-t border-slate-700">
            <p className="text-sm text-slate-500">
              Mã lỗi: 404 | Trang không tìm thấy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
