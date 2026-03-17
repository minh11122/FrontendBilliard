import { useEffect, useState } from "react";
import { Package, DollarSign, Plus, MoreVertical } from "lucide-react";
import { getAllSubscriptions } from "@/services/admin.service";

export const AccPendingManagement = () => {
  const [packages, setPackages] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchPackages = async () => {
    try {
      const res = await getAllSubscriptions({
        page,
        limit: 10,
      });

      setPackages(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [page]);

  // format tiền
  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gói dịch vụ cửa hàng
          </h1>
        </div>

        <button className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600">
          <Plus className="h-4 w-4" />
          Tạo gói mới
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">{pkg.name}</h3>
              </div>

              <button className="p-1 rounded hover:bg-slate-100">
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 text-lg font-bold">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              {formatPrice(pkg.price)}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 mt-2 mb-3">
              {pkg.description}
            </p>

            {/* Status */}
            <div className="flex justify-between items-center">
              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                ACTIVE
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

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm">
        <p>
          Trang {pagination.page} / {pagination.totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};