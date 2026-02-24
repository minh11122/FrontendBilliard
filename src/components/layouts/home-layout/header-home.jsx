import { useState } from "react";
import { ChevronDown, Moon } from "lucide-react";

export const HeaderHome = () => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
            🎮
          </div>
          <span>
            Billiard<span className="text-orange-500">Master</span>
          </span>
        </div>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <a href="#" className="hover:text-orange-500">
            Trang chủ
          </a>
          <a href="#" className="hover:text-orange-500">
            Đặt bàn
          </a>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center gap-1 text-orange-500 font-semibold"
            >
              Giải đấu <ChevronDown size={16} />
            </button>

            {openMenu && (
              <div className="absolute top-full mt-2 w-40 bg-white border rounded-xl shadow-lg py-2">
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-orange-50"
                >
                  Giải hiện tại
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-orange-50"
                >
                  Đã kết thúc
                </a>
              </div>
            )}
          </div>

          <a href="#" className="hover:text-orange-500">
            Xếp hạng
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Moon size={18} />
          </button>

          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Đăng nhập
          </button>

          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            Đăng ký
          </button>
        </div>
      </div>
    </header>
  );
};