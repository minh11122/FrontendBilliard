import { Mail, Phone } from "lucide-react";

export const FooterHome = () => {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                🎮
              </div>
              <span>
                Billiard<span className="text-orange-500">Master</span>
              </span>
            </div>
            <p className="text-gray-500 leading-relaxed">
              Hệ thống quản lý đặt bàn và giải đấu bida chuyên nghiệp cho sinh viên FPT University. 
              Nơi đam mê tỏa sáng.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4 uppercase text-sm tracking-wide">
              Liên kết
            </h3>
            <ul className="space-y-3 text-gray-500">
              <li>
                <a href="#" className="hover:text-orange-500">Trang chủ</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500">Về chúng tôi</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500">Quy định giải đấu</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4 uppercase text-sm tracking-wide">
              Liên hệ
            </h3>
            <ul className="space-y-3 text-gray-500">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                support@fpt.edu.vn
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                024 1234 5678
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-10 pt-6 text-center text-gray-400 text-sm">
          © 2024 FPT University Capstone Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
};