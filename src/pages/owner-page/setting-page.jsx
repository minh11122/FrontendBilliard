import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getSubscriptions,
  getCurrentSubscription,
  purchaseSubscription
} from "@/services/subscription.service";

export function SettingPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subs = await getSubscriptions();
      const current = await getCurrentSubscription();

      setSubscriptions(subs);
      setCurrentSubscription(current);
    } catch (err) {
      toast.error("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (id) => {
    try {
      await purchaseSubscription(id);

      toast.success("Đăng ký gói thành công!");

      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading subscriptions...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* CURRENT SUBSCRIPTION */}
      {currentSubscription && (
        <div className="max-w-6xl mx-auto mb-10 bg-white rounded-xl shadow p-6 border border-green-500">
          <h3 className="text-lg font-semibold mb-3">
            Gói đang sử dụng
          </h3>

          <p className="text-2xl font-bold">
            {currentSubscription.subscription_id.name}
          </p>

          <p className="text-gray-500 mb-4">
            {currentSubscription.subscription_id.description}
          </p>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Ngày mua:{" "}
              {new Date(
                currentSubscription.purchase_date
              ).toLocaleDateString("vi-VN")}
            </p>

            <p>
              Hết hạn:{" "}
              {new Date(
                currentSubscription.expire_date
              ).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <span className="inline-block mt-3 bg-green-600 text-white text-xs px-3 py-1 rounded">
            Active
          </span>
        </div>
      )}

      {/* TITLE */}
      <h2 className="text-2xl font-bold text-center mb-10">
        Chọn gói Subscription
      </h2>

      {/* SUBSCRIPTION LIST */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        {subscriptions.map((sub) => {

          const price = sub.price.toLocaleString("vi-VN");

          const isCurrent =
            currentSubscription?.subscription_id?._id === sub._id;

          return (
            <div
              key={sub._id}
              className={`bg-white rounded-xl shadow p-6 border 
              ${
                isCurrent
                  ? "border-green-500"
                  : "border-gray-200"
              }`}
            >
              {isCurrent && (
                <p className="text-xs bg-green-500 text-white px-3 py-1 rounded-full w-fit mb-3">
                  Đang sử dụng
                </p>
              )}

              <h3 className="text-lg font-semibold mb-2">
                {sub.name}
              </h3>

              <p className="text-3xl font-bold mb-4">
                {price}đ
                <span className="text-sm text-gray-500">
                  {" "}
                  / tháng
                </span>
              </p>

              <p className="text-gray-500 text-sm mb-6">
                {sub.description}
              </p>

              <button
                disabled={isCurrent}
                onClick={() => handleSelectPlan(sub._id)}
                className={`w-full py-2 rounded-lg font-semibold
                ${
                  isCurrent
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isCurrent
                  ? "Đang sử dụng"
                  : "Chọn gói này"}
              </button>
            </div>
          );
        })}

      </div>

      {/* PAYMENT METHODS */}
      <div className="max-w-6xl mx-auto mt-10 bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">
          Phương thức thanh toán
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