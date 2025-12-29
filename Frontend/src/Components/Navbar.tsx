import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { clearAuth } from "../utils/auth";

interface NavbarProps {
  activePage?: "dashboard" | "admin-list" | "add-login" | "report";
}

const Navbar = ({ activePage }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage (removes token, tokenExpiry, username, name)
    clearAuth();
    // Navigate to login page
    navigate("/", { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900 px-10 py-3 flex justify-between items-center text-white z-50 shadow-lg">
      <div className="flex gap-2">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate("/admin-list"); }}
          className={`px-5 py-2.5 rounded-md text-sm transition-all ${
            activePage === "admin-list"
              ? "text-white bg-gray-700"
              : "text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Admin List
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate("/add-login"); }}
          className={`px-5 py-2.5 rounded-md text-sm transition-all ${
            activePage === "add-login"
              ? "text-white bg-gray-700"
              : "text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Add login
        </a>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}
          className={`px-5 py-2.5 rounded-md text-sm transition-all ${
            activePage === "report"
              ? "text-white bg-gray-700"
              : "text-gray-300 hover:text-white hover:bg-gray-800"
          }`}
        >
          Report
        </a>
      </div>
      <div className="flex items-center gap-5">
        <button
          className="text-white text-2xl hover:text-gray-300 transition-colors cursor-pointer bg-transparent border-none"
          onClick={handleLogout}
        >
          <MdLogout />
        </button>
        <div className="w-9 h-9 rounded-full bg-white"></div>
      </div>
    </nav>
  );
};

export default Navbar;
