import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getSubscriptions,
  purchaseSubscription
} from "@/services/subscription.service";

export function SettingPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const res = await getSubscriptions();
      setSubscriptions(res.data);
    } catch (err) {
      toast.error("Không tải được subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (id) => {
    try {
      await purchaseSubscription(id);
      toast.success("Đăng ký gói thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold text-center mb-10">
        Chọn gói Subscription
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptions.map((sub, index) => {
          const price = sub.price.toLocaleString("vi-VN");

          return (
            <div
              key={sub._id}
              className={`bg-white rounded-xl shadow p-6 border ${
                index === 1
                  ? "border-green-500 scale-105"
                  : "border-gray-200"
              }`}
            >
              {index === 1 && (
                <p className="text-xs bg-green-500 text-white px-3 py-1 rounded-full w-fit mb-3">
                  Phổ biến nhất
                </p>
              )}

              <h3 className="text-lg font-semibold mb-2">{sub.name}</h3>

              <p className="text-3xl font-bold mb-4">
                {price}đ
                <span className="text-sm text-gray-500"> / tháng</span>
              </p>

              <p className="text-gray-500 text-sm mb-6">
                {sub.description}
              </p>

              <button
                onClick={() => handleSelectPlan(sub._id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
              >
                Chọn gói này
              </button>
            </div>
          );
        })}
      </div>

      {/* payment */}
      <div className="max-w-6xl mx-auto mt-10 bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">
          Phương thức thanh toán khi khởi tạo
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">VNPay</p>
              <p className="text-sm text-gray-500">
                Thanh toán qua cổng VNPay
              </p>
            </div>

            <div className="text-green-600 font-bold">✓</div>
          </div>

          <div className="border rounded-lg p-4">
            <p className="font-medium">MoMo Wallet</p>
            <p className="text-sm text-gray-500">
              Thanh toán bằng ví điện tử MoMo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}