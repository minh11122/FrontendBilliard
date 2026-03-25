import { Star, MapPin, Users, Trophy, Clock, Zap, Gift, TrendingUp, Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
export const HomePage = () => {
  const clubs = [
    {
      name: "FPT Billiards Club",
      address: "Lô E2-7, Đường D1, Khu Công nghệ cao, TP. Thủ Đức",
      price: "50k/giờ",
      rating: 4.0,
      img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800",
    },
    {
      name: "Galaxy Billiards",
      address: "123 Nguyễn Văn Linh, Quận 7, TP. HCM",
      price: "60k/giờ",
      rating: 4.5,
      img: "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=800",
    },
    {
      name: "King's Club Arena",
      address: "456 Lê Văn Việt, TP. Thủ Đức",
      price: "45k/giờ",
      rating: 4.0,
      img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800",
    },
    {
      name: "Victory Billiards",
      address: "89 Điện Biên Phủ, Quận Bình Thạnh",
      price: "55k/giờ",
      rating: 4.2,
      img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800",
    },
  ];

  const promotions = [
    {
      id: 1,
      title: "Giảm 30% cho đơn đặt bàn đầu tiên",
      description: "Sử dụng mã WELCOME30 khi đặt bàn lần đầu",
      discount: "30%",
      icon: Gift,
    },
    {
      id: 2,
      title: "Gói thành viên hàng tháng",
      description: "Chỉ từ 200k/tháng, không giới hạn lượt chơi",
      discount: "CHỈ TỪ",
      icon: Zap,
    },
    {
      id: 3,
      title: "Giải đấu tháng với giải thưởng",
      description: "Tham gia và tranh thủ giải thưởng hấp dẫn",
      discount: "500K+",
      icon: Trophy,
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "Cơ thủ chuyên nghiệp",
      text: "Ứng dụng thật sự giúp mình quản lý thời gian chơi bida hiệu quả hơn. Giao diện rất thân thiện!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
    },
    {
      name: "Trần Quốc Khánh",
      role: "Quản lý câu lạc bộ",
      text: "Từ khi sử dụng hệ thống này, doanh thu tăng 40%. Quản lý đặt bàn dễ dàng, khách hàng hài lòng.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    },
    {
      name: "Phạm Thị Hương",
      role: "Người dùng thường xuyên",
      text: "Lần đầu tiên tôi dễ dàng tìm được CLB uy tín gần nhất. Hỗ trợ khách hàng cực tuyệt vời!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
    },
  ];

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
              🎉 Ưu đãi mùa hè: Giảm 40% cho gói thành viên 3 tháng. 
              <button className="ml-2 font-semibold hover:underline">
                Xem chi tiết →
              </button>
            </span>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 pt-10">
          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1603297631954-df2d0f7f4d7c?q=80&w=1600"
              className="w-full h-[320px] md:h-[420px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-green-500/70" />

            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center text-white max-w-2xl">
              <span className="bg-green-500/90 w-fit px-3 py-1 rounded-full text-sm mb-4">
                Sắp diễn ra
              </span>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                Giải đấu Bida Sinh viên
                <br />
                <span className="text-green-300">Mở rộng 2024</span>
              </h1>

              <p className="text-white/90 mb-6">
                Tham gia tranh tài cùng các cơ thủ hàng đầu từ các trường đại
                học trên toàn quốc.
              </p>

              <div className="flex gap-3">
                <button className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-semibold transition-all">
                  Đăng ký tham gia ngay
                </button>
                <button className="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl transition-all">
                  Xem chi tiết
                </button>
              </div>
            </div>
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
      <section className="container mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Các ưu đãi hấp dẫn cho bạn</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const IconComponent = promo.icon;
            return (
              <div
                key={promo.id}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all border border-green-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <IconComponent size={24} />
                  </div>
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {promo.discount}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{promo.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{promo.description}</p>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-all">
                  Xem chi tiết
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-14">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Tại sao chọn BilliarMaster?</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Nền tảng quản lý bida toàn diện dành cho cơ thủ và chủ CLB
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 flex gap-4 border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLUBS */}
      <section className="container mx-auto px-6 py-14">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Câu lạc bộ nổi bật</h2>
            <p className="text-gray-600 text-sm mt-1">Khám phá những CLB uy tín gần bạn</p>
          </div>
          <button className="text-green-500 hover:text-green-600 font-semibold text-sm flex items-center gap-1">
            Xem tất cả <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {clubs.map((club, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={club.img}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                <span className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-white text-green-600 px-2 py-1 rounded-lg font-semibold shadow">
                  <Star size={12} fill="currentColor" />
                  {club.rating}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{club.name}</h3>
                <p className="text-gray-600 text-xs flex gap-1 mb-4">
                  <MapPin size={14} className="flex-shrink-0 text-green-500" /> 
                  <span>{club.address}</span>
                </p>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-bold text-green-600">{club.price}</span>
                  <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-all">
                    Đặt bàn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 py-14">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Khách hàng nói gì về chúng tôi</h2>
          <p className="text-center text-gray-600 mb-10">Hàng ngàn người tin tưởng BilliarMaster hàng ngày</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <div className="mb-4 flex items-start">
                  <Quote size={20} className="text-green-500 flex-shrink-0" />
                </div>
                
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-gray-600 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIAL OFFER BANNER */}
      <section className="container mx-auto px-6 py-14">
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-20 -mb-20" />
          
          <div className="relative p-10 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                ⏰ Ưu đãi hạn chế
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trở thành Hội viên VIP ngay hôm nay
              </h2>
              <p className="text-white/90 text-lg mb-6">
                Tiếp cận không giới hạn tất cả CLB, ưu tiên đặt bàn, và nhận phần thưởng riêng biệt
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <span>Giảm 50% phí dịch vụ</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <span>Đặt bàn ưu tiên 24 giờ trước</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <span>Hỗ trợ khách hàng 24/7</span>
                </li>
              </ul>
              <button className="bg-white text-green-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-all">
                Nâng cấp lên VIP
              </button>
            </div>
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-2xl flex items-center justify-center">
                <Trophy className="w-24 h-24 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section className="bg-gray-50 py-14">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Bài viết mới nhất</h2>
              <p className="text-gray-600 text-sm mt-1">Tips, trik, và tin tức về bida</p>
            </div>
            <button className="text-green-500 hover:text-green-600 font-semibold text-sm flex items-center gap-1">
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-all border border-gray-200">
                <div className="h-40 bg-gradient-to-br from-green-400 to-green-600" />
                <div className="p-5">
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                    {['Mẹo chơi', 'Tin tức', 'Hướng dẫn'][idx]}
                  </span>
                  <h3 className="font-bold text-lg mt-3 mb-2 text-gray-900">
                    {['Kỹ thuật chảy cơ cơ bản cho người mới', 'Giải đấu mùa hè sắp khai mạc', 'Cách chọn cơ bida phù hợp'][idx]}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Tìm hiểu các mẹo và kỹ thuật quan trọng để cải thiện trình độ chơi bida của bạn...
                  </p>
                  <button className="text-green-500 hover:text-green-600 font-semibold text-sm flex items-center gap-1">
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
              Trở thành đối tác của BilliarMaster để tiếp cận hàng ngàn khách hàng tiềm năng và quản lý CLB hiệu quả hơn.
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