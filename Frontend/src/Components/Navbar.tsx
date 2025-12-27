import { useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { clearAuth } from "../utils/auth";
import "./Navbar.css";

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
    <nav className="navbar">
      <div className="nav-links">
        {/* <a 
          href="#" 
          onClick={() => navigate('/dashboard')}
          className={activePage === 'dashboard' ? 'active' : ''}
        >
          Dashboard
        </a> */}
        <a
          href="#"
          onClick={() => navigate("/admin-list")}
          className={activePage === "admin-list" ? "active" : ""}
        >
          Admin List
        </a>
        <a
          href="#"
          onClick={() => navigate("/add-login")}
          className={activePage === "add-login" ? "active" : ""}
        >
          Add login
        </a>
        <a
          href="#"
          onClick={() => navigate("/dashboard")}
          className={activePage === "report" ? "active" : ""}
        >
          Report
        </a>
      </div>
      <div className="nav-right">
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout />
        </button>
        <div className="user-avatar"></div>
      </div>
    </nav>
  );
};

export default Navbar;
