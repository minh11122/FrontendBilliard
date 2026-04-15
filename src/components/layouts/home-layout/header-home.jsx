import { useState, useContext, useEffect } from "react";
import { Moon, Sun, User, LogOut, Bell, ChevronDown, Trophy } from "lucide-react";
import { useNavigate, Link, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { SiteLogo } from "@/components/common/SiteLogo";

import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/services/notification.service";

import { checkProfile } from "@/services/auth.service";

export const HeaderHome = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Scroll listener for transparent → solid header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close tournament dropdown when clicking outside
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e) => {
      if (!e.target.closest(".tournament-dropdown")) setOpenMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenu]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isIncomplete, setIsIncomplete] = useState(false);

  useEffect(() => {
    if (!user || user.roleName !== "CUSTOMER") return;

    const fetchCheck = async () => {
      try {
        const res = await checkProfile();
        setIsIncomplete(!res.data.is_profile_complete);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCheck();
  }, [user]);

  const handleLogout = () => {
    logout();
    setOpenUserMenu(false);
    navigate("/");
  };

  // 🔥 load noti khi login
  useEffect(() => {
    if (!user || user.roleName !== "CUSTOMER") return;

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
    <header
      className={`w-full fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${scrolled
        ? "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      {user && isIncomplete && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-3 text-sm flex items-center justify-between">
          <span>⚠️ Vui lòng nhập đầy đủ thông tin (tên, số điện thoại)</span>

          <button
            onClick={() => navigate("/profile")}
            className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs"
          >
            Cập nhật ngay
          </button>
        </div>
      )}
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group transition-all">
          <div className="flex items-center gap-3">
            <SiteLogo
              className="w-10 h-10 group-hover:scale-105 transition-transform"
              alt="BilliardOne logo"
            />
            <div className="flex flex-col">
              <span className={`font-bold text-lg ${scrolled ? "text-gray-900 dark:text-white" : "text-white"}`}>
                Billiard<span className="text-green-400">One</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Menu - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${isActive
                ? "text-green-400 border-b-2 border-green-400"
                : scrolled
                  ? "text-gray-700 dark:text-gray-300 hover:text-green-500"
                  : "text-white/90 hover:text-white"
              }`
            }
          >
            Trang chủ
          </NavLink>

          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${isActive
                ? "text-green-400 border-b-2 border-green-400"
                : scrolled
                  ? "text-gray-700 dark:text-gray-300 hover:text-green-500"
                  : "text-white/90 hover:text-white"
              }`
            }
          >
            CLB
          </NavLink>

          {/* Tournament Dropdown */}
          <div className="relative ml-1 tournament-dropdown">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 border ${location.pathname.startsWith("/tournament") ||
                location.pathname === "/my-tournaments"
                ? "text-green-400 bg-green-500/10 border-green-400/30"
                : scrolled
                  ? "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent"
                  : "text-white/90 hover:text-white border-transparent hover:bg-white/10"
                }`}
            >
              <Trophy
                size={16}
                className={
                  location.pathname.startsWith("/tournament") ||
                    location.pathname === "/my-tournaments"
                    ? "text-green-500"
                    : "text-gray-400 dark:text-gray-500"
                }
              />
              <span>Giải đấu</span>
              <ChevronDown
                size={14}
                className={`transition-transform text-gray-400 dark:text-gray-500 ${openMenu ? "rotate-180" : ""}`}
              />
            </button>

            {openMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[10000]">
                <div className="p-2">
                  <NavLink
                    to="/tournament"
                    onClick={() => setOpenMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                        ? "bg-green-500 text-white shadow-md shadow-green-200"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`
                    }
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 shrink-0">
                      <Trophy size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span>Giải đấu cộng đồng</span>
                      <span className="text-[10px] opacity-70 font-medium">
                        Khám phá các giải đấu mới
                      </span>
                    </div>
                  </NavLink>

                  <div className="h-px bg-gray-50 dark:bg-gray-700 my-1 mx-2" />

                  <NavLink
                    to="/my-tournaments"
                    onClick={() => setOpenMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                        ? "bg-green-500 text-white shadow-md shadow-green-200"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`
                    }
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 shrink-0">
                      <User size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span>Giải của tôi</span>
                      <span className="text-[10px] opacity-70 font-medium">
                        Lịch sử và tiến trình
                      </span>
                    </div>
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/posts"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${isActive
                ? "text-green-400 border-b-2 border-green-400"
                : scrolled
                  ? "text-gray-700 dark:text-gray-300 hover:text-green-500"
                  : "text-white/90 hover:text-white"
              }`
            }
          >
            Bài viết
          </NavLink>

          <NavLink
            to="/my-bookings"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${isActive
                ? "text-green-400 border-b-2 border-green-400"
                : scrolled
                  ? "text-gray-700 dark:text-gray-300 hover:text-green-500"
                  : "text-white/90 hover:text-white"
              }`
            }
          >
            Đặt bàn
          </NavLink>

          <NavLink
            to="/payment-history"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${isActive
                ? "text-green-400 border-b-2 border-green-400"
                : scrolled
                  ? "text-gray-700 dark:text-gray-300 hover:text-green-500"
                  : "text-white/90 hover:text-white"
              }`
            }
          >
            Lịch sử chuyển khoản
          </NavLink>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Button */}
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors ${scrolled
              ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            title={darkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={handleOpenNoti}
                className={`p-2 rounded-lg transition-colors relative group ${scrolled
                  ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
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
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-0 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
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
                            className={`px-6 py-4 cursor-pointer transition-colors border-l-4 ${!n.is_read
                              ? "bg-blue-50 dark:bg-blue-900/20 border-l-green-500 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              : "bg-white dark:bg-gray-800 border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-semibold ${!n.is_read
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-300"
                                    }`}
                                >
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                            <div className="border-t border-gray-100 dark:border-gray-700" />
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
                  {user.fullname || "Tài khoản"}
                </span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openUserMenu ? "rotate-180" : ""}`}
                />
              </button>

              {/* User Dropdown */}
              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors border-b border-gray-100 dark:border-gray-700"
                  >
                    👤 Hồ sơ của tôi
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 font-medium transition-colors"
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
