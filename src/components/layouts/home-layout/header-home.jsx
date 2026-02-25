import { useState, useContext } from "react";
import { ChevronDown, Moon, User, LogOut } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

export const HeaderHome = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    setOpenUserMenu(false);
    navigate("/");
  };

  return (
    <header className="w-full bg-white border-b shadow-sm relative z-[9999]">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="hover:text-orange-500">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
              🎱
            </div>
            <span>
              Billiard<span className="text-orange-500">Master</span>
            </span>
          </div>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-orange-500">
            Trang chủ
          </Link>

          <Link to="/booking" className="hover:text-orange-500">
            Đặt bàn
          </Link>

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
                <Link
                  to="/tournament"
                  className="block px-4 py-2 hover:bg-orange-50"
                >
                  Giải hiện tại
                </Link>
                <Link
                  to="/tournament/history"
                  className="block px-4 py-2 hover:bg-orange-50"
                >
                  Đã kết thúc
                </Link>
              </div>
            )}
          </div>

          <Link to="/ranking" className="hover:text-orange-500">
            Xếp hạng
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 relative">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Moon size={18} />
          </button>

          {/* Nếu đã đăng nhập */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenUserMenu(!openUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <User size={16} />
                {user.name || "Tài khoản"}
                <ChevronDown size={14} />
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg py-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-orange-50"
                    onClick={() => setOpenUserMenu(false)}
                  >
                    Hồ sơ
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth/login")}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Đăng nhập
              </button>

              <button
                onClick={() => navigate("/auth/register")}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};