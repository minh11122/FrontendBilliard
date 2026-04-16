import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarOwner } from "./sidebar-layout";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead
} from "@/services/notification.service";

export const DashboardOwnerLayout = () => {
  const location = useLocation();
  const selectedClubId = localStorage.getItem("selected_club_id");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNoti, setOpenNoti] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchUnread();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnread();
      if (openNoti) {
        fetchNotifications();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [openNoti]);

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
      const res = await getNotifications();
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Loi lay notifications owner:", error);
    }
  };

  const fetchUnread = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.unread || 0);
    } catch (error) {
      console.error("Loi dem notifications owner:", error);
    }
  };

  const handleOpenNoti = async () => {
    const nextOpen = !openNoti;
    setOpenNoti(nextOpen);

    if (nextOpen) {
      await Promise.all([fetchNotifications(), fetchUnread()]);
    }
  };

  const handleReadNotification = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Loi doc notification owner:", error);
    }
  };

  const handleReadAllNotifications = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Loi doc tat ca notification owner:", error);
    }
  };

  if (!selectedClubId) {
    return (
      <Navigate
        to="/owner/select-club"
        replace
        state={{ from: location }}
      />
    );
  }

  return (
    <div className="min-h-screen flex">
      <SidebarOwner />
      <main className="flex-1 min-w-0 bg-slate-50">
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
                    {unreadCount}
                  </span>
                )}
              </button>

              {openNoti && (
                <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Thong bao
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleReadAllNotifications}
                        className="text-xs font-semibold text-orange-600 transition hover:text-orange-700"
                      >
                        Danh dau tat ca
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-5 py-8 text-center text-sm text-slate-500">
                        Khong co thong bao nao
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
                              </div>
                              {!notification.is_read && (
                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
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
