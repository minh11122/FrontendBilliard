import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Clock, Wifi, Coffee, CigaretteOff, ChevronLeft, ChevronRight, Info, MessageSquare, Car, Sparkles } from "lucide-react";
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
  const [galleryIdx, setGalleryIdx] = useState(0); // for gallery navigation

  const [activeTab, setActiveTab] = useState("booking"); // booking, info, reviews
  const [selectedTableType, setSelectedTableType] = useState("Pool");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(2); // hours
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetail, setTableDetail] = useState(null); // Table for detail modal
  const [tablePage, setTablePage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const TABLES_PER_PAGE = 6;

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
  }, [id, selectedDate, selectedStartTime, selectedDuration]);

  const fetchClubDetails = async () => {
    try {
      // Pass slot parameters to get accurate table availability
      const params = {
        play_date: selectedDate,
        startTime: selectedStartTime,
        duration: selectedDuration
      };

      const res = await getClubById(id, params);
      if (res.success) {
        setClub(res.data);

        // If current selected table is no longer available in the new slot, clear it
        if (selectedTable) {
          const updatedTable = res.data.tables?.find(t => t._id === selectedTable._id);
          if (updatedTable && updatedTable.status !== "Available") {
            setSelectedTable(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching club details:", error);
      toast.error("Không thể tải thông tin câu lạc bộ");
    } finally {
      setLoading(false);
    }
  };

  // Reset selected table and pagination if table type changes
  useEffect(() => {
    setSelectedTable(null);
    setTablePage(0);
  }, [selectedTableType]);

  // Hook logic needs to be before early returns
  const isToday = selectedDate === todayStr;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Generate time slots based on club operating hours, supports cross-midnight and 24/24
  const generateTimeSlots = (openingTime, closingTime) => {
    const [openH, openM] = (openingTime || "08:00").split(":").map(Number);
    const [closeH, closeM] = (closingTime || "23:30").split(":").map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // 24/24: opening === closing means open all day (48 slots)
    const is24h = openMinutes === closeMinutes;
    const totalMinutes = is24h ? 24 * 60 : (
      closeMinutes <= openMinutes ? closeMinutes + 24 * 60 : closeMinutes
    );

    const slots = [];
    const limit = is24h ? openMinutes + 24 * 60 : totalMinutes;
    for (let t = openMinutes; t < limit - 29; t += 30) {
      const realMins = t % (24 * 60);
      const h = Math.floor(realMins / 60);
      const m = realMins % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
    return slots;
  };

  let timeOptions = club ? generateTimeSlots(club.opening_time, club.closing_time) : generateTimeSlots("08:00", "23:30");

  if (isToday) {
    timeOptions = timeOptions.filter(timeStr => {
      const [h, m] = timeStr.split(":").map(Number);
      // Handle slots after midnight (e.g. 01:00 generated for cross-midnight club)
      const slotMinutes = h * 60 + m;
      const nowMinutes = currentHour * 60 + currentMinute;
      // If slot hour is small (00-07) and we're generating for cross-midnight club, it's next-day slots -> always valid for today
      const [openH] = (club?.opening_time || "08:00").split(":").map(Number);
      const [closeH] = (club?.closing_time || "23:30").split(":").map(Number);
      const isCrossMidnight = closeH < openH;
      if (isCrossMidnight && h < openH) return true; // next-day wrap-around slot
      return slotMinutes > nowMinutes;
    });
  }

  const timeOptionsStr = timeOptions.join(',');
  useEffect(() => {
    if (timeOptions.length > 0 && !timeOptions.includes(selectedStartTime)) {
      setSelectedStartTime(timeOptions[0]);
    }
  }, [timeOptionsStr, selectedStartTime]);

  const maxAllowedDuration = (() => {
    if (!club || !selectedStartTime) return 24;
    const [startH, startM] = selectedStartTime.split(":").map(Number);
    const [openH] = (club.opening_time || "08:00").split(":").map(Number);
    const [closeH, closeM] = (club.closing_time || "23:30").split(":").map(Number);

    const openMinutes = openH * 60;
    const closeMinutes24 = closeH * 60 + closeM;
    const is24h = openMinutes === closeMinutes24;

    if (is24h) return 24;

    const isCrossMidnight = closeH <= openH && !is24h;
    let effectiveClose = closeMinutes24;
    if (isCrossMidnight) effectiveClose += 24 * 60;

    const startMins = startH * 60 + startM;
    let adjustedStart = startMins;
    if (isCrossMidnight && startH < openH) adjustedStart += 24 * 60;

    return Math.max(0.5, (effectiveClose - adjustedStart) / 60);
  })();

  useEffect(() => {
    if (club && selectedDuration > maxAllowedDuration) {
      setSelectedDuration(maxAllowedDuration);
    }
  }, [maxAllowedDuration, club]);

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

    // Booking validation: handle 24/24, cross-midnight
    const validateBookingTime = () => {
      return selectedDuration <= maxAllowedDuration;
    };

    if (!validateBookingTime()) {
      toast.error(`Thời gian đặt bàn vượt quá giờ đóng cửa (${club.closing_time || "23:30"})`);
      return;
    }


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

  // Ảnh avatar chính và danh sách background
  const avatarImage = club.images?.find((img) => img.image_type === "Avatar")?.image_url ||
    club.images?.find((img) => img.image_type === "Banner")?.image_url || null;

  const backgroundImages = club.images?.filter(img => img.image_type === "Background").map(img => img.image_url) || [];

  // Tổng hợp tất cả ảnh: Avatar đầu, sau đó Background
  let displayImages = [];
  if (avatarImage) displayImages.push(avatarImage);
  displayImages = [...displayImages, ...backgroundImages]; // show ALL, no slice

  // Lọc danh sách bàn theo tab loại bàn
  const availableTables = club.tables?.filter(t => mapTypeToUI(t.table_type_id?.name) === selectedTableType) || [];

  // Tính tiền
  const currentTablePrice = selectedTable ? selectedTable.price : (club.priceFrom || 60000);
  const totalPrice = selectedDuration * currentTablePrice;

  const calculateEndTime = (start, duration) => {
    if (!start) return "";
    const [h, m] = start.split(":").map(Number);
    const totalMins = h * 60 + m + duration * 60;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
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

          {/* Gallery - 2 Cols: Avatar fixed at top, Backgrounds with arrows below */}
          <div className="lg:col-span-2">
            <div className="bg-white p-2 border rounded-2xl shadow-sm space-y-2">
              {/* Avatar / Main image — fixed, no navigation */}
              <div 
                className="aspect-[2/1] bg-slate-200 rounded-xl overflow-hidden relative cursor-pointer group"
                onClick={() => { if(avatarImage) setFullscreenImage(avatarImage); }}
              >
                {avatarImage ? (
                  <img src={avatarImage} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                )}
                {avatarImage && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">Ảnh đại diện</div>
                )}
              </div>

              {/* Background images — with arrow navigation */}
              {backgroundImages.length > 0 && (
                <div className="relative">
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: Math.min(4, backgroundImages.length) }).map((_, offset) => {
                      const bgIdx = (galleryIdx + offset) % backgroundImages.length;
                      const img = backgroundImages[bgIdx];
                      return (
                        <div key={offset} className="aspect-square rounded-lg overflow-hidden border border-slate-100 relative group cursor-pointer"
                          onClick={() => setFullscreenImage(img)}
                        >
                          <img src={img} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                          {offset === 3 && backgroundImages.length > 4 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                              +{backgroundImages.length - 4}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Navigation arrows and counter */}
                  {backgroundImages.length > 4 && (
                    <div className="flex items-center justify-between mt-2 px-1">
                      <span className="text-xs text-slate-400">{backgroundImages.length} ảnh nền</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGalleryIdx(i => (i - 1 + backgroundImages.length) % backgroundImages.length)}
                          className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setGalleryIdx(i => (i + 1) % backgroundImages.length)}
                          className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Club Info - 1 Col */}
          <div className="bg-white border rounded-2xl shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
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
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.address || club.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 hover:underline cursor-pointer"
                  title="Xem trên bản đồ"
                >
                  {club.address}
                </a>
              </p>
              <div className="flex justify-between items-center text-sm border-b border-dashed pb-3 pt-2">
                <span className="text-slate-500">Giờ hoạt động</span>
                <span className="font-bold text-slate-900">
                  {(club.opening_time === "00:00" && club.closing_time === "00:00")
                    ? "Mở cửa 24/24"
                    : `${club.opening_time || "08:00"} - ${club.closing_time || "23:30"}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Giá từ</span>
                <span className="text-emerald-600 font-bold text-lg">{club.priceFrom?.toLocaleString()}đ/giờ</span>
              </div>
            </div>

            <div className="pt-6 border-t mt-auto">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                {club.amenities && club.amenities.length > 0 ? (
                  club.amenities.map((amenity) => {
                    let Icon = Sparkles;
                    let colorClass = "text-emerald-500";
                    let bgClass = "bg-slate-50";
                    let borderClass = "border-slate-200";

                    if (amenity === "Wifi miễn phí") Icon = Wifi;
                    else if (amenity === "Máy lạnh") Icon = Coffee;
                    else if (amenity === "Bãi xe ô tô") Icon = Car;
                    else if (amenity === "Không hút thuốc") {
                      Icon = CigaretteOff;
                      colorClass = "text-emerald-700";
                      bgClass = "bg-emerald-50";
                      borderClass = "border-emerald-100";
                    }

                    return (
                      <span key={amenity} className={`flex items-center gap-1.5 px-3 py-1.5 ${bgClass} text-slate-700 text-xs font-medium rounded-lg border ${borderClass}`}>
                        <Icon className={`w-3.5 h-3.5 ${colorClass}`} /> {amenity}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400 italic">Chưa có thông tin tiện ích</span>
                )}
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
                              {Array.from({ length: Math.min(48, Math.floor(maxAllowedDuration * 2)) }, (_, i) => {
                                const val = (i + 1) * 0.5;
                                const h = Math.floor(val);
                                const m = val % 1 !== 0 ? 30 : 0;
                                let label;
                                if (val === 24) label = 'Cả ngày (24 Giờ)';
                                else if (h === 0) label = '30 Phút';
                                else if (m === 0) label = `${h} Giờ`;
                                else label = `${h} Giờ 30`;
                                return <option key={val} value={val}>{label}</option>;
                              })}
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
                    <div className="flex gap-4 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border shadow-sm items-center">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded box-border border bg-white"></span> Trống</span>
                      <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-500 ring-2 ring-amber-100 ring-offset-1"></span> Đang chờ</span>
                      <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-500 ring-2 ring-slate-100 ring-offset-1"></span> Bảo trì</span>
                      <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500 ring-2 ring-emerald-100 ring-offset-1"></span> Đang chọn</span>
                    </div>
                  </div>

                  {/* Table Grid Map with Pagination */}
                  <div className="w-full max-w-2xl mt-12 relative px-10">
                    {/* Navigation Arrows */}
                    {availableTables.length > TABLES_PER_PAGE && (
                      <>
                        <button
                          onClick={() => setTablePage(p => Math.max(0, p - 1))}
                          disabled={tablePage === 0}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-slate-50 transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setTablePage(p => Math.min(Math.ceil(availableTables.length / TABLES_PER_PAGE) - 1, p + 1))}
                          disabled={tablePage >= Math.ceil(availableTables.length / TABLES_PER_PAGE) - 1}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-slate-50 transition-all z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center">
                      {availableTables.slice(tablePage * TABLES_PER_PAGE, (tablePage + 1) * TABLES_PER_PAGE).map(t => (
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
                          className={`w-[160px] h-[110px] rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all relative select-none overflow-hidden group ${selectedTable?._id === t._id
                            ? "ring-[4px] ring-emerald-500 shadow-xl scale-[1.05]"
                            : t.status === "Holding"
                              ? "opacity-90 grayscale-[0.3] cursor-not-allowed border-2 border-amber-400/50"
                              : t.status === "Maintenance"
                                ? "opacity-60 grayscale cursor-not-allowed border-2 border-slate-300"
                                : "hover:shadow-xl hover:-translate-y-1.5 shadow-md border-2 border-transparent"
                            }`}
                        >
                          {/* Table Image Background */}
                          {t.images && t.images.length > 0 ? (
                            <img
                              src={t.images[0]}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              alt=""
                            />
                          ) : (
                            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                              <Sparkles className="w-10 h-10 text-slate-300 opacity-20" />
                            </div>
                          )}

                          {/* Dynamic Overlay & Glow based on status/selection */}
                          <div className={`absolute inset-0 transition-all duration-300 ${selectedTable?._id === t._id
                            ? "bg-emerald-900/40 backdrop-blur-[1px]"
                            : "bg-black/40 group-hover:bg-black/20"
                            }`} />

                          <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${selectedTable?._id === t._id
                            ? "from-emerald-950/9 worst-emerald-900/10 to-transparent opacity-100"
                            : "from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100"
                            }`} />

                          {/* Selection Checkmark */}
                          {selectedTable?._id === t._id && (
                            <div className="absolute top-2 right-2 w-7 h-7 bg-emerald-500 rounded-xl text-white flex items-center justify-center shadow-lg z-20 animate-in zoom-in spin-in-12 duration-300">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}

                          {/* UPRIGHT STATUS BADGE - MORE PROMINENT */}
                          <div className="absolute top-0 left-0 right-0 p-2 flex justify-start z-20">
                            {t.status === "Holding" ? (
                              <div className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-br-2xl shadow-lg flex items-center gap-1.5 uppercase tracking-tighter animate-in slide-in-from-left duration-300">
                                <Clock className="w-3.5 h-3.5 fill-white/20" /> ĐANG CHỜ
                              </div>
                            ) : t.status === "Maintenance" ? (
                              <div className="px-3 py-1.5 bg-slate-600 text-white text-[10px] font-black rounded-br-2xl shadow-lg uppercase tracking-tighter">
                                BẢO TRÌ
                              </div>
                            ) : (
                              <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-emerald-600 text-[10px] font-black rounded-br-2xl shadow-sm uppercase tracking-tighter border-b border-r border-emerald-100/20">
                                TRỐNG
                              </div>
                            )}
                          </div>

                          {/* CONTENT - JUST TABLE NUMBER */}
                          <div className="relative z-10 flex flex-col items-center pt-4">
                            <span className={`block font-black text-4xl leading-none drop-shadow-2xl transition-all duration-300 ${selectedTable?._id === t._id ? "text-emerald-300 scale-110" : "text-white"
                              }`}>
                              {t.table_number}
                            </span>
                          </div>

                          {/* Info Button - Sleeker */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTableDetail(t);
                            }}
                            className="absolute bottom-2 right-2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-2xl transition-all text-white border border-white/20 group-hover:scale-110 z-20"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Simple Pagination Dots */}
                    {availableTables.length > TABLES_PER_PAGE && (
                      <div className="flex justify-center gap-1.5 mt-8">
                        {Array.from({ length: Math.ceil(availableTables.length / TABLES_PER_PAGE) }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${tablePage === i ? "w-6 bg-emerald-500" : "w-1.5 bg-slate-300"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cửa lối vào (Mô phỏng như ảnh) */}
                  <div className="w-full flex justify-center mt-12 mb-6">
                    <div className="w-32 h-2 bg-slate-200 rounded-full relative">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-bold uppercase tracking-wider">Lối vào</span>
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border overflow-hidden flex-shrink-0">
                  {selectedTable?.images && selectedTable.images.length > 0 ? (
                    <img src={selectedTable.images[0]} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">No img</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Bàn đã chọn</div>
                  <div className={`font-bold text-sm sm:text-base ${selectedTable ? "text-emerald-600" : "text-slate-400"}`}>
                    {selectedTable ? `Bàn ${selectedTable.table_number}` : "Chưa chọn"}
                  </div>
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

      {/* Table Detail Modal */}
      {tableDetail && (
        <TableDetailModal
          table={tableDetail}
          onClose={() => setTableDetail(null)}
          selectedTableType={selectedTableType}
        />
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-emerald-400 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-50"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={fullscreenImage} 
            alt="Fullscreen View" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// ===== TABLE DETAIL MODAL (with image gallery) =====
const TableDetailModal = ({ table, onClose, selectedTableType }) => {
  const images = table.images && table.images.length > 0 ? table.images : [];
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <span className="font-black text-xl">{table.table_number}</span>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Chi tiết Bàn Bida</h3>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Bàn {selectedTableType}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border shadow-sm">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Image Gallery */}
          <div className="space-y-2">
            {/* Main Image Display */}
            <div className="aspect-video bg-slate-100 rounded-2xl border overflow-hidden relative shadow-inner group">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  className="w-full h-full object-cover transition-all duration-500"
                  alt={`Bàn ${table.table_number} - ảnh ${activeImg + 1}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Sparkles className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest opacity-40">Chưa có ảnh bàn</p>
                </div>
              )}
              {/* Price Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-white/20">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-0.5">Đơn giá / Giờ</p>
                <p className="text-base font-black text-emerald-600">{table.price?.toLocaleString()}đ</p>
              </div>
              {/* Navigation Arrows for gallery */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {/* Image counter */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeImg + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImg === i ? 'border-emerald-500 scale-[1.05] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" /> Mô tả chi tiết
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 min-h-[80px]">
              <p className="text-sm text-slate-600 leading-relaxed italic">
                {table.description || "Quán chưa cập nhật mô tả cho bàn này. Tất cả bàn đều được đảm bảo vệ sinh và chất lượng hàng ngày."}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${table.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-sm font-bold text-slate-700">Trạng thái hiện tại</span>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${table.status === 'Available' ? 'bg-white text-emerald-600 border-emerald-200' :
              table.status === 'Holding' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                'bg-slate-100 text-slate-400'
              }`}>
              {table.status === 'Available' ? 'ĐANG TRỐNG' : table.status === 'Holding' ? 'ĐANG GIỮ CHỖ' : 'BẢO TRÌ'}
            </span>
          </div>
        </div>

        <div className="p-5 bg-slate-50/50 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white border font-black text-slate-500 rounded-2xl hover:bg-slate-100 transition-all active:scale-[0.98]"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};

import { X } from "lucide-react";
