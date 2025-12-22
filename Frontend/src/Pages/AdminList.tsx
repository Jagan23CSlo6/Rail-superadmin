import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import Navbar from "../Components/Navbar";
import "./AdminList.css";

interface Admin {
  id: number;
  name: string;
  loginId: string;
  phoneNo: string;
  since: string;
  nextPayment: string;
  paymentStatus: "Completed" | "Over Due" | "Pending";
}

const AdminList = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${apiBaseUrl}/api/admin/get-all-admins`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = await response.json();
        const items: Admin[] = Array.isArray(payload?.admins)
          ? payload.admins.map((admin: any) => {
              const normalizeStatus = String(
                admin?.payment_status ?? ""
              ).toLowerCase();
              const paymentStatus =
                normalizeStatus === "completed"
                  ? "Completed"
                  : normalizeStatus === "pending"
                  ? "Pending"
                  : "Over Due";

              const formatDate = (value: unknown) => {
                if (!value) return "N/A";
                const date = new Date(value);
                return Number.isNaN(date.getTime())
                  ? String(value)
                  : date.toLocaleDateString();
              };

              return {
                id: Number(admin?.admin_id) || 0,
                name: String(admin?.admin_name ?? "Unknown"),
                loginId: String(admin?.login_id ?? "N/A"),
                phoneNo: String(admin?.phone_number ?? "N/A"),
                since: formatDate(admin?.join_date),
                nextPayment: formatDate(admin?.next_payment_date),
                paymentStatus,
              };
            })
          : [];

        setAdmins(items);
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError("Unable to load admins.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [apiBaseUrl]);

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.loginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.phoneNo.includes(searchTerm)
  );

  // Function to check if a date is in the past
  const isPastDate = (dateString: string): boolean => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    } catch {
      return false;
    }
  };

  // Function to handle payment
  const handlePayment = async (adminId: number) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/${adminId}/payment`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Refresh the admin list after successful payment
      const updatedAdmins = admins.map((admin) =>
        admin.id === adminId
          ? { ...admin, paymentStatus: "Completed" as const }
          : admin
      );
      setAdmins(updatedAdmins);
      alert("Payment processed successfully!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="admin-list-container">
        <Navbar activePage="admin-list" />
        <div className="content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-list-container">
        <Navbar activePage="admin-list" />
        <div className="content">
          <div className="loading">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-list-container">
      <Navbar activePage="admin-list" />

      <div className="content">
        <div className="header">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="new-admin-btn"
            onClick={() => navigate("/add-login")}
          >
            + New Admin
          </button>
        </div>

        <div className="table-container">
          <p className="table-subtitle">Click to View and Edit Details</p>
          <table className="admin-table">
            <thead>
              <tr>
                <th>S.no</th>
                <th>
                  <FaUser className="header-icon" /> Name
                </th>
                <th>Login ID</th>
                <th>
                  <FaPhoneAlt className="header-icon" /> Phone No.
                </th>
                <th>
                  <FaCalendarAlt className="header-icon" /> Since
                </th>
                <th>
                  <FaClipboardList className="header-icon" /> Next Payment
                </th>
                <th>
                  <IoFlash className="header-icon" /> Payment Status
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No admins found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin, index) => (
                  <tr
                    key={admin.id}
                    onClick={() => navigate(`/admin-details/${admin.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{index + 1}</td>
                    <td>{admin.name}</td>
                    <td>{admin.loginId}</td>
                    <td>{admin.phoneNo}</td>
                    <td className={isPastDate(admin.since) ? "past-date" : ""}>
                      {admin.since}
                    </td>
                    <td
                      className={
                        isPastDate(admin.nextPayment) ? "past-date" : ""
                      }
                    >
                      {admin.nextPayment}
                    </td>
                    <td>
                      <span
                        className={`status-text ${
                          admin.paymentStatus === "Completed"
                            ? "status-completed"
                            : admin.paymentStatus === "Pending"
                            ? ""
                            : "status-overdue"
                        }`}
                      >
                        {admin.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayment(admin.id);
                        }}
                        disabled={admin.paymentStatus === "Completed"}
                      >
                        Paid
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminList;
