import { useEffect, useState } from "react";
import {
  getProfileById,
  updateProfile,
  updatePassword,
} from "@/services/auth.service";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Key,
  Calendar,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadImages } from "@/utils/cloudinary";

export const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [uploading, setUploading] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const urls = await uploadImages([file], setUploading);
      const avatarUrl = urls[0];

      const res = await updateProfile({
        avatar_url: avatarUrl,
      });

      setUser(res.data.data);

      toast.success("Cập nhật avatar thành công");
    } catch (error) {
      console.log(error);
      toast.error("Upload avatar thất bại");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileById();
        const data = res.data.data;

        setUser(data);
        setFullname(data.fullname || "");
        setPhone(data.phone || "");
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await updateProfile({
        fullname,
        phone,
      });

      const data = res.data.data;

      setUser(data);
      setFullname(data.fullname || "");
      setPhone(data.phone || "");

      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Cập nhật thông tin thất bại",
      );
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!oldPassword || !newPassword || !confirmPassword) {
        return toast.error("Vui lòng nhập đầy đủ mật khẩu");
      }

      // validate password
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

      if (!passwordRegex.test(newPassword)) {
        return toast.error(
          "Mật khẩu ≥6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
        );
      }

      if (newPassword !== confirmPassword) {
        return toast.error("Mật khẩu xác nhận không khớp");
      }

      const res = await updatePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      toast.success(res.data.message || "Đổi mật khẩu thành công");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={user.avatar_url || "https://i.pravatar.cc/150"}
              className="w-24 h-24 rounded-full object-cover"
            />

            <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer">
              {uploading ? (
                <span className="text-xs">...</span>
              ) : (
                <Camera size={16} />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold">{user.fullname}</h2>

            <p className="text-gray-500">{user.email}</p>

            <div className="flex items-center gap-2 mt-2 text-sm">
              <ShieldCheck className="text-green-600" size={16} />
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                {user.role_id?.name}
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
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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

            <button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl"
            >
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
                  <p className="font-medium">{user.role_id?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="text-green-600" size={18} />
                <div>
                  <p className="text-gray-500">Ngày tạo</p>
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Key size={18} />
                Đổi mật khẩu
              </h3>

              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Mật khẩu hiện tại"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="border rounded-xl w-full px-3 py-2 pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border rounded-xl w-full px-3 py-2 pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border rounded-xl w-full px-3 py-2 pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full bg-green-600 text-white py-2 rounded-xl"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
