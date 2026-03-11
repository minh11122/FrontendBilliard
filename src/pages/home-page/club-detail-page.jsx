import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, Wifi, Coffee, CigaretteOff, ChevronLeft, ChevronRight, Info, MessageSquare } from "lucide-react";
import { getClubById } from "@/services/club.service";
import { createBooking } from "@/services/booking.service";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

export const ClubDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("booking"); // booking, info, reviews
  const [selectedTableType, setSelectedTableType] = useState("Pool");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(2); // hours
  const [selectedTable, setSelectedTable] = useState(null);

  const getTodayStr = () => {
    const d = new Date();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };
  const todayStr = getTodayStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Helper map Table DB Types to UI Types
  const mapTypeToUI = (dbType) => {
    if (!dbType) return "Pool";
    const type = dbType.toLowerCase();
    if (type.includes("3c") || type.includes("carom")) return "3C";
    if (type.includes("snooker") || type.includes("snooker")) return "Snooker";
    return "Pool";
  };

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      const res = await getClubById(id);
      if (res.success) {
        setClub(res.data);
      }
    } catch (error) {
      console.error("Error fetching club details:", error);
      toast.error("Không thể tải thông tin câu lạc bộ");
    } finally {
      setLoading(false);
    }
  };

  // Reset selected table if table type changes
  useEffect(() => {
    setSelectedTable(null);
  }, [selectedTableType]);

  // Hook logic needs to be before early returns
  const isToday = selectedDate === todayStr;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let timeOptions = Array.from({ length: 29 }).map((_, i) => {
    const h = Math.floor(i / 2) + 8;
    const m = i % 2 === 0 ? "00" : "30";
    return `${h.toString().padStart(2, '0')}:${m}`;
  });

  if (isToday) {
    timeOptions = timeOptions.filter(timeStr => {
      const [h, m] = timeStr.split(":").map(Number);
      if (h > currentHour) return true;
      if (h === currentHour && m > currentMinute) return true;
      return false;
    });
  }

  const timeOptionsStr = timeOptions.join(',');
  useEffect(() => {
    if (timeOptions.length > 0 && !timeOptions.includes(selectedStartTime)) {
      setSelectedStartTime(timeOptions[0]);
    }
  }, [timeOptionsStr, selectedStartTime]);

  const handleBooking = async () => {
    if (!user) {
      toast("Vui lòng đăng nhập để đặt bàn", { icon: "🔒" });
      navigate("/auth/login");
      return;
    }

    if (user.roleName !== "CUSTOMER") {
      toast.error("Chỉ khách hàng mới có thể đặt bàn!");
      return;
    }

    if (!selectedTable || !selectedStartTime) {
      toast.error("Vui lòng chọn bàn và khoảng giờ");
      return;
    }

    // Validate closing time
    const [startH, startM] = selectedStartTime.split(":").map(Number);
    const endTotalMinutes = (startH + selectedDuration) * 60 + startM;

    const [closeH, closeM] = (club.closing_time || "23:30").split(":").map(Number);
    const closeTotalMinutes = closeH * 60 + closeM;

    if (endTotalMinutes > closeTotalMinutes) {
      toast.error(`Thời gian đặt bàn vượt quá giờ đóng cửa (${club.closing_time || "23:30"})`);
      return;
    }

    // Gọi API tạo booking
    try {
      const res = await createBooking({
        table_id: selectedTable._id,
        club_id: id,
        play_date: selectedDate,
        start_time: selectedStartTime,
        end_time: endTime,
        duration: selectedDuration
      });

      if (res.success) {
        // Chuyển sang trang thanh toán
        navigate("/payment/" + res.data.booking._id, {
          state: res.data
        });
      } else {
        toast.error(res.message || "Đặt bàn thất bại");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi đặt bàn, vui lòng thử lại";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center text-slate-500">
        Không tìm thấy thông tin câu lạc bộ
      </div>
    );
  }

  // Lấy ảnh bìa và các ảnh khác
  const bannerImage = club.images?.find((img) => img.image_type === "Banner")?.image_url || null;
  const otherImages = club.images?.filter(img => img.image_type !== "Banner") || [];
  let displayImages = [];
  if (bannerImage) displayImages.push(bannerImage);
  displayImages = [...displayImages, ...otherImages.map(img => img.image_url)].slice(0, 5);

  // Lọc danh sách bàn theo tab loại bàn
  const availableTables = club.tables?.filter(t => mapTypeToUI(t.table_type_id?.name) === selectedTableType) || [];

  // Tính tiền
  const currentTablePrice = selectedTable ? selectedTable.price : (club.priceFrom || 60000);
  const totalPrice = selectedDuration * currentTablePrice;

  const calculateEndTime = (start, duration) => {
    if (!start) return "";
    const [h, m] = start.split(":").map(Number);
    const endH = h + duration;
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  const endTime = calculateEndTime(selectedStartTime, selectedDuration);

  // Tạo tab loại bàn dựa trên dữ liệu thật của club
  const clubTableTypesSet = new Set(club.tables?.map(t => mapTypeToUI(t.table_type_id?.name)) || []);
  const clubTableTypes = Array.from(clubTableTypesSet);
  if (clubTableTypes.length === 0) clubTableTypes.push("Pool"); // Fallback

  // Nếu selectedTableType không có trong ds (do lần đầu load), set lại
  if (!clubTableTypes.includes(selectedTableType) && clubTableTypes.length > 0) {
    setSelectedTableType(clubTableTypes[0]);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-slate-500 mb-6 gap-2">
          <button onClick={() => navigate("/booking")} className="hover:text-emerald-600 flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" /> Trang chủ
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="cursor-pointer hover:text-emerald-600" onClick={() => navigate("/booking")}>Câu lạc bộ</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 font-medium truncate">{club.name}</span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Gallery - 2 Cols */}
          <div className="lg:col-span-2">
            <div className="bg-white p-2 border rounded-2xl shadow-sm">
              <div className="aspect-[2/1] bg-slate-200 rounded-xl overflow-hidden mb-2 relative">
                {displayImages.length > 0 ? (
                  <img src={displayImages[0]} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((_, idx) => (
                  <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border relative group">
                    {displayImages[idx + 1] ? (
                      <>
                        <img src={displayImages[idx + 1]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer" />
                        {idx === 3 && displayImages.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-black/60 transition-colors">
                            +{displayImages.length - 4}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">-</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Club Info - 1 Col */}
          <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">PHỔ BIẾN</span>
              {club.rating > 0 ? (
                <span className="flex items-center gap-1 text-yellow-600 font-bold text-sm bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                  <Star className="w-4 h-4 fill-yellow-500" /> {Number(club.rating).toFixed(1)} <span className="text-yellow-600/70 font-normal text-xs">({club.reviewsCount} đánh giá)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-500 font-medium text-sm bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Chưa có đánh giá
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">{club.name}</h1>

            <div className="space-y-4 mb-6">
              <p className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <span>{club.address}</span>
              </p>
              <div className="flex justify-between items-center text-sm border-b border-dashed pb-3 pt-2">
                <span className="text-slate-500">Giờ hoạt động</span>
                <span className="font-bold text-slate-900">{club.opening_time || "08:00"} - {club.closing_time || "23:30"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Giá từ</span>
                <span className="text-emerald-600 font-bold text-lg">{club.priceFrom?.toLocaleString()}đ/giờ</span>
              </div>
            </div>

            <div className="pt-6 border-t mt-auto">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Wifi miễn phí
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border">
                  <Coffee className="w-3.5 h-3.5 text-emerald-500" /> Máy lạnh
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> Bãi xe ô tô
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
                  <CigaretteOff className="w-3.5 h-3.5" /> Không hút thuốc
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-24">
          <div className="flex overflow-x-auto no-scrollbar border-b">
            <button
              className={`px-8 py-4 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'booking' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('booking')}
            >
              Đặt bàn ngay
            </button>
            <button
              className={`px-8 py-4 font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'info' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('info')}
            >
              Thông tin quán
            </button>
            <button
              className={`px-8 py-4 font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'reviews' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Bình luận & Đánh giá
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'booking' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Filters */}
                <div className="space-y-6">
                  <div>
                    <h3 className="flex items-center font-bold text-slate-900 mb-4 gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> Tuỳ chỉnh đặt bàn
                    </h3>

                    <div className="space-y-5">
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Loại bàn</p>
                        <div className="flex bg-slate-100 p-1 rounded-xl border">
                          {clubTableTypes.map(type => (
                            <button
                              key={type}
                              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${selectedTableType === type ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                              onClick={() => setSelectedTableType(type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Chọn ngày</p>
                        <div className="relative">
                          <input
                            type="date"
                            min={todayStr}
                            className="w-full border rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium shadow-sm cursor-pointer"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Bắt đầu</p>
                          <div className="relative">
                            <select
                              className="w-full border rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-medium shadow-sm cursor-pointer"
                              value={selectedStartTime}
                              onChange={(e) => setSelectedStartTime(e.target.value)}
                            >
                              {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Thời lượng</p>
                          <div className="relative">
                            <select
                              className="w-full border rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none font-medium shadow-sm cursor-pointer"
                              value={selectedDuration}
                              onChange={(e) => setSelectedDuration(Number(e.target.value))}
                            >
                              <option value={1}>1 Giờ</option>
                              <option value={2}>2 Giờ</option>
                              <option value={3}>3 Giờ</option>
                              <option value={4}>4 Giờ</option>
                              <option value={5}>5 Giờ</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Pricing Block inside panel */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border mt-6">
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-slate-500">Đơn giá:</span>
                        <span className="font-bold text-slate-900">{currentTablePrice.toLocaleString()}đ/giờ</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-dashed pt-3">
                        <span className="text-slate-500">Dự kiến:</span>
                        <span className="text-xl font-black text-emerald-600">{totalPrice.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center & Right Col: Table Map */}
                <div className="lg:col-span-2 bg-slate-50 border rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[400px]">
                  <div className="w-full flex justify-between items-center mb-6 self-start absolute top-6 left-6 right-6">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      Danh sách bàn
                    </h3>
                    <div className="flex gap-4 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded box-border border bg-white"></span> Trống</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-400"></span> Đang giữ chỗ</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded box-border border bg-slate-200 ring-2 ring-inset ring-slate-300"></span> Bảo trì</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-emerald-500 bg-emerald-100"></span> Đang chọn</span>
                    </div>
                  </div>

                  {/* Table Grid Map */}
                  <div className="flex flex-wrap gap-8 justify-center max-w-lg mt-12 w-full">
                    {availableTables.length > 0 ? availableTables.map(t => (
                      <div
                        key={t._id}
                        onClick={() => {
                          if (t.status === "Maintenance") return;
                          if (t.status === "Holding") {
                            toast("Bàn này đang được giữ chỗ", { icon: "⏳" });
                            return;
                          }
                          setSelectedTable(t);
                        }}
                        className={`w-[140px] h-[80px] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all relative select-none ${selectedTable?._id === t._id
                          ? "bg-emerald-50 border-2 border-emerald-500 shadow-md text-emerald-700"
                          : t.status === "Holding"
                            ? "bg-amber-50 border-2 border-amber-400 text-amber-700 cursor-not-allowed"
                            : t.status === "Maintenance"
                              ? "bg-slate-100 border-2 border-slate-200 text-slate-400 cursor-not-allowed opacity-80"
                              : "bg-white border-2 border-slate-100 text-slate-700 shadow-sm hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5"
                          }`}
                      >
                        {selectedTable?._id === t._id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full text-white flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                        {t.status === "Holding" && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full text-white flex items-center justify-center shadow-md text-xs">⏳</div>
                        )}
                        <span className="font-bold text-lg">{t.table_number}</span>
                        <span className="text-[10px] mt-1 text-slate-400 font-bold tracking-wide uppercase">
                          {t.status === "Holding" ? "Đang giữ chỗ" : t.status === "Maintenance" ? "Bảo trì" : `Bàn ${selectedTableType}`}
                        </span>
                      </div>
                    )) : (
                      <div className="text-slate-400 w-full text-center py-10">Không có bàn nào thuộc loại này</div>
                    )}

                    {/* Cửa lối vào (Mô phỏng như ảnh) */}
                    <div className="w-full flex justify-center mt-12 mb-6">
                      <div className="w-32 h-2 bg-slate-200 rounded-full relative">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-bold uppercase tracking-wider">Lối vào</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="text-slate-600 prose max-w-none min-h-[300px]">
                <p>{club.description || "Chưa có thông tin giới thiệu chi tiết cho câu lạc bộ này."}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-slate-500 py-8 min-h-[300px]">
                {club.feedbacks && club.feedbacks.length > 0 ? (
                  <div className="space-y-6">
                    {club.feedbacks.map((fb) => (
                      <div key={fb.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                              {fb.user?.avatar ? <img src={fb.user.avatar} className="w-full h-full object-cover rounded-full" /> : fb.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{fb.user?.name}</p>
                              <p className="text-xs text-slate-400">{new Date(fb.created_at).toLocaleDateString("vi-VN")}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < fb.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-100 text-slate-200"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-700 text-sm">{fb.comment || "Người dùng không để lại bình luận."}</p>

                        {fb.reply && (
                          <div className="mt-4 bg-slate-50 p-4 rounded-xl border-l-4 border-emerald-500">
                            <p className="text-xs font-bold text-slate-800 mb-1">Phản hồi từ câu lạc bộ</p>
                            <p className="text-sm text-slate-600">{fb.reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center bg-slate-50 flex flex-col items-center justify-center py-16 border border-dashed rounded-xl mt-4">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-lg">Chưa có đánh giá nào cho câu lạc bộ này.</p>
                    <p className="text-sm mt-2 text-slate-400">Hãy là người đầu tiên trải nghiệm và để lại đánh giá nhé!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Fixed Bottom Booking Bar */}
      {activeTab === 'booking' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] py-4 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex gap-4 sm:gap-12 w-full">
              <div>
                <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Loại bàn & Thời gian</div>
                <div className="font-bold text-slate-900 text-sm sm:text-base">{selectedTableType} • {selectedDate.split('-').reverse().slice(0, 2).join('/')} • {selectedStartTime} - {endTime}</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-slate-100"></div>
              <div>
                <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Bàn đã chọn</div>
                <div className={`font-bold text-sm sm:text-base ${selectedTable ? "text-emerald-600" : "text-slate-400"}`}>
                  {selectedTable ? `Bàn ${selectedTable.table_number}` : "Chưa chọn"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 ml-auto flex-shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Tổng cộng</div>
                <div className="font-black text-xl text-slate-900">{totalPrice.toLocaleString()}đ</div>
              </div>
              <button
                onClick={handleBooking}
                disabled={!selectedTable || !selectedStartTime}
                className="px-6 sm:px-10 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Xác nhận đặt bàn <ChevronRight className="w-5 h-5 hidden sm:block" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
