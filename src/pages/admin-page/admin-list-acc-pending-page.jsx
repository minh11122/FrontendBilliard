import { useState } from "react";
import { Package, Clock, DollarSign, Plus, MoreVertical } from "lucide-react";

export const AccPendingManagement = () => {
  const packages = [
    {
      id: 1,
      name: "Basic",
      price: "199,000đ",
      duration: "30 ngày",
      features: [
        "Tạo 1 cửa hàng",
        "Quản lý bàn billiards",
        "Thống kê cơ bản",
      ],
      status: "ACTIVE",
    },
    {
      id: 2,
      name: "Pro",
      price: "499,000đ",
      duration: "30 ngày",
      features: [
        "Không giới hạn bàn",
        "Quản lý đặt lịch",
        "Thống kê nâng cao",
        "Hỗ trợ ưu tiên",
      ],
      status: "ACTIVE",
    },
    {
      id: 3,
      name: "Enterprise",
      price: "999,000đ",
      duration: "30 ngày",
      features: [
        "Không giới hạn cửa hàng",
        "Quản lý nhân viên",
        "Báo cáo doanh thu",
        "Hỗ trợ 24/7",
      ],
      status: "ACTIVE",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gói dịch vụ cửa hàng
          </h1>
          <p className="text-sm text-slate-500">
            Quản lý các gói dịch vụ cho cửa hàng sử dụng hệ thống
          </p>
        </div>

        <button className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600">
          <Plus className="h-4 w-4" />
          Tạo gói mới
        </button>
      </div>

      {/* Package grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
              </div>

              <button className="p-1 rounded hover:bg-slate-100">
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              {pkg.price}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <Clock className="h-4 w-4" />
              {pkg.duration}
            </div>

            {/* Features */}
            <ul className="space-y-1 text-sm text-slate-600 mb-4">
              {pkg.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  • {feature}
                </li>
              ))}
            </ul>

            {/* Status */}
            <div className="flex justify-between items-center">

              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                {pkg.status}
              </span>

              <div className="flex gap-2 text-sm">
                <button className="text-emerald-600 hover:underline">
                  Edit
                </button>

                <button className="text-red-500 hover:underline">
                  Delete
                </button>
              </div>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
};