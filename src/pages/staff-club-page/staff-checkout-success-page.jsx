import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  verifyBookingPayOSCheckoutPayment,
} from "@/services/booking.service";

export default function StaffCheckoutSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const orderCode = params.get("orderCode");

        if (!orderCode) {
          toast.error("Thiếu orderCode để xác thực");
          navigate("/staff/tables", { replace: true });
          return;
        }

        const res = await verifyBookingPayOSCheckoutPayment(orderCode);
        if (res?.success) {
          toast.success("Thanh toán chuyển khoản thành công!");
          navigate("/staff/tables", { replace: true });
          return;
        }

        toast.error(res?.message || "Xác thực thanh toán thất bại");
        navigate("/staff/tables", { replace: true });
      } catch (e) {
        toast.error("Xác thực thanh toán thất bại");
        navigate("/staff/tables", { replace: true });
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [location.search, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <p className="text-lg font-semibold text-slate-800">
        {verifying ? "Đang xác thực thanh toán..." : "Đang chuyển hướng..."}
      </p>
    </div>
  );
}

