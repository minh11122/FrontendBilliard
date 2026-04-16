import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { verifySubscriptionPayment } from "@/services/subscription.service";

export default function PaymentSuccessPage() {

  const navigate = useNavigate();

  useEffect(() => {

    const verify = async () => {

      const params = new URLSearchParams(window.location.search);

      const orderCode = params.get("orderCode");

      const subscription_id = localStorage.getItem("pending_subscription");
      const durationMonths = Number(localStorage.getItem("pending_subscription_duration") || 1);

      try {

        await verifySubscriptionPayment(orderCode, subscription_id, durationMonths);

        localStorage.removeItem("pending_subscription");
        localStorage.removeItem("pending_subscription_duration");

        toast.success("Thanh toán thành công!");

        navigate("/owner/settings");

      } catch (err) {

        toast.error("Xác thực thanh toán thất bại");

      }

    };

    verify();

  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-semibold">
        Đang xác thực thanh toán...
      </p>
    </div>
  );
}