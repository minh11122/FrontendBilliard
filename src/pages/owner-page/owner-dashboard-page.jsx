import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clubService, getClubAnalytics } from "@/services/club.service";
import { Loader2, LayoutDashboard, CircleDot, Activity, LogOut, Clock, PlusCircle, PieChart, Users, Star } from "lucide-react";

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const clubId = localStorage.getItem("selected_club_id");
  const clubName = localStorage.getItem("selected_club_name");

  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const initDashboard = async () => {
      if (!clubId) {
        navigate("/owner/select-club", { replace: true });
        return;
      }
      
      setLoading(true);
      try {
        // 1. Check PayOS Config
        const bankRes = await clubService.getClubBank(clubId);
        const bank = bankRes?.data;
        if (!bank?.payos_client_id || !bank?.has_payos_keys) {
          toast.error("Vui lòng thiết lập PayOS cho CLB trước khi sử dụng dashboard");
          navigate("/owner/settings", { replace: true });
          return;
        }

        // 2. Fetch Club Tables Real-time
        const clubRes = await clubService.getClubById(clubId, {
           play_date: new Date().toISOString().split('T')[0],
           startTime: new Date().toTimeString().substring(0, 5),
           duration: 2 // check next 2 hours
        });
        if (clubRes?.success) setClubData(clubRes.data);

        // 3. Fetch Today's Analytics
        let start = new Date();
        let end = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        const analyticsRes = await getClubAnalytics(clubId, {
           startDate: start.toISOString(),
           endDate: end.toISOString()
        });
        if (analyticsRes?.success) setAnalyticsData(analyticsRes.data);

      } catch (err) {
        console.error("Dashboard error:", err);
        // toast.error("Không thể tải thông tin Dashboard.");
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [clubId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );
  }

  // Calculate Table Statuses
  let totalTables = 0;
  let available = 0;
  let playing = 0;
  let held = 0; // Maintenance or Booked

  if (clubData?.tables) {
     totalTables = clubData.tables.length;
     clubData.tables.forEach(t => {
        if (t.status === "Available") available++;
        else if (t.status === "Playing") playing++;
        else held++;
     });
  }

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans bg-[#F9FAFB] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-blue-600 w-8 h-8"/> 
            Tổng quan Hoạt động
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Bảng điều khiển trực tiếp hệ thống - <strong className="text-gray-800">{clubName}</strong></p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={() => navigate("/owner/select-club")}
             className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm"
          >
             <LogOut size={16}/> Đổi chi nhánh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Realtime Tables & Quick Actions */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
           
           {/* Thống kê bàn theo thời gian thực */}
           <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
               <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <CircleDot size={20} className="text-green-500" /> Trạng thái Bàn hiện tại
               </h3>
               <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-lg text-sm">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Live
               </div>
             </div>

             {totalTables === 0 ? (
                <div className="text-center py-10">
                   <p className="text-gray-500 mb-4">CLB chưa có bàn bida nào.</p>
                   <button onClick={() => navigate("/owner/tables/create")} className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl text-sm">Thêm bàn ngay</button>
                </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl">
                   <span className="text-4xl font-black text-gray-900">{totalTables}</span>
                   <span className="text-gray-500 text-sm font-semibold mt-1">Tổng cộng</span>
                 </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-2xl border border-green-100 shadow-sm shadow-green-100/50">
                   <span className="text-4xl font-black text-green-600">{available}</span>
                   <span className="text-green-700 text-sm font-semibold mt-1">Sẵn sàng / Trống</span>
                 </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm shadow-blue-100/50">
                   <span className="text-4xl font-black text-blue-600">{playing}</span>
                   <span className="text-blue-700 text-sm font-semibold mt-1">Đang chơi</span>
                 </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm shadow-orange-100/50">
                   <span className="text-4xl font-black text-orange-600">{held}</span>
                   <span className="text-orange-700 text-sm font-semibold mt-1">Đặt trước / Bảo trì</span>
                 </div>
               </div>
             )}
             
             {/* Progress Bar for Occupancy */}
             {totalTables > 0 && (
                <div className="mt-8">
                   <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                     <span>Tỉ lệ tải bàn (Occupancy):</span>
                     <span>{Math.round(((playing + held) / totalTables) * 100)}%</span>
                   </div>
                   <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                     <div style={{width: `${(playing / totalTables) * 100}%`}} className="bg-blue-500 h-full transition-all"></div>
                     <div style={{width: `${(held / totalTables) * 100}%`}} className="bg-orange-400 h-full transition-all"></div>
                     <div style={{width: `${(available / totalTables) * 100}%`}} className="bg-green-500 h-full transition-all"></div>
                   </div>
                </div>
             )}
           </div>

           {/* Thao tác nhanh (Quick Actions) */}
           <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               🚀 Thao tác nhanh
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={() => navigate("/owner/tables/create")} className="group p-5 bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-blue-100 rounded-2xl transition-all flex flex-col items-start gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                     <PlusCircle size={20}/>
                   </div>
                   <span className="font-bold text-blue-900 text-sm text-left">Nhập thêm<br/>Bàn bida</span>
                </button>
                <button onClick={() => navigate("/owner/services/create")} className="group p-5 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-100 rounded-2xl transition-all flex flex-col items-start gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                     <PlusCircle size={20}/>
                   </div>
                   <span className="font-bold text-orange-900 text-sm text-left">Ra mắt thêm<br/>Món ăn/Dịch vụ</span>
                </button>
                <button onClick={() => navigate("/owner/employees/create")} className="group p-5 bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-emerald-100 rounded-2xl transition-all flex flex-col items-start gap-4">
                   <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                     <Users size={20}/>
                   </div>
                   <span className="font-bold text-emerald-900 text-sm text-left">Tuyển thêm<br/>Nhân viên mới</span>
                </button>
             </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Today's Snapshot */}
        <div className="col-span-1 lg:col-span-4 flex flex-col space-y-6">
           
           <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden flex-1 flex flex-col">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center gap-2 mb-8 opacity-80">
                <Activity size={18} className="text-blue-400" />
                <span className="uppercase text-xs font-bold tracking-widest text-blue-100">KQKD Trong ngày</span>
              </div>

              {analyticsData ? (
                 <div className="flex-1 flex flex-col justify-between">
                    <div className="mb-6">
                       <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Tạm tính: Doanh thu</p>
                       <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                          {formatMoney(analyticsData.kpi.totalRevenue)}
                       </h2>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-gray-700/50">
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400 flex items-center gap-2"><CircleDot size={14}/> Lượt phục vụ</span>
                          <span className="font-bold text-white text-lg">{analyticsData.kpi.totalBookings} <span className="text-xs font-normal opacity-50">khách</span></span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400 flex items-center gap-2"><Clock size={14}/> Giờ chơi trung bình</span>
                          <span className="font-bold text-white text-lg">{analyticsData.kpi.averagePlayMinutes} <span className="text-xs font-normal opacity-50">phút</span></span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-400 flex items-center gap-2"><Star size={14}/> Đánh giá dịch vụ</span>
                          <span className="font-bold text-amber-400 text-lg">{analyticsData.feedback.average} <Star size={14} className="inline fill-amber-400 relative -top-[1px] mr-1" /><span className="text-xs font-normal opacity-50 text-white">({analyticsData.feedback.total})</span></span>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="flex-1 flex items-center justify-center opacity-50">
                   <Loader2 className="animate-spin w-8 h-8" />
                 </div>
              )}
              
              <button onClick={() => navigate("/owner/reports")} className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-bold opacity-90 border border-white/10 backdrop-blur-sm">
                 🔍 Phân tích chuyên sâu
              </button>
           </div>
        </div>

      </div>

    </div>
  );
};