import { createBrowserRouter, Outlet } from "react-router-dom";
import { Home } from "./home";
import AdminPanel from "./admin";
import { Foot } from "./footer";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Outlet />
        <Foot />
      </div>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/draws",
        element: <>draws</>,
      },
      {
        path: "/admin",
        element: <AdminPanel />,
      },
      {
        path: "/admin/draws/:id",
        element: <>draws</>,
      },
    ],
  },
]);
