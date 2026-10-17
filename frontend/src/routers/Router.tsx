import {createBrowserRouter, Navigate, Outlet} from 'react-router';
import Home from "../pages/Home";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../components/common/NotFound";
import {useEffect, useState} from "react";
import {authStore} from "../stores/authStore";
import {Profile} from "../pages/Profile";
import Login from "../pages/Login";



export const router = createBrowserRouter([
  {
    children: [
      {
        path: "/login",
        element: <MainLayout />,
        children:[
          { index: true, element: <Login/> },
        ]
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
    ],
  },
]);


function ProtectedRoute() {
  const [isAuthorized, setIsAuthorized] = useState(!authStore.isUnAuthorized())

  useEffect(() => {
    return authStore.subscribe(() => {
      setIsAuthorized(!authStore.isUnAuthorized())
    })
  }, [])
  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />
}