import { SellerDemoLayout } from "../components/seller/SellerDemoLayout";
import { SellerDashboardPage } from "../pages/seller/SellerDashboardPage";
import { SellerProductsPage } from "../pages/seller/SellerProductsPage";
import { SellerProductNewPage } from "../pages/seller/SellerProductNewPage";
import { SellerProductEditPage } from "../pages/seller/SellerProductEditPage";
import { SellerOrdersPage } from "../pages/seller/SellerOrdersPage";
import { SellerOrderDetailPage } from "../pages/seller/SellerOrderDetailPage";
import { SellerRevenuePage } from "../pages/seller/SellerRevenuePage";
import { SellerSchedulePage } from "../pages/seller/SellerSchedulePage";
import { BecomeChefPage } from "../pages/seller/BecomeChefPage";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { useSyncExternalStore } from "react";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { useProfile } from "../contexts/ProfileContext";
import MenuCatalog from "../pages/MenuCatalog";
import CustomMenu from "../pages/CustomMenu";
import { Profile } from "../pages/Profile";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../components/common/NotFound";
import { authStore } from "../stores/authStore";
import PublicChefInfo from "../pages/PublicChefInfo.tsx";
import DemoPage from "../pages/DemoPage.tsx";

export const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      children: [
        { path: "/become-chef", element: <BecomeChefPage /> },
        { path:"/demo", element : <DemoPage/>},
        {
          path: "/seller",
          element: <SellerDemoLayout />,
          children: [
            { index: true, element: <SellerDashboardPage /> },
            { path: "products", element: <SellerProductsPage /> },
            { path: "product-new", element: <SellerProductNewPage /> },
            { path: "product-edit", element: <SellerProductEditPage /> },
            { path: "orders", element: <SellerOrdersPage /> },
            { path: "order-detail", element: <SellerOrderDetailPage /> },
            { path: "revenue", element: <SellerRevenuePage /> },
            { path: "schedule", element: <SellerSchedulePage /> },
          ],
        },
        // Home and Login must work for visitors without an account.
        { index: true, element: <Home /> },
        { path: "/chef-pub-info/:chefId", element: <PublicChefInfo /> },
        { path: "/menus", element: <MenuCatalog /> },
        { path: "/create-menu", element: <CustomMenu /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        {
          element: <ProtectedRoute />,
          children: [{ path: "/profile", element: <Profile /> }],
        },
      ],
    },
    { path: "*", element: <NotFound /> },
  ],
  { basename: import.meta.env.BASE_URL },
);

function ProtectedRoute() {
  const { loading, error, fetchProfile } = useProfile();
  const isAuthorized = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthorized,
  );
  if (loading) return <p role="status">Đang kiểm tra phiên đăng nhập…</p>;
  if (authStore.isUnknown())
    return (
      <div role="alert">
        {error || "Chưa thể xác minh phiên đăng nhập. Vui lòng thử lại."}
        <button onClick={() => void fetchProfile()}>Thử lại</button>
      </div>
    );
  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}
