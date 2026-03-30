import { useState, useContext, useEffect } from "react";
import { Moon, User, LogOut, Bell, ChevronDown } from "lucide-react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/services/notification.service";

export const HeaderHome = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    setOpenUserMenu(false);
    navigate("/");
  };

  // 🔥 load noti khi login
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    fetchUnread();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.unread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNoti = () => {
    setOpenNoti(!openNoti);
  };

  const handleClickNoti = async (id) => {
    try {
      await markAsRead(id);

      // update UI
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)),
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm relative z-[9999]">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
              🎱
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900">
                Billiard<span className="text-green-500">Master</span>
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Quản lý CLB
              </span>
            </div>
          </div>
        </Link>

        {/* Menu - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${
                isActive
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-700 hover:text-green-500"
              }`
            }
          >
            Trang chủ
          </NavLink>

          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${
                isActive
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-700 hover:text-green-500"
              }`
            }
          >
            CLB
          </NavLink>

          <NavLink
            to="/tournament"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${
                isActive
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-700 hover:text-green-500"
              }`
            }
          >
            Giải đấu
          </NavLink>

          <NavLink
            to="/posts"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${
                isActive
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-700 hover:text-green-500"
              }`
            }
          >
            Bài viết
          </NavLink>

          <NavLink
            to="/my-bookings"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${
                isActive
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-gray-700 hover:text-green-500"
              }`
            }
          >
            Đặt bàn
          </NavLink>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Button */}
          <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <Moon size={20} />
          </button>

          {/* Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={handleOpenNoti}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative group"
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {openNoti && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl py-0 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">
                      Thông báo
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          await markAllAsRead();
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, is_read: true })),
                          );
                          setUnreadCount(0);
                        }}
                        className="text-green-500 cursor-pointer text-xs font-semibold hover:text-green-600 transition-colors"
                      >
                        Đánh dấu tất cả
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-6 py-8 text-center text-sm text-gray-500">
                        Không có thông báo nào
                      </p>
                    ) : (
                      notifications.map((n, index) => (
                        <div key={n._id}>
                          <div
                            onClick={() => handleClickNoti(n._id)}
                            className={`px-6 py-4 cursor-pointer transition-colors border-l-4 ${
                              !n.is_read
                                ? "bg-blue-50 border-l-green-500 hover:bg-blue-100"
                                : "bg-white border-l-transparent hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-semibold ${
                                    !n.is_read
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {n.message}
                                </p>
                              </div>

                              {/* Unread Indicator */}
                              {!n.is_read && (
                                <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>

                          {/* Divider */}
                          {index !== notifications.length - 1 && (
                            <div className="border-t border-gray-100" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setOpenUserMenu(!openUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                <User size={18} />
                <span className="hidden sm:inline text-sm">
                  {user.name || "Tài khoản"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* User Dropdown */}
              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50 font-medium transition-colors border-b border-gray-100"
                  >
                    👤 Hồ sơ của tôi
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors text-red-600"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => navigate("/auth/login")}
                className="px-4 py-2 text-green-500 font-medium hover:text-green-600 transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/auth/register")}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
