import { Star, MapPin, Users, Trophy, Clock } from "lucide-react";

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

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 pt-10">
          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1603297631954-df2d0f7f4d7c?q=80&w=1600"
              className="w-full h-[320px] md:h-[420px] object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-orange-500/70" />

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
                <button className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-semibold">
                  Đăng ký tham gia ngay
                </button>
                <button className="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl">
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
            <Users className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">50+</p>
            <p className="text-gray-500 text-sm">Câu lạc bộ liên kết</p>
          </div>
          <div>
            <Trophy className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">200+</p>
            <p className="text-gray-500 text-sm">Bàn bida chất lượng</p>
          </div>
          <div>
            <Star className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">1000+</p>
            <p className="text-gray-500 text-sm">Thành viên hoạt động</p>
          </div>
          <div>
            <Clock className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-gray-500 text-sm">Hỗ trợ đặt bàn</p>
          </div>
        </div>
      </section>

      {/* CLUBS */}
      <section className="container mx-auto px-6 pb-14">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Câu lạc bộ nổi bật</h2>
          <button className="text-orange-500 hover:underline text-sm">
            Xem tất cả →
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {clubs.map((club, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img
                src={club.img}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sm">{club.name}</h3>
                  <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                    <Star size={12} />
                    {club.rating}
                  </span>
                </div>

                <p className="text-gray-500 text-xs flex gap-1 mb-3">
                  <MapPin size={12} /> {club.address}
                </p>

                <div className="flex justify-between items-center">
                  <span className="font-semibold">{club.price}</span>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg">
                    Đặt bàn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="container mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Bạn là chủ quán Bida?
            </h3>
            <p className="text-white/90">
              Trở thành đối tác của chúng tôi để quản lý đặt bàn dễ dàng và tiếp
              cận nhiều khách hàng tiềm năng.
            </p>
          </div>

          <button className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100">
            Đăng ký đối tác
          </button>
        </div>
      </section>
    </div>
  );
};