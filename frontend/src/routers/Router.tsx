import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { useEffect, useState } from 'react';
import Home from '../pages/Home';
import Login from '../pages/Login';
import MenuCatalog from '../pages/MenuCatalog';
import CustomMenu from '../pages/CustomMenu';
import { Profile } from '../pages/Profile';
import MainLayout from '../layouts/MainLayout';
import NotFound from '../components/common/NotFound';
import { authStore } from '../stores/authStore';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      // Home and Login must work for visitors without an account.
      { index: true, element: <Home /> },
      { path: '/menus', element: <MenuCatalog /> },
      { path: '/create-menu', element: <CustomMenu /> },
      { path: '/login', element: <Login /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: '/profile', element: <Profile /> }],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
], { basename: import.meta.env.BASE_URL });

function ProtectedRoute() {
  const [isAuthorized, setIsAuthorized] = useState(!authStore.isUnAuthorized());
  useEffect(() => authStore.subscribe(() => setIsAuthorized(!authStore.isUnAuthorized())), []);
  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}
