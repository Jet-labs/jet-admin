import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AdminLayout } from "../layouts/adminLayout";
import { ProtectedLayout } from "../layouts/protectedLayout";
import SignInPage from "../../pages/signInPage";
import WidgetLibraryPage from "../widgetLibrary/widgetLibraryPage";
import RolesPage from "../taxonomy/rolesPage";
import PermissionsPage from "../taxonomy/permissionsPage";

export const rootRouter = createBrowserRouter([
  {
    path: "/login",
    element: <SignInPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/library" replace /> },
          { path: "library", element: <WidgetLibraryPage /> },
          { path: "roles", element: <RolesPage /> },
          { path: "permissions", element: <PermissionsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/library" replace /> },
]);
