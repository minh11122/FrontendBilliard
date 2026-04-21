import { useState, useContext, useEffect } from "react";
import { User, LogOut, Bell, ChevronDown, Trophy } from "lucide-react";
import { useNavigate, Link, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { SiteLogo } from "@/components/common/SiteLogo";
import { initiateSocketConnection, subscribeToNotifications, disconnectSocket } from "@/services/socket.service";

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
  const isSolidHeader = scrolled || location.pathname !== "/";
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

    initiateSocketConnection(user._id);
    subscribeToNotifications((notification) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      disconnectSocket();
    };
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

  const handleOpenNoti = async () => {
    const nextOpen = !openNoti;
    setOpenNoti(nextOpen);

    if (nextOpen) {
      await Promise.all([fetchNotifications(), fetchUnread()]);
    }
  };

  const handleClickNoti = async (notification) => {
    try {
      if (!notification.is_read) {
        await markAsRead(notification._id);

        // update UI
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, is_read: true } : n)),
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      if (notification.link) {
        setOpenNoti(false);
        navigate(notification.link);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <header
      className={`w-full fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${isSolidHeader
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
      <div className="w-full px-6 lg:px-12 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="group transition-all">
          <div className="flex items-center gap-3">
            <SiteLogo
              className="w-10 h-10 group-hover:scale-105 transition-transform"
              alt="BilliardOne logo"
            />
            <div className="flex flex-col">
              <span className={`font-bold text-lg ${isSolidHeader ? "text-gray-900 dark:text-white" : "text-white"}`}>
                Billiard<span className="text-green-400">One</span>
              </span>
            </div>
          </div>
        </Link>
        </div>

        {/* Menu - Desktop */}
        <nav className="hidden lg:flex shrink-0 items-center justify-center gap-6 xl:gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${isActive
                ? "text-green-400 border-b-2 border-green-400"
                : isSolidHeader
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
                : isSolidHeader
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
                : isSolidHeader
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
                : isSolidHeader
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
                : isSolidHeader
                  ? "text-gray-700 dark:text-gray-300 hover:text-green-500"
                  : "text-white/90 hover:text-white"
              }`
            }
          >
            Lịch sử đặt bàn
          </NavLink>

          <NavLink
            to="/payment-history"
            className={({ isActive }) =>
              `px-4 py-2 font-medium transition-colors ${isActive
                ? "text-green-400 border-b-2 border-green-400"
                : isSolidHeader
                  ? "text-gray-700 dark:text-gray-300 hover:text-green-500"
                  : "text-white/90 hover:text-white"
              }`
            }
          >
            Lịch sử chuyển khoản
          </NavLink>
        </nav>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {/* Theme Switch */}
          <label
            htmlFor="theme-toggle"
            className="w-10 h-10 grid rounded-full relative place-items-center cursor-pointer transition-transform duration-200 leading-none overflow-hidden active:scale-95"
            title={darkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
          >
            <input
              id="theme-toggle"
              type="checkbox"
              className="hidden peer"
              checked={darkMode}
              onChange={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
            />
            {/* Moon icon (Dark Mode on) */}
            <div className="col-start-1 row-start-1 w-full h-full grid place-items-center z-[2] origin-center transition-all duration-500 text-[#212121] bg-[#e8e8e8] rounded-full scale-0 opacity-0 rotate-0 peer-checked:rotate-[360deg] peer-checked:scale-100 peer-checked:opacity-100 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Sun icon */}
            <div className="col-start-1 row-start-1 w-full h-full grid place-items-center z-[2] origin-center transition-all duration-500 text-[#e8e8e8] bg-[#212121] rounded-full rotate-[360deg] scale-100 opacity-100 peer-checked:rotate-0 peer-checked:scale-0 peer-checked:opacity-0 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            </div>
          </label>

          {/* Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={handleOpenNoti}
                className={`p-2 rounded-lg transition-colors relative group ${isSolidHeader
                  ? "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
                            onClick={() => handleClickNoti(n)}
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
                                <p className="mt-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                  {n.created_at ? new Date(n.created_at).toLocaleString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric"
                                  }) : ""}
                                </p>
                              </div>

                              {/* Unread Indicator */}
                              {!n.is_read && (
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5" />
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
                className="px-4 py-2 text-green-500 font-medium hover:text-green-600 transition-colors whitespace-nowrap"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/auth/register")}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap"
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
