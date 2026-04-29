import {
  Star,
  MapPin,
  Users,
  Trophy,
  Clock,
  Zap,
  Gift,
  TrendingUp,
  Quote,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  getLatestTournaments,
  getFeaturedClubs,
  getTopFeedbacks,
  getLatestPosts,
} from "../../services/auth.service";
export const HomePage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [posts, setPosts] = useState([]);

  const images = [
    "/img-home/page1.png",
    "/img-home/page2.png",
    "/img-home/page3.png",
  ];

  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  // auto chuyển ảnh
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Chậm hơn, 5 giây

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLatestTournaments();
        setTournaments(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await getFeaturedClubs();
        setClubs(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClubs();
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await getTopFeedbacks();
        setTestimonials(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getLatestPosts();
        setPosts(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
  }, []);

  const features = [
    {
      title: "Đặt bàn nhanh chóng",
      description: "Chỉ cần vài click để tìm và đặt bàn yêu thích của bạn",
      icon: Zap,
    },
    {
      title: "Quản lý giải đấu dễ dàng",
      description: "Công cụ quản lý giải đấu chuyên nghiệp cho các CLB",
      icon: Trophy,
    },
    {
      title: "Xếp hạng cơ thủ",
      description: "Theo dõi xếp hạng và tiến bộ của các cơ thủ hàng đầu",
      icon: TrendingUp,
    },
    {
      title: "Cộng đồng sôi động",
      description: "Kết nối với cơ thủ khác và chia sẻ kinh nghiệm",
      icon: Users,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">

      {/* HERO */}
      <section className="relative overflow-hidden -mt-[73px]">
        <div className="relative w-full h-[400px] md:h-[520px] lg:h-[600px]">
          {/* Ảnh */}
          <img
            src={images[index]}
            className="w-full h-full object-cover transition-all duration-700"
          />

          {/* overlay nhẹ cho dễ đọc chữ */}
          <div className="absolute inset-0 bg-black/30" />

          {/* nội dung */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Đặt bàn Bida nhanh chóng
            </h1>
            <p className="text-white/80 mb-6 text-sm md:text-lg">
              Tìm kiếm & đặt bàn dễ dàng chỉ trong vài giây
            </p>

            <button
              onClick={() => navigate("/booking")}
              className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Đặt bàn ngay
            </button>
          </div>

          {/* Next/Prev Buttons */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 flex items-center justify-center text-white backdrop-blur-sm transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 flex items-center justify-center text-white backdrop-blur-sm transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          {/* dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-3 rounded-full cursor-pointer transition-all ${i === index ? "bg-white w-8" : "bg-white/40 w-3 hover:bg-white/80"
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-6 py-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 text-center border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-500 transition-colors duration-300">
              <Users className="w-8 h-8 text-green-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">50+</p>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">Câu lạc bộ liên kết</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 text-center border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-500 transition-colors duration-300">
              <Trophy className="w-8 h-8 text-green-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">200+</p>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">Bàn bida chất lượng</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 text-center border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-500 transition-colors duration-300">
              <Star className="w-8 h-8 text-green-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">1000+</p>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">Thành viên hoạt động</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 text-center border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-green-500 transition-colors duration-300">
              <Clock className="w-8 h-8 text-green-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">24/7</p>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm md:text-base">Hỗ trợ đặt bàn</p>
          </div>
        </div>
      </section>

      {/* PROMOTIONS */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Giải đấu mới nhất
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tham gia các giải đấu hấp dẫn đang diễn ra
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tour) => (
            <div
              key={tour._id}
              className="card group h-[420px] w-full rounded-[1.5em] relative flex justify-end flex-col p-[1.5em] z-[1] overflow-hidden shadow-[0px_4px_16px_0px_#22c55e44] hover:shadow-[0px_4px_24px_0px_#22c55e66] transition-all duration-500 cursor-pointer"
              onClick={() => navigate(`/tournament/${tour._id}`)}
            >
              {/* Background Image & Overlay */}
              <div className="absolute top-0 left-0 h-full w-full bg-[#111111]">
                <img
                  src={tour.banner || "/img-home/page1.png"}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                  alt={tour.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              {/* Content Container */}
              <div className="container text-white z-[2] relative flex flex-col gap-2">
                <div className="h-fit w-full">
                  <h1
                    className="text-[1.4em] sm:text-[1.6em] md:text-[1.8em] leading-tight uppercase tracking-wider mb-1"
                    style={{
                      fontWeight: 900,
                      WebkitTextFillColor: "transparent",
                      WebkitTextStrokeWidth: "1px",
                      WebkitTextStrokeColor: "#fff",
                      textShadow: "0 0 10px rgba(255,255,255,0.5)",
                    }}
                  >
                    {tour.name}
                  </h1>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold opacity-80 flex items-center gap-1">
                      <Clock size={14} className="text-green-400" />
                      📅 {tour.play_date ? new Date(tour.play_date).toLocaleDateString() : "Chưa có ngày"}
                    </p>
                    <p className="text-sm font-bold opacity-80 flex items-center gap-1">
                      <Users size={14} className="text-green-400" />
                      👥 {tour.registered_player}/{tour.max_players} cơ thủ
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center h-fit w-fit gap-2 mt-1">
                  <div className="border border-white/30 rounded-[0.5em] text-white text-[10px] font-bold px-2 py-0.5 hover:bg-white hover:text-black duration-300">
                    Giải đấu mới
                  </div>
                  <div className="border border-white/30 rounded-[0.5em] text-white text-[10px] font-bold px-2 py-0.5 hover:bg-white hover:text-black duration-300">
                    Sắp khởi tranh
                  </div>
                </div>
              </div>

              {/* Reveal Description on Hover */}
              <p className="text-white/80 text-sm font-medium relative h-0 group-hover:h-[80px] mt-0 group-hover:mt-4 leading-relaxed duration-500 overflow-hidden line-clamp-3 z-[2]">
                {tour.description || "Tham gia giải đấu bida chuyên nghiệp với cơ hội giao lưu và nhận những giải thưởng hấp dẫn."}
              </p>

              {/* Bottom Action */}
              <div className="z-[2] mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <button
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-black py-2 rounded-lg text-sm uppercase tracking-tighter"
                >
                  XEM CHI TIẾT
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors duration-300">
        <div className="container mx-auto px-6">
          {/* title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Tại sao chọn{" "}
              <span className="text-green-500">BilliardOne?</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Nền tảng quản lý bida toàn diện dành cho cơ thủ và chủ CLB
            </p>
          </div>

          {/* grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* icon */}
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-all">
                    <Icon
                      className="text-green-500 group-hover:text-white transition-all"
                      size={26}
                    />
                  </div>

                  {/* content */}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLUBS */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Câu lạc bộ hiện có
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Khám phá những CLB uy tín gần bạn
            </p>
          </div>

          <button
            onClick={() => navigate("/booking")}
            className="text-green-500 hover:text-green-600 font-semibold flex items-center gap-1"
          >
            Xem tất cả <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="card group h-[420px] w-full rounded-[1.5em] relative flex justify-end flex-col p-[1.5em] z-[1] overflow-hidden shadow-[0px_4px_16px_0px_#22c55e44] hover:shadow-[0px_4px_24px_0px_#22c55e66] transition-all duration-500 cursor-pointer"
              onClick={() => navigate(`/booking/${club._id}`)}
            >
              {/* Background Image & Overlay */}
              <div className="absolute top-0 left-0 h-full w-full bg-[#111111]">
                <img
                  src={club.avatar || "/img-home/page1.png"}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                  alt={club.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              {/* Content Container */}
              <div className="container text-white z-[2] relative flex flex-col gap-2">
                <div className="h-fit w-full">
                  <h1
                    className="text-[1.4em] sm:text-[1.6em] md:text-[1.8em] leading-tight uppercase tracking-wider mb-1"
                    style={{
                      fontWeight: 900,
                      WebkitTextFillColor: "transparent",
                      WebkitTextStrokeWidth: "1px",
                      WebkitTextStrokeColor: "#fff",
                      textShadow: "0 0 10px rgba(255,255,255,0.5)",
                    }}
                  >
                    {club.name}
                  </h1>
                  <p className="text-sm font-bold opacity-80 flex items-center gap-1">
                    <MapPin size={14} className="text-green-400" />
                    {club.district_name || club.address}
                  </p>
                </div>

                {/* Stars & Stats */}
                <div className="flex justify-between items-center h-fit w-full">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= Math.round(club.rating || 0) ? "#22c55e" : "none"}
                        className={s <= Math.round(club.rating || 0) ? "text-green-500" : "text-white/40"}
                      />
                    ))}
                  </div>
                  <div className="text-white text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                    {club.rating > 0 ? `${Number(club.rating).toFixed(1)}/5` : "Chưa có đánh giá"}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center h-fit w-fit gap-2 mt-1">
                  <div className="border border-white/30 rounded-[0.5em] text-white text-[10px] font-bold px-2 py-0.5 hover:bg-white hover:text-black duration-300">
                    {club.opening_time === "00:00" && club.closing_time === "00:00"
                      ? "Mở cửa 24/24"
                      : `${club.opening_time} - ${club.closing_time}`}
                  </div>
                </div>
              </div>

              {/* Reveal Description on Hover */}
              <p className="text-white/80 text-sm font-medium relative h-0 group-hover:h-[80px] mt-0 group-hover:mt-4 leading-relaxed duration-500 overflow-hidden line-clamp-3 z-[2]">
                {club.description || "Câu lạc bộ bida chuyên nghiệp với không gian sang trọng, trang thiết bị hiện đại và dịch vụ tận tâm."}
              </p>

              {/* Bottom Action */}
              <div className="z-[2] mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <button
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-black py-2 rounded-lg text-sm uppercase tracking-tighter"
                >
                  XEM NGAY
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Khách hàng nói gì
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Trải nghiệm thực tế từ người dùng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition"
              >
                <div className="flex mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 italic mb-6">
                  "{item.comment || "Rất hài lòng!"}"
                </p>

                <div className="flex items-center gap-3">
                  <img
                    src={item.user_avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm dark:text-white">{item.user_name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Khách hàng</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL OFFER BANNER */}
      <section className="container mx-auto px-6 py-14">
        <div className="relative bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 rounded-3xl overflow-hidden">
          {/* hiệu ứng nền */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-20 -mb-20" />

          <div className="relative p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            {/* content */}
            <div className="max-w-xl">
              <span className="inline-block bg-yellow-400/20 text-yellow-300 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                🚧 Sắp ra mắt
              </span>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tính năng Hội viên đang được phát triển
              </h2>

              <p className="text-white/80 text-lg mb-6">
                Chúng tôi đang xây dựng hệ thống hội viên với nhiều ưu đãi hấp
                dẫn dành riêng cho bạn. Hãy chờ bản cập nhật sắp tới!
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-white/80">
                  <span className="text-yellow-300">•</span>
                  Giảm giá khi đặt bàn
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <span className="text-yellow-300">•</span>
                  Ưu tiên giờ chơi đẹp
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <span className="text-yellow-300">•</span>
                  Tích điểm & nhận quà
                </li>
              </ul>

              {/* button disabled */}
              <button
                disabled
                className="bg-white/20 text-white font-semibold px-8 py-3 rounded-xl cursor-not-allowed"
              >
                Sắp ra mắt
              </button>
            </div>

            {/* icon */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-2xl flex items-center justify-center relative">
                <Trophy className="w-24 h-24 text-white/30" />

                {/* badge coming soon */}
                <span className="absolute top-3 right-3 bg-yellow-400 text-black text-xs px-2 py-1 rounded-md font-bold">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Bài viết mới nhất
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Tin tức & mẹo chơi bida</p>
            </div>

            <button
              onClick={() => navigate("/posts")}
              className="text-green-500 hover:text-green-600 font-semibold flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div
                key={post._id}
                className="card group h-[420px] w-full rounded-[1.5em] relative flex justify-end flex-col p-[1.5em] z-[1] overflow-hidden shadow-[0px_4px_16px_0px_#22c55e44] hover:shadow-[0px_4px_24px_0px_#22c55e66] transition-all duration-500 cursor-pointer"
                onClick={() => navigate("/posts")}
              >
                {/* Background Image & Overlay */}
                <div className="absolute top-0 left-0 h-full w-full bg-[#111111]">
                  <img
                    src={post.image || `https://source.unsplash.com/400x300/?billiards&sig=${post._id}`}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    alt={post.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                {/* Content Container */}
                <div className="container text-white z-[2] relative flex flex-col gap-2">
                  <div className="h-fit w-full">
                    <h1
                      className="text-[1.4em] sm:text-[1.6em] md:text-[1.8em] leading-tight uppercase tracking-wider mb-1 line-clamp-2"
                      style={{
                        fontWeight: 900,
                        WebkitTextFillColor: "transparent",
                        WebkitTextStrokeWidth: "1px",
                        WebkitTextStrokeColor: "#fff",
                        textShadow: "0 0 10px rgba(255,255,255,0.5)",
                      }}
                    >
                      {post.title}
                    </h1>
                    <p className="text-sm font-bold opacity-80 flex items-center gap-1">
                      <Zap size={14} className="text-green-400" />
                      {post.club_name}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center h-fit w-fit gap-2 mt-1">
                    <div className="border border-white/30 rounded-[0.5em] text-white text-[10px] font-bold px-2 py-0.5 hover:bg-white hover:text-black duration-300">
                      Tin tức
                    </div>
                    <div className="border border-white/30 rounded-[0.5em] text-white text-[10px] font-bold px-2 py-0.5 hover:bg-white hover:text-black duration-300">
                      Mẹo chơi
                    </div>
                  </div>
                </div>

                {/* Reveal Description on Hover */}
                <p className="text-white/80 text-sm font-medium relative h-0 group-hover:h-[80px] mt-0 group-hover:mt-4 leading-relaxed duration-500 overflow-hidden line-clamp-3 z-[2]">
                  {post.content || "Khám phá những tin tức và mẹo chơi bida mới nhất từ cộng đồng BilliardOne."}
                </p>

                {/* Bottom Action */}
                <div className="z-[2] mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <button
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-black py-2 rounded-lg text-sm uppercase tracking-tighter"
                  >
                    ĐỌC TIẾP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="container mx-auto px-6 pb-16 pt-14 relative z-20">
        <div className="owner-cta-card rounded-3xl p-8 md:p-12 text-white flex flex-col items-center text-center gap-6 max-w-4xl mx-auto shadow-2xl">
          <span className="inline-block bg-white/10 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest border border-white/20">
            Dành cho chủ CLB
          </span>
          <h3 className="text-3xl md:text-5xl font-black mt-2">
            Mở rộng kinh doanh cùng chúng tôi
          </h3>
          <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl">
            Trở thành đối tác của BilliardOne để tiếp cận hàng ngàn khách
            hàng tiềm năng và quản lý CLB hiệu quả hơn.
          </p>
          <div className="mt-4">
            <Link to="/register-owner-account">
              <button className="bg-gradient-to-r from-green-400 to-green-500 text-black font-black px-10 py-4 rounded-xl hover:scale-105 transition-all duration-300 uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                Đăng ký đối tác
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
