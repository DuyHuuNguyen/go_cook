import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useProfile } from "../../contexts/ProfileContext";
import { SellerDemoProvider } from "../../contexts/SellerDemoContext";
import "../../styles/seller.css";

export function SellerDemoLayout() {
  const { profileData, loading, fetchProfile } = useProfile();
  const [checked, setChecked] = useState(import.meta.env.DEV);
  useEffect(() => {
    if (import.meta.env.DEV) return;
    let active = true;
    void fetchProfile().finally(() => {
      if (active) setChecked(true);
    });
    return () => {
      active = false;
    };
  }, [fetchProfile]);
  // Only the development bundle allows anonymous previews. Roles come from the existing profile.
  if (!import.meta.env.DEV) {
    if (!checked || loading)
      return <p role="status">Đang kiểm tra tài khoản…</p>;
    if (!profileData) return <Navigate to="/login" replace />;
    if (!profileData.roles?.includes("ROLE_CHEF"))
      return <Navigate to="/become-chef" replace />;
  }
  return (
    <SellerDemoProvider>
      <div className="seller-module">
        <div className="container notice" role="note">
          <strong>Dữ liệu demo · ngày mô phỏng 14/10/2026.</strong> Thay đổi chỉ
          lưu trong phiên xem và mất khi tải lại trang. Phí 15%, giữ tiền,
          nghiệm thu và trạng thái đơn đều là giả lập, chưa phải nghiệp vụ
          backend đã xác nhận.
        </div>
        <Outlet />
      </div>
    </SellerDemoProvider>
  );
}
