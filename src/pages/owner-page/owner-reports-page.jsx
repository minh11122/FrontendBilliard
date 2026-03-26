import React, { useState, useEffect } from "react";
import { getClubAnalytics } from "@/services/club.service";
import toast from "react-hot-toast";
import { Loader2, TrendingUp, Calendar, CreditCard, Clock, Star, DollarSign, Users, Award, AlertCircle } from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = { cash: '#4ade80', bank: '#60a5fa' }; 

export default function OwnerReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState("30days"); // "today", "7days", "30days", "thisMonth"
  const clubId = localStorage.getItem("selected_club_id");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, clubId]);

  const fetchAnalytics = async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      let start = new Date();
      let end = new Date();
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      if (dateRange === "7days") {
        start.setDate(end.getDate() - 7);
      } else if (dateRange === "30days") {
        start.setDate(end.getDate() - 30);
      } else if (dateRange === "thisMonth") {
        start.setDate(1);
      }

      const res = await getClubAnalytics(clubId, { 
        startDate: start.toISOString(), 
        endDate: end.toISOString() 
      });

      if (res.success) {
        setData(res.data);
      } else {
        toast.error("Không thể lấy dữ liệu báo cáo");
      }
    } catch (err) {
      toast.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  
  const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '0 phút';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h}giờ ${m}phút`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">Chưa có dữ liệu thống kê.</div>;
  }

  // Chuyển đổi data Chart
  const timelineData = data.revenue.timeline.map(item => ({
     name: item.date.split('-').slice(1).join('/'),
     "Giờ chơi": item.table,
     "Dịch vụ": item.service
  }));

  const paymentMixData = [
    { name: 'Tiền mặt', value: data.revenue.paymentMix.cash },
    { name: 'Chuyển khoản', value: data.revenue.paymentMix.bank }
  ].filter(i => i.value > 0);

  const tableTypeData = data.tables.typeDistribution.map(t => ({
     name: t.name,
     value: t.revenue
  })).filter(i => i.value > 0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Báo Cáo Doanh Thu</h1>
          <p className="text-gray-500 mt-1">Phân tích chi tiết dòng tiền và hiệu suất kinh doanh</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {["today", "7days", "30days", "thisMonth"].map(key => {
            const labels = { today: "Hôm nay", "7days": "7 ngày qua", "30days": "30 ngày qua", thisMonth: "Tháng này" };
            return (
              <button 
                key={key} 
                onClick={() => setDateRange(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  dateRange === key ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {labels[key]}
              </button>
            )
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
           <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
             <DollarSign size={24} />
           </div>
           <div>
             <p className="text-sm font-medium text-gray-500 mb-1">Tổng doanh thu</p>
             <h3 className="text-2xl font-black text-gray-900">{formatMoney(data.kpi.totalRevenue)}</h3>
           </div>
        </div>
        {/* Lượt chơi */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
           <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
             <Users size={24} />
           </div>
           <div>
             <p className="text-sm font-medium text-gray-500 mb-1">Số lượt phục vụ</p>
             <h3 className="text-2xl font-black text-gray-900">{data.kpi.totalBookings} <span className="text-sm font-normal text-gray-400">lượt</span></h3>
           </div>
        </div>
        {/* Bill */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
           <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
             <CreditCard size={24} />
           </div>
           <div>
             <p className="text-sm font-medium text-gray-500 mb-1">Trung bình cộng / Bill</p>
             <h3 className="text-2xl font-black text-gray-900">{formatMoney(data.kpi.averageOrderValue)}</h3>
           </div>
        </div>
        {/* Thời gian */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
           <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
             <Clock size={24} />
           </div>
           <div>
             <p className="text-sm font-medium text-gray-500 mb-1">Thời lượng trung bình</p>
             <h3 className="text-2xl font-black text-gray-900">{data.kpi.averagePlayMinutes} <span className="text-sm font-normal text-gray-400">phút/lượt</span></h3>
           </div>
        </div>
      </div>

      {data.kpi.unpaidCount > 0 && (
         <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
           <AlertCircle size={20} />
           <p className="font-medium text-sm">Cảnh báo: Có <strong>{data.kpi.unpaidCount}</strong> hóa đơn chưa được thanh toán (Công nợ) trong khoảng thời gian này. Vui lòng kiểm tra lại!</p>
         </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500"/> Xu hướng doanh thu
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => (val/1000) + 'k'} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <RechartsTooltip formatter={(val) => formatMoney(val)} />
                <Legend wrapperStyle={{fontSize: 12, paddingTop: 10}} />
                <Line type="monotone" dataKey="Giờ chơi" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="Dịch vụ" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Mix Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CreditCard size={18} className="text-green-500"/> Thanh toán
          </h3>
          <p className="text-xs text-gray-500 mb-4">Cơ cấu phương thức thu tiền</p>
          <div className="flex-1 min-h-[250px] relative flex flex-col items-center justify-center">
            {paymentMixData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMixData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {paymentMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? STATUS_COLORS.cash : STATUS_COLORS.bank} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val) => formatMoney(val)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: 12}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="text-gray-400 text-sm">Chưa có giao dịch</div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Top Tables */}
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award size={18} className="text-indigo-500"/> Hiệu suất bàn (Top 5 - Theo phút)
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tables.topList.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 13, fontWeight: 500, fill: '#374151'}} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(val) => [formatDuration(val), 'Thời lượng chơi']} />
                  <Bar dataKey="playMinutes" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} name="Thời lượng" />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Services Analysis */}
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-500"/> Phân phối sao đánh giá
            </h3>
            <div className="flex flex-col md:flex-row gap-8 items-center h-auto md:h-[250px] p-2">
               
               {/* Score Summary Box */}
               <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200/50 rounded-3xl p-8 w-full md:w-[180px] min-w-[160px] shrink-0 text-white transform transition-all hover:-translate-y-1">
                 <p className="text-6xl font-black drop-shadow-sm tracking-tight">{data.feedback.average}</p>
                 <div className="flex text-white mt-4 mb-2 opacity-95">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={20} fill={star <= Math.round(data.feedback.average) ? "currentColor" : "none"} className={star <= Math.round(data.feedback.average) ? "" : "opacity-30"} />
                    ))}
                 </div>
                 <p className="text-sm font-medium opacity-90">{data.feedback.total} lượt đánh giá</p>
               </div>
               
               {/* Distribution Bars */}
               <div className="flex-1 w-full space-y-4">
                 {data.feedback.distribution.map(f => {
                    const percentage = data.feedback.total > 0 ? (f.count / data.feedback.total) * 100 : 0;
                    return (
                      <div key={f.stars} className="flex items-center gap-4 group">
                        <span className="text-sm font-bold text-gray-700 w-12 flex items-center justify-end">{f.stars} <Star size={14} className="ml-1 text-amber-500" fill="currentColor"/></span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner flex items-center">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000 relative" style={{width: `${percentage}%`}}>
                             {percentage > 0 && <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20"></div>}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 w-8 text-right group-hover:text-amber-600 transition-colors">{f.count}</span>
                      </div>
                    )
                 })}
               </div>
            </div>
         </div>
      </div>

      {/* F&B List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">Hàng hóa & Dịch vụ (F&B)</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <h4 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-4">🔥 Bán chạy nhất</h4>
               <div className="space-y-3">
                 {data.services.topList.slice(0, 5).map((s, idx) => (
                   <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                        <span className="font-semibold text-sm text-gray-900">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{s.quantity} <span className="text-xs font-normal text-gray-500">lượt gọi</span></p>
                        <p className="text-xs text-gray-500">{formatMoney(s.revenue)}</p>
                      </div>
                   </div>
                 ))}
                 {data.services.topList.length === 0 && <p className="text-sm text-gray-500 italic">Chưa có dữ liệu</p>}
               </div>
            </div>

            <div>
               <h4 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-4">❄️ Dịch vụ ế / Nguy cơ</h4>
               <div className="space-y-3">
                 {data.services.bottomList.map((s, idx) => (
                   <div key={s.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <AlertCircle size={16} className="text-red-400"/>
                        <span className="font-medium text-sm text-red-900">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-700">{s.quantity} <span className="text-xs font-normal text-red-500 opacity-80">lượt gọi</span></p>
                      </div>
                   </div>
                 ))}
                 {data.services.bottomList.length === 0 && <p className="text-sm text-gray-500 italic">Không có dịch vụ nào ế.</p>}
               </div>
            </div>
         </div>
      </div>
      
    </div>
  );
}
