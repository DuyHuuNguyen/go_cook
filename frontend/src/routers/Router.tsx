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
import MenuCatalog from "../pages/MenuCatalog";
import MenuDetailPage from "../pages/MenuDetailPage";
import CustomMenu from "../pages/booking/CustomMenu";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { useProfile } from "../contexts/ProfileContext";
import { Profile } from "../pages/Profile";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../components/common/NotFound";
import { authStore } from "../stores/authStore";
import DemoPage from "../pages/DemoPage.tsx";
import {MenuManagementPage} from "../pages/seller/MenuManagementPage.tsx";
import UpdateMenu from "../pages/seller/UpdateMenuPage.tsx";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminResourcePage from "../components/admin/AdminResourcePage";
import AdminReports from "../pages/admin/AdminReports";
import AdminSettings from "../pages/admin/AdminSettings";
import { adminSectionKeys } from "../types/AdminTypes";

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
            { path: "menu-management", element: <MenuManagementPage/> },
            { path: "update-menu", element: <UpdateMenu/> },
            { path: "products", element: <SellerProductsPage /> },
            { path: "product-new", element: <SellerProductNewPage /> },
            { path: "product-edit", element: <SellerProductEditPage /> },
            { path: "orders", element: <SellerOrdersPage /> },
            { path: "order-detail", element: <SellerOrderDetailPage /> },
            { path: "revenue", element: <SellerRevenuePage /> },
            { path: "schedule", element: <SellerSchedulePage /> },
          ],
        },
        // Preserve main: Home and Profile require authentication.
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        {
          element: <ProtectedRoute />,
          children: [
            { index: true, element: <Home /> },
            { path: "/menus", element: <MenuCatalog /> },
            { path: "/menus/:id", element: <MenuDetailPage /> },
            { path: "/create-menu", element: <CustomMenu /> },
            { path: "/profile", element: <Profile /> },
          ],
        },
      ],
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboard /> },
        ...adminSectionKeys.map((resource) => ({
          path: resource,
          element: <AdminResourcePage resource={resource} />,
        })),
        { path: "reports", element: <AdminReports /> },
        { path: "settings", element: <AdminSettings /> },
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
