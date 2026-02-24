import { Search, MapPin, Calendar, CheckCircle } from "lucide-react";

export const TournamentPage = () => {
  const tournaments = [
    {
      title: "Giải Billiards 9 Bi Mở Rộng - FPT Cup 2023",
      date: "15/11/2023 - 09:00",
      club: "CLB Bida Thanh Xuân, Hà Nội",
      fee: "200.000 VND",
      status: "upcoming",
      img: "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?q=80&w=800",
    },
    {
      title: "Giải Vô Địch Bida Phong Trào Hà Nội",
      date: "10/11 - 12/11/2023",
      club: "CLB King Billiards",
      fee: "Miễn phí",
      status: "live",
      img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800",
    },
    {
      title: "Thanh Xuân Open - 8 Ball Pool",
      date: "25/11/2023 - 14:00",
      club: "CLB Thanh Xuân, Hà Nội",
      fee: "300.000 VND",
      status: "upcoming",
      img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800",
    },
    {
      title: "Giải Vô Địch CLB Bida Sài Gòn 2022",
      date: "01/12/2022",
      club: "CLB Sài Gòn Billiards",
      fee: "500.000 VND",
      status: "ended",
      img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800",
    },
  ];

  const statusConfig = {
    upcoming: {
      label: "Sắp diễn ra",
      color: "bg-green-100 text-green-600",
      button: "Đăng ký ngay",
      buttonStyle: "bg-green-500 hover:bg-green-600 text-white",
    },
    live: {
      label: "Đang diễn ra",
      color: "bg-blue-100 text-blue-600",
      button: "Xem trực tiếp",
      buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    ended: {
      label: "Đã kết thúc",
      color: "bg-gray-200 text-gray-600",
      button: "Xem kết quả",
      buttonStyle: "bg-gray-200 text-gray-500 cursor-not-allowed",
    },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            Danh sách Giải đấu Công cộng
          </h1>
          <p className="text-gray-500 text-sm">
            Khám phá, tham gia và tranh tài tại các giải đấu bida chuyên nghiệp.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              placeholder="Tìm kiếm giải đấu theo tên, CLB..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <button className="px-3 py-1.5 rounded-lg bg-orange-500 text-white">
              Tất cả
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600">
              Sắp diễn ra
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600">
              Đang diễn ra
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600">
              Đã kết thúc
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          {tournaments.map((t, i) => {
            const cfg = statusConfig[t.status];
            return (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative">
                  <img src={t.img} className="h-40 w-full object-cover" />
                  <span
                    className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-3 line-clamp-2">
                    {t.title}
                  </h3>

                  <div className="space-y-1 text-xs text-gray-500 mb-4">
                    <p className="flex gap-1 items-center">
                      <Calendar size={12} /> {t.date}
                    </p>
                    <p className="flex gap-1 items-center">
                      <MapPin size={12} /> {t.club}
                    </p>
                    <p className="flex gap-1 items-center">
                      <CheckCircle size={12} /> {t.fee}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 text-xs px-3 py-2 rounded-lg border hover:bg-gray-50">
                      Chi tiết
                    </button>
                    <button
                      className={`flex-1 text-xs px-3 py-2 rounded-lg ${cfg.buttonStyle}`}
                      disabled={t.status === "ended"}
                    >
                      {cfg.button}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-10">
          <button className="w-8 h-8 rounded-lg bg-orange-500 text-white">
            1
          </button>
          <button className="w-8 h-8 rounded-lg bg-gray-100">2</button>
          <button className="w-8 h-8 rounded-lg bg-gray-100">3</button>
          <button className="w-8 h-8 rounded-lg bg-gray-100">…</button>
          <button className="w-8 h-8 rounded-lg bg-gray-100">8</button>
        </div>
      </div>
    </div>
  );
};