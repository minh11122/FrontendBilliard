import { useState, useEffect, useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  Gamepad2,
  Gavel,
  Grid2x2,
  Menu,
  Store,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { getDashboardData } from "@/services/staffDashboard.service";
import { AuthContext } from "@/context/AuthContext";

export const SidebarAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ clubs: 0, posts: 0, feedbacks: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);


  useEffect(() => {
    getDashboardData()
      .then((res) => {
        if (res?.success) {
          const s = res.data.stats || {};
          setBadges({
            clubs: s.pendingClubs || 0,
            posts: s.pendingPosts || 0,
            feedbacks: s.pendingFeedbacks || 0,
          });
        }
      })
      .catch(() => { });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigation = [
    {
      name: "Tổng quan",
      href: "/systemstaff/systemstaff1",
      icon: Grid2x2,
    },
    {
      name: "Quản lý CLB",
      href: "/systemstaff/systemstaff2",
      icon: Store,
      badge: badges.clubs || null,
    },
    {
      name: "Quản lý bài viết",
      href: "/systemstaff/systemstaff3",
      icon: FileText,
      badge: badges.posts || null,
    },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col
          border-r border-slate-200 bg-white shadow-sm
          transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 shadow-md shadow-emerald-200">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">
                BilliardOne
              </p>
              <p className="text-[11px] text-slate-400 font-medium">System Staff</p>
              <p className="text-[11px] font-medium text-slate-600 mt-0.5 truncate max-w-[160px]">
                {localStorage.getItem("user_fullname") || "Nhân viên hệ thống"}
              </p>
            </div>
          </div>
          <button
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Quản lý
          </p>
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-500" : "text-slate-400"
                        }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-500">
                        {item.badge}
                      </span>
                    ) : null}
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="border-t border-slate-100 px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-30 text-slate-700 hover:text-slate-900 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
};