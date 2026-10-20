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
import { useEffect, useState } from "react";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MenuCatalog from "../pages/MenuCatalog";
import CustomMenu from "../pages/CustomMenu";
import { Profile } from "../pages/Profile";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../components/common/NotFound";
import { authStore } from "../stores/authStore";

export const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      children: [
        { path: "/become-chef", element: <BecomeChefPage /> },
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
        { path: "/menus", element: <MenuCatalog /> },
        { path: "/create-menu", element: <CustomMenu /> },
        { path: "/login", element: <Login /> },
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
  const [isAuthorized, setIsAuthorized] = useState(!authStore.isUnAuthorized());
  useEffect(
    () =>
      authStore.subscribe(() => setIsAuthorized(!authStore.isUnAuthorized())),
    [],
  );
  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}
