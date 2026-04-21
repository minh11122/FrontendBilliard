import { Mail, Phone, Linkedin, Facebook, MapPin } from "lucide-react";
import { SiteLogo } from "@/components/common/SiteLogo";

export const FooterHome = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-300">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <SiteLogo className="w-10 h-10 rounded-lg" alt="BilliardOne logo" />
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  Billiard<span className="text-green-500">One</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quản lý CLB</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Hệ thống quản lý đặt bàn và giải đấu bida chuyên nghiệp cho sinh viên FPT University.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a href="#" className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-500 transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-500 transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6 text-sm">
              Điều hướng
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Quy định giải đấu
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Đặt bàn
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6 text-sm">
              Tài nguyên
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Hướng dẫn sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6 text-sm">
              Liên hệ
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <Mail size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <a href="mailto:support@fpt.edu.vn" className="hover:text-green-500 transition-colors">
                  support@fpt.edu.vn
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <Phone size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <a href="tel:024123456" className="hover:text-green-500 transition-colors">
                  024 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>FPT University, Hà Nội</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Bottom Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            © 2026 FPT University Capstone Project. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-green-500 transition-colors">
              Điều khoản
            </a>
            <a href="#" className="hover:text-green-500 transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-green-500 transition-colors">
              Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};


