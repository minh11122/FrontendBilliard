import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOwnerClubs } from "@/services/club.service";
import toast from "react-hot-toast";
import { Store, ArrowRight, Loader, LogOut } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";

export function OwnerSelectClubPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user_fullname");
    localStorage.removeItem("selected_club_id");
    localStorage.removeItem("selected_club_name");
    logout();
    navigate("/");
  };

  useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchMyClubs = async () => {
    try {
      // Gọi API lấy danh sách quán của chủ
      const res = await getOwnerClubs();
      if (res?.success) {
        setClubs(res.data);
      } else {
        toast.error("Không thể lấy danh sách quán");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách quán");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClub = (club) => {
    // Lưu club_id vào localStorage để dùng cho các request tiếp theo
    localStorage.setItem("selected_club_id", club._id);
    localStorage.setItem("selected_club_name", club.name);
    toast.success(`Đã chọn quán: ${club.name}`);
    
    // Chuyển hướng tới dashboard
    navigate("/owner/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 font-medium">Đang tải danh sách quán của bạn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative">
      {/* Logout Button Top-Right */}
      <div className="absolute top-6 right-6 md:top-8 md:right-12">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Store className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chọn quán bida của bạn</h1>
        <p className="text-gray-500 mb-10 text-center max-w-lg">
          Vui lòng chọn một quán bida từ danh sách bên dưới để truy cập vào bảng điều khiển quản lý và thực hiện các tác vụ.
        </p>

        {clubs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center w-full max-w-lg">
            <p className="text-gray-500 mb-4">Bạn chưa đăng ký quán bida nào trên hệ thống.</p>
            <button 
              onClick={() => navigate("/register-owner-account")}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              Tạo quán bida mới ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {clubs.map((club) => (
              <div 
                key={club._id}
                onClick={() => handleSelectClub(club)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-transparent hover:border-green-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {club.avatar ? (
                      <img src={club.avatar} alt={club.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Store className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">{club.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{club.address}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${club.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {club.status === 'Approved' ? 'Đã duyệt' : club.status}
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerSelectClubPage;
