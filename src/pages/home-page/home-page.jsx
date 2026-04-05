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

  // auto chuyển ảnh
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
    },
    {
      title: "Quản lý giải đấu dễ dàng",
      description: "Công cụ quản lý giải đấu chuyên nghiệp cho các CLB",
    },
    {
      title: "Xếp hạng cơ thủ",
      description: "Theo dõi xếp hạng và tiến bộ của các cơ thủ hàng đầu",
    },
    {
      title: "Cộng đồng sôi động",
      description: "Kết nối với cơ thủ khác và chia sẻ kinh nghiệm",
    },
  ];

  return (
    <div className="bg-white">
      {/* ANNOUNCEMENT BANNER */}
      <section className="bg-green-500 text-white py-3">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Zap size={16} />
            <span>
              🎉 Nhanh Tay đặt bàn: Tiện ích mọi lúc mọi nơi.
              <button
                onClick={() => navigate("/booking")}
                className="ml-2 font-semibold hover:underline"
              >
                Xem chi tiết →
              </button>
            </span>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="relative overflow-hidden">
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

          {/* dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i === index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <Users className="mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">50+</p>
            <p className="text-gray-500 text-sm">Câu lạc bộ liên kết</p>
          </div>
          <div>
            <Trophy className="mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">200+</p>
            <p className="text-gray-500 text-sm">Bàn bida chất lượng</p>
          </div>
          <div>
            <Star className="mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">1000+</p>
            <p className="text-gray-500 text-sm">Thành viên hoạt động</p>
          </div>
          <div>
            <Clock className="mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-gray-500 text-sm">Hỗ trợ đặt bàn</p>
          </div>
        </div>
      </section>

      {/* PROMOTIONS */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Giải đấu mới nhất
          </h2>
          <p className="text-gray-600 mt-2">
            Tham gia các giải đấu hấp dẫn đang diễn ra
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tournaments.map((tour) => (
            <div
              key={tour._id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={tour.banner || "/img-home/page1.png"}
                className="w-full h-44 object-cover"
              />

              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {tour.name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {tour.description || "Chưa có mô tả"}
                </p>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p>
                    📅{" "}
                    {tour.play_date
                      ? new Date(tour.play_date).toLocaleDateString()
                      : "Chưa có ngày"}
                  </p>
                  <p>
                    👥 {tour.registered_player}/{tour.max_players}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/tournament/${tour._id}`)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl font-semibold"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          {/* title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tại sao chọn{" "}
              <span className="text-green-500">BilliarMaster?</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nền tảng quản lý bida toàn diện dành cho cơ thủ và chủ CLB
            </p>
          </div>

          {/* grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* icon */}
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-all">
                  <TrendingUp
                    className="text-green-500 group-hover:text-white transition-all"
                    size={26}
                  />
                </div>

                {/* content */}
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLUBS */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Câu lạc bộ nổi bật
            </h2>
            <p className="text-gray-600 mt-2">
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

        <div className="grid md:grid-cols-4 gap-6">
          {clubs.map((club) => (
            <div
              key={club._id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative h-44">
                <img
                  src={
                    club.avatar ||
                    `https://source.unsplash.com/400x300/?billiards&sig=${club._id}`
                  }
                  className="w-full h-full object-cover"
                />

                <span className="absolute top-3 right-3 text-xs bg-white text-green-600 px-2 py-1 rounded-lg font-semibold shadow">
                  Approved
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {club.name}
                </h3>

                <p className="text-gray-600 text-sm flex gap-1 mb-4">
                  <MapPin size={14} className="text-green-500" />
                  {club.district_name || club.address}
                </p>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-green-600 font-semibold text-sm">
                    {club.opening_time} - {club.closing_time}
                  </span>

                  <button
                    onClick={() => navigate(`/booking/${club._id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg"
                  >
                    Xem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Khách hàng nói gì
            </h2>
            <p className="text-gray-600 mt-2">
              Trải nghiệm thực tế từ người dùng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition"
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

                <p className="text-gray-700 italic mb-6">
                  "{item.comment || "Rất hài lòng!"}"
                </p>

                <div className="flex items-center gap-3">
                  <img
                    src={item.user_avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm">{item.user_name}</p>
                    <p className="text-gray-500 text-xs">Khách hàng</p>
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
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Bài viết mới nhất
              </h2>
              <p className="text-gray-600 mt-2">Tin tức & mẹo chơi bida</p>
            </div>

            <button
              onClick={() => navigate("/posts")}
              className="text-green-500 hover:text-green-600 font-semibold flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition"
              >
                <img
                  src={
                    post.image ||
                    `https://source.unsplash.com/400x300/?billiards&sig=${post._id}`
                  }
                  className="w-full h-44 object-cover"
                />

                <div className="p-5">
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                    {post.club_name}
                  </span>

                  <h3 className="font-semibold text-lg mt-3 mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {post.content}
                  </p>

                  <button
                    onClick={() => navigate("/posts")}
                    className="text-green-500 hover:text-green-600 font-semibold text-sm flex items-center gap-1"
                  >
                    Đọc tiếp <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="container mx-auto px-6 pb-16 pt-14">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
              Dành cho chủ CLB
            </span>
            <h3 className="text-3xl md:text-4xl font-bold mb-3">
              Mở rộng kinh doanh cùng chúng tôi
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-lg">
              Trở thành đối tác của BilliarMaster để tiếp cận hàng ngàn khách
              hàng tiềm năng và quản lý CLB hiệu quả hơn.
            </p>
            <div className="flex gap-4">
              <Link to="/register-owner-account">
                <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-all">
                  Đăng ký đối tác
                </button>
              </Link>
              <button className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-all">
                Xem tài liệu
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 hidden md:block">
            <div className="w-48 h-48 md:w-80 md:h-80 bg-white/10 rounded-2xl flex items-center justify-center">
              <Users className="w-32 h-32 text-white/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
