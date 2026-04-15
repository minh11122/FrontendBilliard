// src/components/admin/SidebarAdmin.jsx
import { useState, useContext } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Store,
  Menu,
  X,
  ChevronRight,
  LogOut,
  HelpCircle,
  Settings,
  UsersRound,
  Building2,
  UserCheck,
  UserPlus,
  CircleDot,
  Home,
  User,
  ConciergeBell,
  Trophy,
  ArrowLeftCircle,
  Sparkles,
  FileText,
  Lock,
  PieChart,
  Star,
  CreditCard
} from "lucide-react";
import toast from "react-hot-toast";

export const SidebarOwner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const userFullname = localStorage.getItem("user_fullname") || "Chủ quán";
  const clubName = localStorage.getItem("selected_club_name") || "Billiard Club";

  const normalizePlanType = (rawPlan) => {
    const value = String(rawPlan || "").toLowerCase().trim();
    if (value.includes("pro")) return "pro";
    if (value.includes("basic")) return "basic";
    return "free";
  };

  const planType = normalizePlanType(localStorage.getItem("selected_club_plan"));

  const navigation = [
    {
      name: "Tổng quan",
      href: "/owner/dashboard",
      icon: LayoutDashboard,
      roles: ["basic", "pro"]
    },
    {
      name: "Báo cáo doanh thu",
      href: "/owner/reports",
      icon: PieChart,
      roles: ["basic", "pro"]
    },
    {
      name: "Quản lý bàn",
      href: "/owner/tables",
      icon: CircleDot,
      roles: ["free", "basic", "pro"]
    },
    {
      name: "Quản lý nhân viên",
      href: "/owner/list-employee",
      icon: User,
      roles: ["free", "basic", "pro"]
    },
    {
      name: "Quản lý Dịch vụ",
      href: "/owner/services",
      icon: ConciergeBell,
      roles: ["free", "basic", "pro"]
    },
    {
      name: "Quản lý Giải đấu",
      href: "/owner/tournaments",
      icon: Trophy,
      roles: ["pro"]
    },
    {
      name: "Quản lý Bài đăng",
      href: "/owner/posts",
      icon: FileText,
      roles: ["pro"]
    },
    {
      name: "Lịch sử chuyển khoản",
      href: "/owner/payment-history",
      icon: CreditCard,
      roles: ["free", "basic", "pro"]
    },
    {
      name: "Quản lý đánh giá",
      href: "/owner/reviews",
      icon: Star,
      roles: ["free", "basic", "pro"]
    },
    {
      name: "Quản lý tiện ích",
      href: "/owner/amenities",
      icon: Sparkles,
      roles: ["free", "basic", "pro"]
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user_fullname");
    localStorage.removeItem("selected_club_id");
    localStorage.removeItem("selected_club_name");
    localStorage.removeItem("selected_club_plan");
    logout();
    navigate("/");
  };

  const handleProfile = () => navigate("/profile");
  const handleSupport = () => navigate("/support");

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Brand */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg font-semibold text-foreground truncate block max-w-[160px]">
                  {clubName}
                </span>
                <p className="text-[11px] text-muted-foreground font-medium">Chủ quán</p>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate max-w-[160px]">{userFullname}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const isAllowed = item.roles.includes(planType);

              if (!isAllowed) {
                return (
                  <div
                    key={item.name}
                    onClick={() => {
                      toast("Tính năng này cần nâng cấp gói " + (item.roles[0] === 'pro' ? 'Pro' : 'Basic'), { icon: '🔒' });
                      setSidebarOpen(false);
                    }}
                    className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-gray-400 bg-gray-50/50 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1 opacity-70">{item.name}</span>
                    </div>
                    <Lock className="h-4 w-4 text-orange-400" />
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? "bg-orange-500/10 text-orange-600"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  onClick={() => setSidebarOpen(false)} // Đóng sidebar trên mobile khi click
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-border p-3 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => navigate("/owner/select-club")}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-sm font-medium">Đổi chi nhánh</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => navigate("/owner/settings")}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Cài đặt</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-red-100 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-30 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
};