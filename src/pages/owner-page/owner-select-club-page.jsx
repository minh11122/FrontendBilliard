import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getOwnerClubs } from "@/services/club.service";
import toast from "react-hot-toast";
import { Store, ArrowRight, Loader, LogOut, XCircle, AlertCircle, Clock } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

export function OwnerSelectClubPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "pending"
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
    localStorage.setItem("selected_club_id", club._id);
    localStorage.setItem("selected_club_name", club.name);
    localStorage.setItem("selected_club_plan", club.plan_type || "free");
    
    // Check if onboarding is completed or not (including undefined for old data)
    if (!club.onboarding_completed) {
      toast.success(`Đang thiết lập quán: ${club.name}`);
      navigate(`/owner/onboarding/${club._id}`);
    } else {
      toast.success(`Đã chọn quán: ${club.name}`);
      navigate("/owner/dashboard");
    }
  };

  const activeClubs = clubs.filter(c => c.status === "Approved" || c.status === "Locked");
  const pendingClubs = clubs.filter(c => c.status === "Pending" || c.status === "Rejected");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 font-medium">Đang tải danh sách quán của bạn...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 relative font-sans">
      {/* Logout Button */}
      <div className="absolute top-6 right-6 md:top-8 md:right-12">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
          <Store className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Quản lý chuỗi của bạn</h1>
        <p className="text-gray-500 mb-10 text-center max-w-lg text-lg">
          Chọn chi nhánh để bắt đầu công việc hôm nay.
        </p>

        {clubs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center w-full max-w-lg">
            <div className="w-24 h-24 bg-gray-50 mx-auto rounded-full flex items-center justify-center mb-6">
              <Store className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Chưa có cơ sở nào</h3>
            <p className="text-gray-500 mb-8">Bạn chưa đăng ký không gian bida nào trên hệ thống của chúng tôi.</p>
            <button 
              onClick={() => navigate("/register-owner-account")}
              className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Tạo không gian mới ngay
            </button>
          </div>
        ) : (
          <div className="w-full">
            {/* Tabs */}
            <div className="flex bg-gray-200/50 p-1.5 rounded-2xl w-fit mx-auto mb-10">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Đang hoạt động ({activeClubs.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Đang xử lý ({pendingClubs.length})
              </button>
            </div>

            {/* Tab: Active */}
            {activeTab === "active" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeClubs.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
                    Chưa có quán nào đang hoạt động.
                  </div>
                ) : (
                  activeClubs.map((club) => (
                    <div 
                      key={club._id}
                      onClick={() => handleSelectClub(club)}
                      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-100/50 transition-all cursor-pointer group flex flex-col"
                    >
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-gray-100">
                        {club.avatar ? (
                          <img src={club.avatar} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Store className="w-10 h-10" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                          <div className={`w-2 h-2 rounded-full ${club.status === 'Locked' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                          <span className="text-xs font-bold">{club.status === 'Locked' ? 'Tạm khóa' : 'Đang mở'}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-extrabold text-xl text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 mb-2">
                          {club.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                          {club.address}
                        </p>
                      </div>

                      <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                         <span className="text-sm font-bold text-gray-400 group-hover:text-green-600 transition-colors">Truy cập quản lý</span>
                         <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-green-500 flex items-center justify-center transition-colors">
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Pending / Rejected */}
            {activeTab === "pending" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {pendingClubs.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
                    Không có quán nào đang chờ xử lý.
                  </div>
                ) : (
                  pendingClubs.map((club) => (
                    <div 
                      key={club._id}
                      className={`bg-white rounded-3xl p-6 shadow-sm border overflow-hidden flex flex-col relative
                        ${club.status === 'Rejected' ? 'border-red-200' : 'border-yellow-200'}
                      `}
                    >
                      <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-50">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                          {club.avatar ? (
                            <img src={club.avatar} alt={club.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Store className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{club.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {club.status === 'Pending' ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-lg">
                                <Clock className="w-3.5 h-3.5" /> Chờ Admin duyệt
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg">
                                <XCircle className="w-3.5 h-3.5" /> Bị từ chối
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col">
                        {club.status === 'Pending' && (
                          <div className="bg-yellow-50 rounded-2xl p-4 flex gap-3 text-sm text-yellow-800">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>Hồ sơ của bạn đang được ban quản trị xem xét. Quá trình này thường mất từ 1-2 ngày làm việc.</p>
                          </div>
                        )}

                        {club.status === 'Rejected' && (
                          <div className="flex flex-col h-full justify-between">
                            <div className="bg-red-50 rounded-2xl p-4 mb-4">
                              <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1 opacity-70">Lý do từ chối:</p>
                              <p className="text-sm font-medium text-red-900">{club.reject_reason || "Thông tin cung cấp không hợp lệ. Vui lòng kiểm tra lại."}</p>
                            </div>
                            
                            <button
                              onClick={() => navigate(`/owner/resubmit-club/${club._id}`)}
                              className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-gray-200"
                            >
                              Cập nhật thông tin & Gửi lại
                            </button>
                          </div>
                        )}
                      </div>
                      
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerSelectClubPage;
