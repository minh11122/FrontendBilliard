import { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import {
  login,
  loginGoogle,
  register,
  registerGoogle,
  verifyOtp,
  resendOtp,
} from "@/services/auth.service";
import { AuthContext } from "@/context/AuthContext";
import "./auth-page.css";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginContext } = useContext(AuthContext);

  // Toggle state
  const [isLogin, setIsLogin] = useState(location.pathname !== "/auth/register");

  // Register steps: register, verify
  const [registerStep, setRegisterStep] = useState("register");
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [emailForOtp, setEmailForOtp] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const otpInputRefs = useRef([]);

  // Sync state with URL
  useEffect(() => {
    setIsLogin(location.pathname !== "/auth/register");
  }, [location.pathname]);

  // Countdown for OTP
  useEffect(() => {
    if (registerStep === "verify" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, registerStep]);

  // --- LOGIN LOGIC ---
  const savedEmail = Cookies.get("rememberedEmail") || "";
  const savedPassword = Cookies.get("rememberedPassword") || "";

  const loginValidationSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    password: Yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
  });

  const getDefaultRouteByRole = (role) => {
    if (role === "OWNER") return "/owner/select-club";
    if (role === "STAFF_CLUB") return "/staff/dashboard";
    return "/";
  };

  const handleLoginSuccess = async (token, role, fullname) => {
    if (fullname) {
      localStorage.setItem("user_fullname", fullname);
    }
    const resolvedUser = await loginContext(token, role);
    const userRole = resolvedUser?.roleName || role;

    if (userRole === "OWNER" || userRole === "STAFF_CLUB" || userRole === "CUSTOMER") {
      toast.success("Đăng nhập thành công!");
      navigate(userRole === "OWNER" ? "/owner/select-club" : (userRole === "STAFF_CLUB" ? "/staff/dashboard" : "/"), { replace: true });
    } else {
      toast.error("Bạn không có quyền truy cập hệ thống");
    }
  };

  const loginFormik = useFormik({
    initialValues: {
      email: savedEmail,
      password: savedPassword,
      rememberMe: !!savedEmail,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await login(values);
        const { token, role, fullname } = res.data;
        if (values.rememberMe) {
          Cookies.set("rememberedEmail", values.email, { expires: 7 });
          Cookies.set("rememberedPassword", values.password, { expires: 7 });
        } else {
          Cookies.remove("rememberedEmail");
          Cookies.remove("rememberedPassword");
        }
        await handleLoginSuccess(token, role, fullname);
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- REGISTER LOGIC ---
  const registerFormik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
      password: Yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Vui lòng nhập mật khẩu"),
      confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp").required("Vui lòng nhập lại mật khẩu"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await register({
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        setEmailForOtp(values.email);
        toast.success("Đăng ký thành công! Vui lòng xác thực OTP.");
        setRegisterStep("verify");
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng ký thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async (credentialResponse, action = "login") => {
    try {
      const tokenId = credentialResponse.credential;
      if (action === "login") {
        const res = await loginGoogle(tokenId);
        const { token, role, fullname } = res.data;
        await handleLoginSuccess(token, role, fullname);
      } else {
        await registerGoogle(tokenId);
        toast.success("Đăng ký Google thành công!");
        setIsLogin(true);
        navigate("/auth/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Thao tác Google thất bại`);
    }
  };

  // --- OTP LOGIC ---
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ email: emailForOtp, otp_code: otp.join("") });
      toast.success("Xác thực thành công!");
      setIsVerifySuccess(true);
      setTimeout(() => {
        setIsLogin(true);
        setRegisterStep("register");
        setIsVerifySuccess(false);
        navigate("/auth/login");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP không hợp lệ");
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    navigate(isLogin ? "/auth/register" : "/auth/login");
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${!isLogin ? "right-panel-active" : ""}`}>

        {/* Register Side (Always on the same side in DOM, CSS handles position) */}
        <div className="form-container register-container">
          <div className={`auth-form-wrapper ${!isLogin ? "form-active" : ""}`}>
            {registerStep === "register" ? (
              <form onSubmit={registerFormik.handleSubmit}>
                <h1 className="text-3xl text-green-600">Đăng ký</h1>
                <p className="text-gray-500">Bắt đầu hành trình của bạn với Billiards Club</p>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                  <input name="email" placeholder="Vui lòng nhập email của bạn tại đây" value={registerFormik.values.email} onChange={registerFormik.handleChange} className="auth-input" />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Mật khẩu</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={registerFormik.values.password} onChange={registerFormik.handleChange} className="auth-input pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" value={registerFormik.values.confirmPassword} onChange={registerFormik.handleChange} className="auth-input pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-solid w-full">Đăng ký</button>

                <div className="mt-4">
                  {!isLogin && (
                    <GoogleLogin
                      onSuccess={(res) => handleGoogleLogin(res, "register")}
                      onError={() => toast.error("Đăng ký Google thất bại")}
                    />
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                {isVerifySuccess ? (
                  <div>
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Thành công!</h2>
                  </div>
                ) : (
                  <form onSubmit={handleOtpVerify}>
                    <h2 className="text-2xl font-bold">Xác nhận OTP</h2>
                    <div className="flex justify-center gap-2 my-6">
                      {otp.map((d, i) => (
                        <input key={i} ref={(el) => (otpInputRefs.current[i] = el)} value={d} onChange={(e) => handleOtpChange(i, e.target.value)} className="w-10 h-10 text-center border rounded-lg" />
                      ))}
                    </div>
                    <button type="submit" className="btn-solid w-full">Xác thực</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Login Side */}
        <div className="form-container login-container">
          <div className={`auth-form-wrapper ${isLogin ? "form-active" : ""}`}>
            <form onSubmit={loginFormik.handleSubmit}>
              <h1 className="text-3xl text-green-600">Đăng nhập</h1>
              <p className="text-gray-500">Chào mừng đến với Billiards Club</p>

              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                <input name="email" placeholder="Vui lòng nhập email của bạn tại đây" value={loginFormik.values.email} onChange={loginFormik.handleChange} className="auth-input" />
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Mật khẩu</label>
                <div className="relative">
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginFormik.values.password} onChange={loginFormik.handleChange} className="auth-input pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                  <input type="checkbox" name="rememberMe" checked={loginFormik.values.rememberMe} onChange={loginFormik.handleChange} />
                  Ghi nhớ
                </label>
                <Link to="/auth/forgot-password" size="xs" className="text-xs text-green-600 hover:underline font-semibold">Quên mật khẩu?</Link>
              </div>

              <button type="submit" className="btn-solid w-full">Đăng nhập</button>

              <div className="mt-4">
                {isLogin && (
                  <GoogleLogin
                    onSuccess={(res) => handleGoogleLogin(res, "login")}
                    onError={() => toast.error("Đăng nhập Google thất bại")}
                  />
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Chào mừng trở lại!</h1>
              <p>Chưa có tài khoản? Đăng ký ngay để bắt đầu chơi bi-a!</p>
              <button onClick={toggleForm} className="btn-ghost">Đăng ký ngay</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Chào mừng bạn mới!</h1>
              <p>Nếu bạn đã có tài khoản, hãy đăng nhập để tiếp tục.</p>
              <button onClick={toggleForm} className="btn-ghost">Đăng nhập</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
