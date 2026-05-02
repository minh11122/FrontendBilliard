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
import { SiteLogo } from "@/components/common/SiteLogo";
import "./auth-page.css";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
const PASSWORD_POLICY_MESSAGE =
  "Mật khẩu ≥6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginContext } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(location.pathname !== "/auth/register");
  const [registerStep, setRegisterStep] = useState("register");
  const [showPassword, setShowPassword] = useState(false);

  const [emailForOtp, setEmailForOtp] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);
  const otpInputRefs = useRef([]);

  useEffect(() => {
    setIsLogin(location.pathname !== "/auth/register");
  }, [location.pathname]);

  useEffect(() => {
    if (registerStep === "verify" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, registerStep]);

  const savedEmail = Cookies.get("rememberedEmail") || "";
  const savedPassword = Cookies.get("rememberedPassword") || "";

  const loginValidationSchema = Yup.object({
    email: Yup.string()
      .trim()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),
    password: Yup.string()
      .trim()
      .min(6, "Mật khẩu tối thiểu 6 ký tự")
      .required("Vui lòng nhập mật khẩu"),
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
      navigate(
        userRole === "OWNER" ? "/owner/select-club" : userRole === "STAFF_CLUB" ? "/staff/dashboard" : "/",
        { replace: true },
      );
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
    onSubmit: async (values, { setSubmitting, setFieldTouched, setFieldError }) => {
      const normalizedEmail = values.email.trim();
      const normalizedPassword = values.password.trim();

      if (!normalizedEmail) {
        setFieldTouched("email", true, false);
        setFieldError("email", "Vui lòng nhập email");
        setSubmitting(false);
        return;
      }

      if (!normalizedPassword) {
        setFieldTouched("password", true, false);
        setFieldError("password", "Vui lòng nhập mật khẩu");
        setSubmitting(false);
        return;
      }

      try {
        const res = await login({
          ...values,
          email: normalizedEmail,
          password: normalizedPassword,
        });
        const { token, role, fullname } = res.data;

        if (values.rememberMe) {
          Cookies.set("rememberedEmail", normalizedEmail, { expires: 7 });
          Cookies.set("rememberedPassword", normalizedPassword, { expires: 7 });
        } else {
          Cookies.remove("rememberedEmail");
          Cookies.remove("rememberedPassword");
        }

        await handleLoginSuccess(token, role, fullname);
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Đăng nhập thất bại";

        if (
          error.response?.status === 403 &&
          errorMessage.toLowerCase().includes("kích hoạt")
        ) {
          await openOtpVerification(normalizedEmail, true);
          setSubmitting(false);
          return;
        }

        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const shouldShowLoginEmailError =
    (loginFormik.touched.email || loginFormik.submitCount > 0) && !!loginFormik.errors.email;
  const shouldShowLoginPasswordError =
    (loginFormik.touched.password || loginFormik.submitCount > 0) && !!loginFormik.errors.password;

  const registerFormik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .trim()
        .email("Email không hợp lệ")
        .required("Vui lòng nhập email"),
      password: Yup.string()
        .trim()
        .matches(PASSWORD_REGEX, PASSWORD_POLICY_MESSAGE)
        .required("Vui lòng nhập mật khẩu"),
      confirmPassword: Yup.string()
        .trim()
        .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
        .required("Vui lòng nhập lại mật khẩu"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const normalizedEmail = values.email.trim();

        await register({
          email: normalizedEmail,
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
        toast.success("Đăng ký thành công! Vui lòng xác thực OTP.");
        await openOtpVerification(normalizedEmail, false);
      } catch (error) {
        toast.error(error.response?.data?.message || "Đăng ký thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleLogin = async (credentialResponse, action = "login") => {
    try {
      const tokenId = credentialResponse.credential;
      if (action === "login") {
        const res = await loginGoogle(tokenId);
        const { token, role, fullname } = res.data;
        await handleLoginSuccess(token, role, fullname);
      } else {
        await registerGoogle(tokenId);
        toast.success("Đăng ký Google thành công. Mật khẩu đã được gửi về email.");
        setIsLogin(true);
        navigate("/auth/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác Google thất bại");
    }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (value && !digit) return;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;

    const newOtp = [...otp];
    pasted.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
  };

  const openOtpVerification = async (email, shouldResend = false) => {
    setEmailForOtp(email);
    setOtp(["", "", "", "", "", ""]);
    setRegisterStep("verify");
    setIsLogin(false);
    navigate("/auth/register");

    if (!shouldResend) {
      setCountdown(0);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
      return;
    }

    try {
      await resendOtp(email);
      setCountdown(60);
      toast.success("Đã gửi OTP mới. Vui lòng xác thực tài khoản.");
    } catch (error) {
      setCountdown(0);
      toast.error(error.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp({ email: emailForOtp, otp_code: otp.join("").trim() });
      toast.success("Xác thực thành công!");
      setIsVerifySuccess(true);
      setTimeout(() => {
        setIsLogin(true);
        setRegisterStep("register");
        setIsVerifySuccess(false);
        navigate("/auth/login");
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "OTP không hợp lệ";
      toast.error(errorMsg);

      if (error.response?.status === 400 && errorMsg !== "OTP sai") {
        setCountdown(0);
        setOtp(["", "", "", "", "", ""]);
      }
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await resendOtp(emailForOtp);
      setOtp(["", "", "", "", "", ""]);
      setCountdown(300);
      toast.success("Đã gửi OTP mới!");
      otpInputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setIsResending(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    navigate(isLogin ? "/auth/register" : "/auth/login");
  };

  return (
    <div className="auth-container relative">
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl bg-white/90 backdrop-blur-sm px-4 py-2 hover:px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <SiteLogo className="w-8 h-8 rounded-lg" alt="Billiards Manager logo" />
          <span className="text-gray-800 tracking-tight">
            Billiards <span className="text-green-600">One</span>
          </span>
        </Link>
      </div>

      <div
        className={`auth-card ${!isLogin ? "right-panel-active" : ""} ${
          registerStep === "verify" ? "verification-mode" : ""
        }`}
      >
        <div className={`form-container register-container ${!isLogin ? "form-active" : ""}`}>
          <div className="auth-form-wrapper">
            {registerStep === "register" ? (
              <form onSubmit={registerFormik.handleSubmit}>
                <h1 className="text-3xl text-green-600">Đăng ký</h1>
                <p className="text-gray-500">Bắt đầu hành trình của bạn với Billiards Club</p>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                  <input
                    name="email"
                    placeholder="Vui lòng nhập email của bạn tại đây"
                    value={registerFormik.values.email}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    className="auth-input"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Mật khẩu</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerFormik.values.password}
                      onChange={registerFormik.handleChange}
                      onBlur={registerFormik.handleBlur}
                      className="auth-input pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={registerFormik.values.confirmPassword}
                      onChange={registerFormik.handleChange}
                      onBlur={registerFormik.handleBlur}
                      className="auth-input pr-12"
                    />
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

                <div className="mt-6 text-center md:hidden">
                  <p className="text-sm text-gray-600 font-medium">
                    Đã có tài khoản?{" "}
                    <button type="button" onClick={toggleForm} className="text-green-600 hover:underline font-bold">
                      Đăng nhập
                    </button>
                  </p>
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
                        <input
                          key={i}
                          ref={(el) => (otpInputRefs.current[i] = el)}
                          value={d}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onPaste={handleOtpPaste}
                          type="text"
                          inputMode="numeric"
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          maxLength={1}
                          className="w-10 h-10 text-center border rounded-lg"
                        />
                      ))}
                    </div>
                    <button type="submit" className="btn-solid w-full">Xác thực</button>
                    <div className="mt-4 text-sm">
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={countdown > 0 || isResending}
                        className="text-green-600 font-medium disabled:text-gray-400"
                      >
                        {isResending
                          ? "Đang gửi..."
                          : countdown > 0
                            ? `Gửi lại sau ${countdown}s`
                            : "Gửi lại OTP"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`form-container login-container ${isLogin ? "form-active" : ""}`}>
          <div className="auth-form-wrapper">
            <form onSubmit={loginFormik.handleSubmit}>
              <h1 className="text-3xl text-green-600">Đăng nhập</h1>
              <p className="text-gray-500">Chào mừng đến với Billiards Club</p>

              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                <input
                  name="email"
                  placeholder="Vui lòng nhập email của bạn tại đây"
                  value={loginFormik.values.email}
                  onChange={loginFormik.handleChange}
                  onBlur={loginFormik.handleBlur}
                  className="auth-input"
                />
                {shouldShowLoginEmailError && (
                  <p className="mt-1 text-sm text-red-500">{loginFormik.errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginFormik.values.password}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    className="auth-input pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle-btn">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {shouldShowLoginPasswordError && (
                  <p className="mt-1 text-sm text-red-500">{loginFormik.errors.password}</p>
                )}
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

              <div className="mt-6 text-center md:hidden">
                <p className="text-sm text-gray-600 font-medium">
                  Chưa có tài khoản?{" "}
                  <button type="button" onClick={toggleForm} className="text-green-600 hover:underline font-bold">
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

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
