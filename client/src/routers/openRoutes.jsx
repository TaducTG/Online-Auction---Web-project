import Error from "../Error";
import { OpenLayout } from "../layout/OpenLayout";
import { Landing } from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

export const openRoutes = [
  {
    path: "/", //đường dẫn gốc (root) — tương ứng với http://localhost:5173/
    element: <OpenLayout />, //Khi người dùng truy cập bất kỳ đường dẫn nào bắt đầu từ "/",React sẽ bọc toàn bộ nội dung bên trong layout chung này.
    errorElement: <Error />,
    children: [
      //Các route con
      {
        //Trang Landing - trang đầu tiên được load khi truy cập /
        index: true, //đây là route mặc định khi truy cập "/"
        element: <Landing />,
        errorElement: <Error />,
      },
      {
        //Trang đăng nhập / đăng ký
        path: "login",
        element: <Login />,
        errorElement: <Error />,
      },
      {
        // đăng ký
        path: "signup",
        element: <Signup />,
        errorElement: <Error />,
      },
    ],
  },
];
