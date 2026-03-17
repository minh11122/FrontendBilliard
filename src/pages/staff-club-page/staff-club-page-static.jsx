import React, { useState, useEffect } from "react";
import { 
  BarChart, Users, DollarSign, Trophy, Calendar, 
  MessageSquare, Star, ArrowUpRight, TrendingUp 
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStaffClubStatistics } from "@/services/club.service";
import toast from "react-hot-toast";

export const StaffClubPageStatic = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  useEffect(() => {
    fetchStats();
  }, [selectedMonth, selectedYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getStaffClubStatistics(selectedMonth, selectedYear);
      if (res.success) {
        setStats(res.data);
      } else {
        toast.error("Không thể tải dữ liệu thống kê");
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Lỗi tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [currentYear - 1, currentYear, currentYear + 1];

  if (loading && !stats) {
     return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-4 md:p-6 w-full max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] bg-gray-50/50">
      
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tổng quan <span className="text-primary">{stats?.clubName}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kết quả hoạt động trong tháng {selectedMonth}/{selectedYear}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32 bg-white">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28 bg-white">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-blue-50 p-2.5 rounded-lg">
                <BarChart className="text-blue-600 w-6 h-6" />
             </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Tổng số đơn</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats?.totalBookings || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-emerald-50 p-2.5 rounded-lg">
                <DollarSign className="text-emerald-600 w-6 h-6" />
             </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Doanh thu</h3>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">
            {(stats?.totalRevenue || 0).toLocaleString()} <span className="text-sm font-semibold">VND</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-orange-50 p-2.5 rounded-lg">
                <Star className="text-orange-500 w-6 h-6" />
             </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Đánh giá</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats?.feedbacks?.length || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
             <div className="bg-purple-50 p-2.5 rounded-lg">
                <Trophy className="text-purple-600 w-6 h-6" />
             </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Giải đấu</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats?.tournaments?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Feedbacks List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 h-[400px] flex flex-col">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
             <MessageSquare className="w-5 h-5 text-gray-400" /> Nhận xét gần đây
           </h2>
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
             {stats?.feedbacks?.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-10">Chưa có đánh giá nào trong tháng</div>
             ) : (
                stats?.feedbacks?.map(fb => (
                  <div key={fb.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                              {fb.user?.avatar ? (
                                <img src={fb.user.avatar} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xs text-center">{fb.user?.name?.charAt(0)}</div>
                              )}
                           </div>
                           <span className="font-semibold text-sm">{fb.user?.name}</span>
                        </div>
                        <div className="flex items-center text-orange-400">
                           <Star className="w-3.5 h-3.5 fill-current" />
                           <span className="text-sm font-bold ml-1">{fb.rating}</span>
                        </div>
                     </div>
                     <p className="text-gray-600 text-sm">{fb.comment || <span className="italic text-gray-400">Không có bình luận</span>}</p>
                  </div>
                ))
             )}
           </div>
        </div>

        {/* Tournaments List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 h-[400px] flex flex-col">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
             <Trophy className="w-5 h-5 text-gray-400" /> Giải đấu đang diễn ra
           </h2>
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
             {stats?.tournaments?.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-10">Không có giải đấu nào trong tháng</div>
             ) : (
                stats?.tournaments?.map(tour => (
                  <div key={tour.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                     <div>
                        <h4 className="font-bold text-gray-900">{tour.name}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                           <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1"/> {tour.max_players} người</span>
                           <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1"/> {format(new Date(tour.start_time), "dd/MM", { locale: vi })}</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="block text-primary font-bold">{tour.fee > 0 ? `${tour.fee.toLocaleString()} ₫` : 'Miễn phí'}</span>
                        <span className={`text-[10px] mt-1 uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                           tour.status === 'Completed' ? 'bg-gray-200 text-gray-600' : 
                           tour.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' : 
                           'bg-blue-100 text-blue-700'
                        }`}>
                            {tour.status}
                        </span>
                     </div>
                  </div>
                ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
