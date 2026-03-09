import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { getDashboardData } from "@/services/staffDashboard.service";

export const SidebarAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({ clubs: 0, posts: 0, feedbacks: 0 });
  const location = useLocation();

  // Fetch real badge counts
  useEffect(() => {
    getDashboardData()
      .then(res => {
        if (res?.success) {
          const s = res.data.stats || {};
          setBadges({
            clubs: s.pendingClubs || 0,
            posts: s.pendingPosts || 0,
            feedbacks: s.pendingFeedbacks || 0,
          });
        }
      })
      .catch(() => { }); // silent fail — sidebar badge is non-critical
  }, [location.pathname]); // refresh counts on navigation

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
    {
      name: "Xử lý khiếu nại",
      href: "/systemstaff/systemstaff4",
      icon: Gavel,
    },
    {
      name: "Thống kê",
      href: "/systemstaff/systemstaff5",
      icon: BarChart3,
      badge: badges.feedbacks || null,
    },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-[#f7f8fa] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/30">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-base font-semibold leading-none text-slate-900">
                  BilliardsMaster
                </span>
                <p className="mt-1 text-xs text-slate-500">System Staff</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-500">
                      {item.badge}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

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
