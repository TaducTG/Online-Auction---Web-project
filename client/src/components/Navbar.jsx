import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/auth/authSlice";
import {
  MdOutlineCreate,
  MdOutlineDashboard,
  MdMailOutline,
  MdAttachMoney,
  MdMenuOpen,
  MdOutlineAccountCircle,
  MdOutlineHome,
  MdOutlinePrivacyTip,
  MdAdminPanelSettings,
  MdNotifications,
  MdDarkMode,
  MdLightMode,
  MdAccountBalanceWallet,
} from "react-icons/md";
import {
  IoCloseSharp,
  IoDocumentTextOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { RiAuctionLine } from "react-icons/ri";
import { NotificationDropdown } from "./NotificationDropdown";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const { user } = useSelector((state) => state.auth);
  // Truy cập an toàn đối tượng người dùng lồng nhau
  const currentUser = user?.user || user;

  // Chế độ tối
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  // Đăng xuất
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Ngăn cuộn trang khi mở ngăn kéo
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <RiAuctionLine className="h-6 w-6 text-gray-700 " />
              <span className="text-xl font-bold text-gray-900 ">
                Online Auction
              </span>
            </Link>

            {/* Điều hướng trên máy tính */}
            <nav className="hidden md:flex items-center space-x-6">
              {(currentUser ? getNavLinks(currentUser.role) : navMenu).map(
                (item) => (
                  item.link ? (
                    <NavLink
                      to={item.link}
                      key={item.link}
                      className={({ isActive }) =>
                        isActive
                          ? "text-indigo-600 hover:text-indigo-800 font-medium"
                          : "text-gray-600 hover:text-gray-800 font-medium"
                      }
                    >
                      {item.name}
                    </NavLink>
                  ) : (
                    <span key={item.name} className="text-gray-600 font-medium flex items-center">
                      {item.icon}
                      {item.name}
                    </span>
                  )
                )
              )}

              {/* Bật tắt chế độ tối */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <MdLightMode className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MdDarkMode className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </nav>

            {/* Các biểu tượng bên phải - Thông báo và Menu */}
            <div className="flex items-center gap-2">
              {/* Thông báo - chỉ hiển thị khi người dùng đã đăng nhập */}
              {user && <NotificationDropdown />}

              {/* Nút menu di động */}
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                <MdMenuOpen className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Ngăn kéo menu di động */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-70" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-72 
          bg-gradient-to-b from-blue-100 via-blue-300 to-blue-600
          shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <RiAuctionLine className="h-6 w-6 text-gray-700 " />
            <span className="text-xl font-bold text-gray-900 ">
              Online Auction
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none pr-2"
            aria-label="Close menu"
          >
            <IoCloseSharp className="h-6 w-6" />
          </button>
        </div>

        {user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <MdOutlineAccountCircle className="h-10 w-10 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 ">{currentUser.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-4">
          <ul className="space-y-1">
            {(currentUser ? getNavLinks(currentUser.role) : navMenu).map(
              (item) => (
                <li key={item.link}>
                  <NavLink
                    to={item.link}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center py-2 text-indigo-600  hover:text-indigo-800 font-medium"
                        : "flex items-center py-2 text-gray-600  hover:text-gray-800 font-medium"
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                </li>
              )
            )}
          </ul>

          {user ? (
            <div className="mt-6 pt-6 border-t border-gray-200 ">
              <ul className="space-y-4">
                {protectedNavLink.slice(3, 7).map((item) => (
                  <li key={item.link}>
                    <NavLink
                      to={item.link}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center py-2 text-indigo-600  hover:text-indigo-800 font-medium"
                          : "flex items-center py-2 text-gray-600  hover:text-gray-800 font-medium"
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <button
                    className="flex items-center w-full py-2 text-gray-600  hover:text-gray-800 font-medium text-left cursor-pointer"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <IoLogOutOutline className="mr-3 h-5 w-5" />
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <Link
                to="/login"
                className="block w-full py-2 px-4 text-center 
                  text-white border border-white rounded-md 
                  hover:bg-white hover:text-indigo-800 
                  transition-colors"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/signup"
                className="block w-full py-2 px-4 text-center 
                  bg-indigo-800 text-white border border-white rounded-md 
                  hover:bg-indigo-700 transition-colors"
              >
                Đăng Ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};
export const LoginSignup = () => {
  return (
    <>
      <Link
        to="/login"
        className="px-4 py-2 text-gray-700  border border-gray-300 rounded-md hover:bg-gray-100 transition-colors hidden md:block"
      >
        Đăng Nhập
      </Link>
      <Link
        to="/signup"
        className="px-4 py-2 bg-indigo-800 text-white  rounded-md hover:bg-indigo-700 transition-colors hidden md:block"
      >
        Đăng Ký
      </Link>
    </>
  );
};

const navMenu = [
  {
    name: "Trang Chủ",
    link: "/",
    icon: <MdOutlineHome className="mr-3 h-5 w-5" />,
  },
  {
    name: "Về Chúng Tôi",
    icon: <MdOutlineAccountCircle className="mr-3 h-5 w-5" />,
  },
  {
    name: "Liên Hệ",
    icon: <MdMailOutline className="mr-3 h-5 w-5" />,
  },
  {
    name: "Pháp Lý",
    icon: <IoDocumentTextOutline className="mr-3 h-5 w-5" />,
  },
];

const protectedNavLink = [
  {
    name: "Trang Chủ",
    link: "/",
    icon: <MdOutlineDashboard className="mr-3 h-5 w-5" />,
  },
  {
    name: "Tạo Đấu Giá",
    link: "/create",
    icon: <MdOutlineCreate className="mr-3 h-5 w-5" />,
  },
  {
    name: "Xem Đấu Giá",
    link: "/auction",
    icon: <RiAuctionLine className="mr-3 h-5 w-5" />,
  },
  {
    name: "Phiên Của Tôi",
    link: "/myauction",
    icon: <MdAttachMoney className="mr-3 h-5 w-5" />,
  },
  {
    name: "Ví",
    link: "/wallet",
    icon: <MdAccountBalanceWallet className="mr-3 h-5 w-5" />,
  },
  {
    name: "Liên Hệ",
    link: "/contact",
    icon: <MdMailOutline className="mr-3 h-5 w-5" />,
  },
  {
    name: "Hồ Sơ",
    link: "/profile",
    icon: <MdOutlineAccountCircle className="mr-3 h-5 w-5" />,
  },
  {
    name: "Bảo Mật",
    link: "/privacy",
    icon: <MdOutlinePrivacyTip className="mr-3 h-5 w-5" />,
  },
];

const adminNavLink = [
  {
    name: "Bảng Quản Lý",
    link: "/admin",
    icon: <MdAdminPanelSettings className="mr-3 h-5 w-5" />,
  },
  {
    name: "Trang Chủ",
    link: "/",
    icon: <MdOutlineDashboard className="mr-3 h-5 w-5" />,
  },
  {
    name: "Quản Lý Đấu Giá",
    link: "/admin/auctions",
    icon: <RiAuctionLine className="mr-3 h-5 w-5" />,
  },
  {
    name: "Tạo Đấu Giá",
    link: "/create",
    icon: <MdOutlineCreate className="mr-3 h-5 w-5" />,
  },
  {
    name: "Xem Đấu Giá",
    link: "/auction",
    icon: <RiAuctionLine className="mr-3 h-5 w-5" />,
  },
];

// Helper function to get navigation links based on user role
const getNavLinks = (userRole) => {
  if (userRole === "admin") {
    return adminNavLink;
  }
  return protectedNavLink.slice(0, 5);
};
