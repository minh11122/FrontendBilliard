import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
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
  const { updateAuthUser } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
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
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullname: user?.fullname || "",
      phone: user?.phone || "",
    },
    validationSchema: Yup.object({
      fullname: Yup.string().required("Vui lòng nhập họ và tên"),
      phone: Yup.string()
        .required("Vui lòng nhập số điện thoại")
        .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await updateProfile({
          fullname: values.fullname,
          phone: values.phone,
        });

        const data = res.data.data;
        setUser(data);
        updateAuthUser({ fullname: data.fullname });
        toast.success("Cập nhật thông tin thành công");
      } catch (error) {
        console.log(error);
        toast.error(
          error?.response?.data?.message || "Cập nhật thông tin thất bại",
        );
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required("Vui lòng nhập mật khẩu hiện tại"),
      newPassword: Yup.string()
        .required("Vui lòng nhập mật khẩu mới")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,
          "Mật khẩu ≥6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
        )
        .notOneOf([Yup.ref("oldPassword"), null], "Mật khẩu mới không được trùng với mật khẩu hiện tại"),
      confirmPassword: Yup.string()
        .required("Vui lòng nhập xác nhận mật khẩu")
        .oneOf([Yup.ref("newPassword"), null], "Mật khẩu xác nhận không khớp"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await updatePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });

        toast.success(res.data.message || "Đổi mật khẩu thành công");
        resetForm();
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Đổi mật khẩu thất bại");
      }
    },
  });

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
                {user.role_id?.name === "CUSTOMER" ? "Khách hàng" : user.role_id?.name}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT PROFILE INFO */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
            <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>

            <form onSubmit={profileFormik.handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Fullname */}
                <div>
                  <label className="text-sm text-gray-500">Họ và tên</label>

                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                    <input
                      type="text"
                      name="fullname"
                      value={profileFormik.values.fullname}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className={`pl-9 border rounded-xl w-full px-3 py-2 focus:outline-none focus:ring-2 ${
                        profileFormik.touched.fullname && profileFormik.errors.fullname
                          ? "border-red-500 focus:ring-red-500"
                          : "focus:ring-green-600"
                      }`}
                    />
                  </div>
                  {profileFormik.touched.fullname && profileFormik.errors.fullname && (
                    <p className="text-red-500 text-[11px] mt-1 ml-1">{profileFormik.errors.fullname}</p>
                  )}
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
                      name="phone"
                      value={profileFormik.values.phone}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className={`pl-9 border rounded-xl w-full px-3 py-2 focus:outline-none focus:ring-2 ${
                        profileFormik.touched.phone && profileFormik.errors.phone
                          ? "border-red-500 focus:ring-red-500"
                          : "focus:ring-green-600"
                      }`}
                    />
                  </div>
                  {profileFormik.touched.phone && profileFormik.errors.phone && (
                    <p className="text-red-500 text-[11px] mt-1 ml-1">{profileFormik.errors.phone}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl"
              >
                Cập nhật thông tin
              </button>
            </form>
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
                  <p className="font-medium">
                    {user.role_id?.name === "CUSTOMER" ? "Khách hàng" : user.role_id?.name}
                  </p>
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

              <form onSubmit={passwordFormik.handleSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      placeholder="Mật khẩu hiện tại"
                      value={passwordFormik.values.oldPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`border rounded-xl w-full px-3 py-2 pr-10 ${
                        passwordFormik.touched.oldPassword && passwordFormik.errors.oldPassword
                          ? "border-red-500"
                          : ""
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordFormik.touched.oldPassword && passwordFormik.errors.oldPassword && (
                    <p className="text-red-500 text-[11px] mt-1 ml-1">{passwordFormik.errors.oldPassword}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Mật khẩu mới"
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`border rounded-xl w-full px-3 py-2 pr-10 ${
                        passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                          ? "border-red-500"
                          : ""
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                    <p className="text-red-500 text-[11px] mt-1 ml-1">{passwordFormik.errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`border rounded-xl w-full px-3 py-2 pr-10 ${
                        passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword
                          ? "border-red-500"
                          : ""
                      }`}
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
                  {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                    <p className="text-red-500 text-[11px] mt-1 ml-1">{passwordFormik.errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded-xl"
                >
                  Cập nhật mật khẩu
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
