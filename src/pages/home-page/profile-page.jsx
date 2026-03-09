import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Key,
  Calendar,
  Camera,
} from "lucide-react";

export const ProfilePage = () => {
  const [user] = useState({
    fullname: "Nguyễn Văn A",
    email: "admin@billiards.com",
    phone: "0123456789",
    address: "Hà Nội",
    role: "ADMIN",
    createdAt: "01/01/2026",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-6">

          {/* Avatar */}
          <div className="relative">
            <img
              src="https://i.pravatar.cc/150"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full">
              <Camera size={16} />
            </button>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold">{user.fullname}</h2>

            <p className="text-gray-500">{user.email}</p>

            <div className="flex items-center gap-2 mt-2 text-sm">
              <ShieldCheck className="text-green-600" size={16} />
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* LEFT PROFILE INFO */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">

            <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>

            <div className="grid md:grid-cols-2 gap-4">

              {/* Fullname */}
              <div>
                <label className="text-sm text-gray-500">Họ và tên</label>

                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                  <input
                    type="text"
                    defaultValue={user.fullname}
                    className="pl-9 border rounded-xl w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-500">Email</label>

                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="pl-9 border rounded-xl w-full px-3 py-2 bg-gray-100"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-gray-500">Số điện thoại</label>

                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                  <input
                    type="text"
                    defaultValue={user.phone}
                    className="pl-9 border rounded-xl w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm text-gray-500">Địa chỉ</label>

                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                  <input
                    type="text"
                    defaultValue={user.address}
                    className="pl-9 border rounded-xl w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl">
              Cập nhật thông tin
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">

              <h3 className="font-semibold">Thông tin tài khoản</h3>

              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="text-green-600" size={18} />
                <div>
                  <p className="text-gray-500">Vai trò</p>
                  <p className="font-medium">{user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="text-green-600" size={18} />
                <div>
                  <p className="text-gray-500">Ngày tạo</p>
                  <p className="font-medium">{user.createdAt}</p>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">

              <h3 className="font-semibold flex items-center gap-2">
                <Key size={18} />
                Đổi mật khẩu
              </h3>

              <input
                type="password"
                placeholder="Mật khẩu hiện tại"
                className="border rounded-xl w-full px-3 py-2"
              />

              <input
                type="password"
                placeholder="Mật khẩu mới"
                className="border rounded-xl w-full px-3 py-2"
              />

              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="border rounded-xl w-full px-3 py-2"
              />

              <button className="w-full bg-green-600 text-white py-2 rounded-xl">
                Cập nhật mật khẩu
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};