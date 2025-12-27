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
import { adminAPI } from "../api/index";

interface Admin {
  id: string | number;
  name: string;
  loginId: string;
  phoneNo: string;
  since: string;
  nextPayment: string;
  paymentStatus: "Paid" | "Unpaid";
}

const AdminList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for visibility changes to refresh data when coming back to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Check if data was modified while away
        const dataModified = sessionStorage.getItem("adminsListChanged") === "true";
        if (dataModified) {
          console.log("Page became visible and data was modified - triggering refresh");
          setRefreshTrigger(prev => prev + 1);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Check if data was modified (flag set by other operations)
        const dataModified = sessionStorage.getItem("adminsListChanged") === "true";
        
        // Check if data exists in sessionStorage
        const cachedData = sessionStorage.getItem("adminsList");
        const cacheTimestamp = sessionStorage.getItem("adminsListTimestamp");
        const currentTime = new Date().getTime();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
        
        // Validate cached data has correct format
        let isValidCache = false;
        if (cachedData && cacheTimestamp && !dataModified) {
          try {
            const items: Admin[] = JSON.parse(cachedData);
            // Check if all items have Paid/Unpaid status (not old COMPLETED/PENDING format)
            isValidCache = items.every(item => 
              item.paymentStatus === "Paid" || item.paymentStatus === "Unpaid"
            );
          } catch {
            isValidCache = false;
          }
        }
        
        // Use cached data if it exists, hasn't expired, data wasn't modified, and is valid
        if (cachedData && cacheTimestamp && !dataModified && isValidCache) {
          const timeDiff = currentTime - parseInt(cacheTimestamp);
          if (timeDiff < cacheExpiry) {
            console.log("Using cached admin data");
            const items: Admin[] = JSON.parse(cachedData);
            setAdmins(items);
            setLoading(false);
            return;
          }
        }
        
        // Fetch from API if no cache, cache expired, or data was modified
        if (dataModified) {
          console.log("Data modified - fetching fresh data from API");
          // Clear the modified flag
          sessionStorage.removeItem("adminsListChanged");
        } else {
          console.log("Fetching fresh admin data from API");
        }
        
        const response = await adminAPI.getAdminsList();
        console.log("Admins response:", response);
        
        // Check if statusCode is 200 and data exists
        if (response?.statusCode === 200 && Array.isArray(response?.data)) {
          const items: Admin[] = response.data.map((admin: any) => {
            const normalizeStatus = String(
              admin?.paymentStatus ?? ""
            ).toLowerCase();
            // Handle both boolean strings (true/false) and status strings (paid/completed/unpaid)
            const paymentStatus =
              normalizeStatus === "true" || normalizeStatus === "paid" || normalizeStatus === "completed"
                ? "Paid"
                : "Unpaid";

            return {
              id: admin?.id || 0,
              name: String(admin?.name ?? "Unknown"),
              loginId: String(admin?.loginId ?? "N/A"),
              phoneNo: String(admin?.phoneNo ?? "N/A"),
              since: admin?.since || "N/A",
              nextPayment: admin?.nextPayment || "N/A",
              paymentStatus,
            };
          });

          setAdmins(items);
          
          // Store in sessionStorage with timestamp
          sessionStorage.setItem("adminsList", JSON.stringify(items));
          sessionStorage.setItem("adminsListTimestamp", currentTime.toString());
        } else {
          // No admins found or invalid response
          setAdmins([]);
        }
      } catch (err) {
        console.error("Error fetching admins:", err);
        setError("Unable to load admins.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [refreshTrigger]);

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
  const handlePayment = async (adminId: string | number) => {
    try {
      await adminAPI.updatePaymentStatus(adminId.toString(), true);

      // Refresh the admin list after successful payment
      const updatedAdmins = admins.map((admin) =>
        admin.id === adminId
          ? { ...admin, paymentStatus: "Paid" as const }
          : admin
      );
      setAdmins(updatedAdmins);
      
      // Update sessionStorage with new data and set modified flag
      sessionStorage.setItem("adminsList", JSON.stringify(updatedAdmins));
      sessionStorage.setItem("adminsListTimestamp", new Date().getTime().toString());
      sessionStorage.setItem("adminsListChanged", "true");
      
      alert("Payment processed successfully!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  // Function to handle admin deletion
  const handleDelete = async (adminId: string | number) => {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }
    
    try {
      await adminAPI.deleteAdmin(adminId.toString());
      
      // Remove admin from list
      const updatedAdmins = admins.filter((admin) => admin.id !== adminId);
      setAdmins(updatedAdmins);
      
      // Update sessionStorage and set modified flag
      sessionStorage.setItem("adminsList", JSON.stringify(updatedAdmins));
      sessionStorage.setItem("adminsListTimestamp", new Date().getTime().toString());
      sessionStorage.setItem("adminsListChanged", "true");
      
      alert("Admin deleted successfully!");
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin. Please try again.");
    }
  };

  // Function to handle row click and fetch admin details
  const handleRowClick = async (adminId: string | number) => {
    try {
      console.log("Fetching details for admin ID:", adminId);
      
      // Check if admin list was modified - if so, ignore details cache
      const dataModified = sessionStorage.getItem("adminsListChanged") === "true";
      
      // Check if details are cached
      const cachedDetails = sessionStorage.getItem(`adminDetails_${adminId}`);
      const cacheTimestamp = sessionStorage.getItem(`adminDetailsTimestamp_${adminId}`);
      const currentTime = new Date().getTime();
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes
      
      // Use cache only if available, not expired, AND admin list wasn't modified
      if (cachedDetails && cacheTimestamp && !dataModified) {
        const timeDiff = currentTime - parseInt(cacheTimestamp);
        if (timeDiff < cacheExpiry) {
          console.log("Using cached admin details:", JSON.parse(cachedDetails));
          navigate(`/admin-details/${adminId}`);
          return;
        }
      }
      
      // Fetch fresh data from API (if cache expired or list was modified)
      if (dataModified) {
        console.log("Admin list was modified - clearing details cache and fetching fresh data");
      } else {
        console.log("Fetching fresh admin details from API...");
      }
      const response = await adminAPI.getAdminDetails(adminId.toString());
      console.log("Admin details response:", response);
      
      // Store in sessionStorage
      if (response.statusCode === 200 && response.data) {
        sessionStorage.setItem(`adminDetails_${adminId}`, JSON.stringify(response.data));
        sessionStorage.setItem(`adminDetailsTimestamp_${adminId}`, currentTime.toString());
        console.log("Admin details cached successfully");
      }
      
      // Navigate to details page
      navigate(`/admin-details/${adminId}`);
    } catch (error) {
      console.error("Error fetching admin details:", error);
      alert("Failed to load admin details. Please try again.");
    }
  };

  // Function to manually refresh data
  const refreshData = async () => {
    // Clear cache and set modified flag to force refresh
    sessionStorage.removeItem("adminsList");
    sessionStorage.removeItem("adminsListTimestamp");
    sessionStorage.setItem("adminsListChanged", "true");
    
    setLoading(true);
    setError("");
    try {
      const response = await adminAPI.getAdminsList();
      
      if (response?.statusCode === 200 && Array.isArray(response?.data)) {
        const items: Admin[] = response.data.map((admin: any) => {
          const normalizeStatus = String(
            admin?.paymentStatus ?? ""
          ).toLowerCase();
          // Handle both boolean strings (true/false) and status strings (paid/completed/unpaid)
          const paymentStatus =
            normalizeStatus === "true" || normalizeStatus === "paid" || normalizeStatus === "completed"
              ? "Paid"
              : "Unpaid";

          return {
            id: admin?.id || 0,
            name: String(admin?.name ?? "Unknown"),
            loginId: String(admin?.loginId ?? "N/A"),
            phoneNo: String(admin?.phoneNo ?? "N/A"),
            since: admin?.since || "N/A",
            nextPayment: admin?.nextPayment || "N/A",
            paymentStatus,
          };
        });

        setAdmins(items);
        sessionStorage.setItem("adminsList", JSON.stringify(items));
        sessionStorage.setItem("adminsListTimestamp", new Date().getTime().toString());
        sessionStorage.removeItem("adminsListChanged");
      } else {
        setAdmins([]);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError("Unable to load admins.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activePage="admin-list" />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-gray-600 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activePage="admin-list" />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-red-600 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="admin-list" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search by name, login ID, or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 transition-all duration-200 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => navigate("/add-login")}
              className="flex items-center gap-2 bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 transition-all duration-200 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Admin
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              Click on any row to view and edit admin details
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-700 to-gray-600 text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-gray-500">
                    S.No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-gray-500">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-200" /> Name
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-gray-500">
                    Login ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-gray-500">
                    <div className="flex items-center gap-2">
                      <FaPhoneAlt className="text-gray-200" /> Phone No.
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-gray-500">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-200" /> Since
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-gray-500">
                    <div className="flex items-center gap-2">
                      <FaClipboardList className="text-gray-200" /> Next Payment
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <IoFlash className="text-yellow-300" /> Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No admins found</p>
                        <p className="text-sm mt-1">Try adjusting your search or add a new admin</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      onClick={() => handleRowClick(admin.id)}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                    >
                      <td className="px-6 py-5 text-sm font-semibold text-gray-700 border-r border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-900 border-r border-gray-200 group-hover:text-blue-600 transition-colors">
                        {admin.name}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700 border-r border-gray-200 font-medium">
                        {admin.loginId}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700 border-r border-gray-200 font-medium">
                        {admin.phoneNo}
                      </td>
                      <td className={`px-6 py-5 text-sm border-r border-gray-200 font-medium ${isPastDate(admin.since) ? "text-red-600 font-bold" : "text-gray-700"}`}>
                        {admin.since}
                      </td>
                      <td className={`px-6 py-5 text-sm border-r border-gray-200 font-medium ${isPastDate(admin.nextPayment) ? "text-red-600 font-bold" : "text-gray-700"}`}>
                        {admin.nextPayment}
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                            admin.paymentStatus === "Paid"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {admin.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminList;
