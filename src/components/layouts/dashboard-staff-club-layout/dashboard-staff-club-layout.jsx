import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Bell } from "lucide-react";
import { SidebarClub } from "./sidebar-layout";
import axios from "@/lib/axios";

export const DashboardStaffClubLayout = () => {
  const [notifications, setNotifications] = useState([]);
  const [openNoti, setOpenNoti] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!openNoti) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpenNoti(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openNoti]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/staff/notifications");
      if (response.data?.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Loi fetchNotifications staff:", error);
    }
  };

  const handleOpenNoti = () => {
    setOpenNoti(!openNoti);
  };

  const handleReadNotification = async (id) => {
    try {
      await axios.patch(`/staff/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Loi doc notification staff:", error);
    }
  };

  const handleReadAllNotifications = async () => {
    try {
      await axios.patch("/staff/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Loi doc tat ca notification staff:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SidebarClub />
      <main className="flex-1 min-w-0 overflow-hidden bg-slate-50">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-end px-4 py-3 sm:px-6">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleOpenNoti}
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {openNoti && (
                <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                       Thông báo
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleReadAllNotifications}
                        className="text-xs font-semibold text-orange-600 transition hover:text-orange-700"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-5 py-8 text-center text-sm text-slate-500">
                        Không có thông báo nào
                      </p>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={notification._id}>
                          <button
                            type="button"
                            onClick={() => handleReadNotification(notification._id)}
                            className={`w-full border-l-4 px-5 py-4 text-left transition ${
                              notification.is_read
                                ? "border-transparent bg-white hover:bg-slate-50"
                                : "border-orange-500 bg-orange-50/70 hover:bg-orange-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                  {notification.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {notification.message}
                                </p>
                                <p className="mt-2 text-[11px] font-medium text-slate-400">
                                  {notification.created_at ? new Date(notification.created_at).toLocaleString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric"
                                  }) : ""}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                              )}
                            </div>
                          </button>
                          {index !== notifications.length - 1 && (
                            <div className="border-t border-slate-100" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
