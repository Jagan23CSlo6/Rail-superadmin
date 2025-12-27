import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaEnvelope,
} from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import { MdArrowBack } from "react-icons/md";
import Navbar from "../Components/Navbar";
import { adminAPI } from "../api/index";
import { markAdminsListAsChanged } from "../utils/auth";

interface Admin {
  id: string | number;
  name: string;
  email: string;
  phoneNo: string;
  duration: number;
  amount: number;
  paymentStatus: string;
}

const AdminDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      setLoading(true);
      setError("");
      
      if (!id) {
        setError("No admin ID provided");
        setLoading(false);
        return;
      }

      try {
        // Check sessionStorage cache first
        const cachedDetails = sessionStorage.getItem(`adminDetails_${id}`);
        const cacheTimestamp = sessionStorage.getItem(`adminDetailsTimestamp_${id}`);
        const currentTime = new Date().getTime();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes
        
        // Use cache if available and not expired
        if (cachedDetails && cacheTimestamp) {
          const timeDiff = currentTime - parseInt(cacheTimestamp);
          if (timeDiff < cacheExpiry) {
            console.log("Using cached admin details");
            const cachedData = JSON.parse(cachedDetails);
            setAdmin(cachedData);
            // Set initial isPaid state based on cached payment status
            const isPaidStatus = (cachedData.paymentStatus || "").toLowerCase() === "paid" || 
                                 (cachedData.paymentStatus || "").toLowerCase() === "completed";
            setIsPaid(isPaidStatus);
            setHasChanges(false);
            setLoading(false);
            return;
          }
        }

        // Fetch from API
        console.log("Fetching admin details from API for ID:", id);
        const response = await adminAPI.getAdminDetails(id);
        console.log("Admin details response:", response);

        if (response.statusCode === 200 && response.data) {
          const adminData = {
            id: response.data.id || id,
            name: response.data.name || "Unknown",
            email: response.data.email || "N/A",
            phoneNo: response.data.phoneNo || "N/A",
            duration: response.data.duration || 0,
            amount: response.data.amount || 0,
            paymentStatus: response.data.paymentStatus || "pending",
          };

          setAdmin(adminData);
          // Set initial isPaid state based on current payment status
          const isPaidStatus = (response.data.paymentStatus || "").toLowerCase() === "paid" || 
                               (response.data.paymentStatus || "").toLowerCase() === "completed";
          setIsPaid(isPaidStatus);
          setHasChanges(false);
          
          // Cache the data
          sessionStorage.setItem(`adminDetails_${id}`, JSON.stringify(adminData));
          sessionStorage.setItem(`adminDetailsTimestamp_${id}`, currentTime.toString());
        } else {
          throw new Error(response.message || "Failed to load admin details");
        }
      } catch (err: any) {
        console.error("Error fetching admin details:", err);
        setError(err.message || "Failed to load admin details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDetails();
  }, [id]);

  const handleMarkPaid = () => {
    setIsPaid(true);
    setHasChanges(true);
  };

  const handleMarkUnpaid = () => {
    setIsPaid(false);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!admin || !id) return;

    try {
      await adminAPI.updatePaymentStatus(id, isPaid);

      const updatedAdmin = {
        ...admin,
        paymentStatus: isPaid ? "paid" : "pending",
      };
      
      setAdmin(updatedAdmin);
      
      // Update cache
      sessionStorage.setItem(`adminDetails_${id}`, JSON.stringify(updatedAdmin));
      sessionStorage.setItem(`adminDetailsTimestamp_${id}`, new Date().getTime().toString());
      
      // Mark admin list as changed
      markAdminsListAsChanged();
      
      setHasChanges(false);
      
      alert(`Payment marked as ${isPaid ? "paid" : "unpaid"} successfully!`);
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment status. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!admin || !id) return;

    if (!window.confirm(`Are you sure you want to delete admin "${admin.name}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteAdmin(id);
      
      // Clear cache for this admin
      sessionStorage.removeItem(`adminDetails_${id}`);
      sessionStorage.removeItem(`adminDetailsTimestamp_${id}`);
      
      // Mark admin list as changed
      markAdminsListAsChanged();
      
      alert("Admin deleted successfully!");
      navigate("/admin-list");
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin. Please try again.");
    }
  };

  // Display values or placeholders
  const displayAdmin = admin || {
    id: 0,
    name: loading ? "Loading..." : "N/A",
    email: loading ? "Loading..." : "N/A",
    phoneNo: loading ? "Loading..." : "N/A",
    duration: 0,
    amount: 0,
    paymentStatus: "pending",
  };

  // Determine payment status display
  const getPaymentStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "completed") {
      return { text: "Paid", color: "bg-green-500 text-white" };
    } else {
      return { text: "Unpaid", color: "bg-yellow-500 text-white" };
    }
  };

  const paymentDisplay = getPaymentStatusDisplay(hasChanges ? (isPaid ? "paid" : "pending") : displayAdmin.paymentStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activePage="admin-list" />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 text-lg">Loading admin details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activePage="admin-list" />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate("/admin-list")}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="admin-list" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Details</h1>
            <p className="text-gray-600 mt-1">View and manage admin information</p>
          </div>
          <button
            onClick={() => navigate("/admin-list")}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
          >
            <MdArrowBack className="text-xl" />
            Back to List
          </button>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Admin Information</h2>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Name */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Admin Name</p>
                <p className="text-lg font-bold text-gray-900">{displayAdmin.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <FaEnvelope className="text-purple-600 text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Email Address</p>
                <p className="text-lg font-bold text-gray-900">{displayAdmin.email}</p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <FaPhoneAlt className="text-green-600 text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                <p className="text-lg font-bold text-gray-900">{displayAdmin.phoneNo}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
                <FaCalendarAlt className="text-yellow-600 text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Subscription Duration</p>
                <p className="text-lg font-bold text-gray-900">{displayAdmin.duration} {displayAdmin.duration === 1 ? 'month' : 'months'}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg">
                <FaClipboardList className="text-indigo-600 text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Amount</p>
                <p className="text-lg font-bold text-gray-900">₹{(displayAdmin.amount || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                <IoFlash className="text-orange-600 text-xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Payment Status</p>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide shadow-sm mt-2 ${paymentDisplay.color}`}
                >
                  {paymentDisplay.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Actions</h2>
          
          {/* Payment Status Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-3">Payment Status</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleMarkPaid}
                className={`flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-200 shadow-md border-2 ${
                  isPaid
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-700 ring-4 ring-green-200 shadow-lg transform scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isPaid && <span className="mr-1">✓</span>}
                Mark as Paid
              </button>

              <button
                onClick={handleMarkUnpaid}
                className={`flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-200 shadow-md border-2 ${
                  !isPaid
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-700 ring-4 ring-yellow-200 shadow-lg transform scale-105"
                    : "bg-white text-gray-700 border-gray-300 hover:border-yellow-500 hover:bg-yellow-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {!isPaid && <span className="mr-1">✓</span>}
                Mark as Unpaid
              </button>
            </div>
          </div>

          {/* Unsaved Changes Indicator */}
          {hasChanges && (
            <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-semibold text-amber-800">
                  Unsaved Changes! Click "Save Changes" to update the payment status.
                </p>
              </div>
            </div>
          )}

          {/* Save Changes Button - Always Visible */}
          <div className="mb-6">
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-bold text-base uppercase tracking-wide transition-all duration-200 shadow-lg ${
                hasChanges
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {hasChanges ? "Save Changes" : "No Changes to Save"}
            </button>
          </div>

          {/* Delete Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-bold text-sm uppercase tracking-wide hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetails;
