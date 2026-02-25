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
  Home,
} from "lucide-react";

export const SidebarAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    {
      name: "Danh sách tài khoản",
      href: "/admin/list-user",
      icon: UsersRound,
    },
    {
      name: "Tài khoản chờ duyệt",
      href: "/admin/list-acc-pending",
      icon: UserCheck,
    },
    {
      name: "Danh sách cửa hàng",
      href: "/admin/list-shop",
      icon: Store,
    },
    
  ];

  const handleLogout = () => {
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
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Brand */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-foreground">
                  Billard
                </span>
                <p className="text-xs text-muted-foreground">Quản trị viên</p>
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
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
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
              className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
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