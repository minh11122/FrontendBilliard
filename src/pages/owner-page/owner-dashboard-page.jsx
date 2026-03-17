import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clubService } from "@/services/club.service";

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const clubId = localStorage.getItem("selected_club_id");

  useEffect(() => {
    const checkPayOSConfig = async () => {
      if (!clubId) return;
      try {
        const res = await clubService.getClubBank(clubId);
        const bank = res?.data;
        const ok = !!(bank?.payos_client_id && bank?.has_payos_keys);
        if (!ok) {
          toast.error("Vui lòng thiết lập PayOS cho CLB trước khi sử dụng dashboard");
          navigate("/owner/settings", { replace: true });
        }
      } catch {
        toast.error("Không kiểm tra được cấu hình PayOS. Vui lòng thiết lập trước.");
        navigate("/owner/settings", { replace: true });
      }
    };

    checkPayOSConfig();
  }, [clubId, navigate]);

  return (
    <div>
      <h1>Đây là trang dashboard cho chủ quán</h1>
    </div>
  );
};