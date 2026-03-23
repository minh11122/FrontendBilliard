import { useState, useContext } from "react";
import { Moon, User, LogOut, Bell, ChevronDown } from "lucide-react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

export const HeaderHome = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    setOpenUserMenu(false);
    navigate("/");
  };

  const [notifications, setNotifications] = useState([
  { id: 1, text: "Bạn đã đặt bàn thành công", read: false },
  { id: 2, text: "Có giải đấu mới", read: false },
]);

  return (
    <header className="w-full bg-white border-b shadow-sm relative z-[9999]">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="hover:text-green-500">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
              🎱
            </div>
            <span>
              Billiard<span className="text-green-500">Master</span>
            </span>
          </div>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-green-500">
            Trang chủ
          </Link>

          <Link to="/booking" className="hover:text-green-500">
            CLB
          </Link>

          <NavLink
            to="/tournament"
            className={({ isActive }) =>
              isActive ? "text-green-500 font-semibold" : "hover:text-green-500"
            }
          >
            Giải đấu
          </NavLink>

          <Link to="/ranking" className="hover:text-green-500">
            Xếp hạng
          </Link>

          <Link to="/my-bookings" className="hover:text-orange-500">
            Đặt bàn
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 relative">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <Moon size={18} />
          </button>
          {user && (
            <div className="relative">
              <button
                onClick={() => setOpenNoti(!openNoti)}
                className="p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <Bell size={18} />

                {/* Badge */}
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Dropdown */}
              {openNoti && (
                <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg py-2">
                  <p className="px-4 py-2 text-sm font-semibold text-gray-700">
                    Thông báo
                  </p>

                  {notifications.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-gray-500">
                      Không có thông báo
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        {n.text}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {/* Nếu đã đăng nhập */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenUserMenu(!openUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <User size={16} />
                {user.name || "Tài khoản"}
                <ChevronDown size={14} />
              </button>

              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg py-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-green-50"
                    onClick={() => setOpenUserMenu(false)}
                  >
                    Hồ sơ
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2"
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
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
