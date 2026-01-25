import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../layouts/AdminLayout";

// Guards (Bảo vệ Route)
import AdminGuard from "../routes/AdminGuard.jsx"; 

// Public Pages
import IntroducePage from "../pages/Introduce/IntroducePage.jsx";
import LoginPage from "../pages/Login/LoginPage.jsx"; 

// Admin Pages
import { AccountManage, AccountDetail, StudentCourseDetail } from "../pages/accounts";
import { CourseManagement, CourseDetail } from "../pages/courses";
import Dashboard from '../pages/Dashboard/Dashboard';
import Settings from '../pages/Settings/Settings';
import TopupsManagement from "../pages/topups/TopUpsManagement.jsx";
import TopUpDetail from "../pages/topups/components/TopUpDetail/TopUpDetail.jsx";

export const router = createBrowserRouter([
  // {
  //   path: "/",
  //   element: <AdminLayout />,
  //   children: [
  //     {
  //       index: true, // Ðây là trang s? hi?n ra khi vào d?a ch? "/"
  //       element: <Dashboard />,
  //     },
  //     {
  //       path: "accounts",
  //       children: [
  //         {
  //           index: true,
  //           element: <AccountManage />,
  //         },
  //         {
  //           path: ":id",
  //           element: <AccountDetail />,
  //         },
  //         {
  //           path: ":accountHolderId/courses/:courseId",
  //           element: <StudentCourseDetail />,
  //         },
  //       ],
  //     },
  //     {
  //       path: "courses",
  //       children: [
  //         {
  //           index: true,
  //           element: <CourseManagement />,
  //         },
  //         {
  //           path: ":courseCode",
  //           element: <CourseDetail />,
  //         },
  //       ],
  //     },
  //     {
  //       path: "settings",
  //       element: <Settings />,
  //     },
  //     {
  //       path: "topup",
  //       children: [
  //         {
  //           index: true,
  //           element: <TopupsManagement />,
  //         },
  //         {
  //           path: ":id",
  //           element: <TopUpDetail />,
  //         },
  //       ],
  //     },
  //   ],
  // },
  /* ==========================================================================
     PUBLIC ROUTES
     - Accessible without authentication.
     ========================================================================== */
  {
    path: "/introduce",
    element: <IntroducePage />, 
  },
  {
    path: "/login",
    element: <LoginPage />, 
  },

  /* ==========================================================================
     PROTECTED ADMIN ROUTES
     - Wrapped inside <AdminGuard />
     - Checks for 'isAdminLoggedIn' flag before rendering AdminLayout.
     ========================================================================== */
  {
    // [QUAN TRỌNG] Bọc toàn bộ Admin bằng Guard
    element: <AdminGuard />, 
    children: [
      {
        path: "/",
        element: <AdminLayout />,
        children: [
          // 1. Dashboard (Default Page)
          {
            index: true,
            element: <Dashboard />,
          },

          // 2. Account Management (Students/Users)
          {
            path: "accounts",
            children: [
              {
                index: true,
                element: <AccountManage />,
              },
              {
                path: ":id",
                element: <AccountDetail />,
              },
              {
                path: ":accountHolderId/courses/:courseId",
                element: <StudentCourseDetail />,
              },
            ],
          },

          // 3. Course Management
          {
            path: "courses",
            children: [
              {
                index: true,
                element: <CourseManagement />,
              },
              {
                path: ":courseCode",
                element: <CourseDetail />,
              },
            ],
          },

          // 4. Top-up / Transaction Management
          {
            path: "topup",
            children: [
              {
                index: true,
                element: <TopupsManagement />,
              },
              {
                path: ":id",
                element: <TopUpDetail />,
              },
            ],
          },

          // 5. System Settings
          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },

  /* ==========================================================================
     FALLBACK ROUTE
     - Redirects unknown paths to Home (which will trigger Guard check).
     ========================================================================== */
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);