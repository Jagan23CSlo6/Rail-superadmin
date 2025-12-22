import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
  FaPhoneAlt,
  FaCalendarAlt,
  FaClipboardList,
} from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import Navbar from "../Components/Navbar";
import "./AdminDetails.css";

interface PriceTier {
  hours: string;
  price: string;
}

interface BookingPricing {
  type: string;
  graceTime: string;
  priceTiers: PriceTier[];
}

interface Admin {
  id: number;
  name: string;
  loginId: string;
  phoneNo: string;
  since: string;
  nextPayment: string;
  paymentStatus: "Completed" | "Over Due" | "Pending";
  bookingTypes: string[];
  bookingPricing: BookingPricing[];
}

const AdminDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddBookingType, setShowAddBookingType] = useState(false);
  const [selectedNewType, setSelectedNewType] = useState<string>("");

  useEffect(() => {
    const fetchAdminDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${apiBaseUrl}/api/admin/get-admin/${id}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = await response.json();
        const adminData = payload?.admin;

        if (!adminData) {
          throw new Error("Admin not found");
        }

        const normalizeStatus = String(
          adminData?.payment_status ?? ""
        ).toLowerCase();
        const paymentStatus =
          normalizeStatus === "completed"
            ? "Completed"
            : normalizeStatus === "pending"
            ? "Pending"
            : "Over Due";

        const formatDate = (value: unknown) => {
          if (!value) return "N/A";
          const date = new Date(value as string | number | Date);
          return Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleDateString();
        };

        // Parse booking types from comma-separated string
        const bookingTypesStr = String(adminData?.booking_type ?? "");
        const bookingTypes = bookingTypesStr
          ? bookingTypesStr
              .split(",")
              .map((type) => type.trim())
              .filter(Boolean)
          : [];

        // Parse booking pricing from JSON string
        let bookingPricing: BookingPricing[] = [];
        try {
          const pricingStr = adminData?.booking_pricing;
          if (pricingStr) {
            bookingPricing = JSON.parse(pricingStr);
          }
        } catch (err) {
          console.error("Error parsing booking pricing:", err);
        }

        setAdmin({
          id: Number(adminData?.admin_id) || 0,
          name: String(adminData?.admin_name ?? "Unknown"),
          loginId: String(adminData?.login_id ?? "N/A"),
          phoneNo: String(adminData?.phone_number ?? "N/A"),
          since: formatDate(adminData?.join_date),
          nextPayment: formatDate(adminData?.next_payment_date),
          paymentStatus,
          bookingTypes,
          bookingPricing,
        });
      } catch (err) {
        console.error("Error fetching admin details:", err);
        setError("Failed to load admin details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdminDetails();
    } else {
      setError("No admin ID provided");
      setLoading(false);
    }
  }, [apiBaseUrl, id]);

  const handleToggleBookingType = async (bookingType: string) => {
    if (!admin) return;

    const isCurrentlyActive = admin.bookingTypes.includes(bookingType);
    let updatedTypes: string[];
    let updatedPricing: BookingPricing[];

    if (isCurrentlyActive) {
      // Disable/Remove booking type
      updatedTypes = admin.bookingTypes.filter((t) => t !== bookingType);
      updatedPricing = admin.bookingPricing.filter(
        (p) => p.type !== bookingType
      );
    } else {
      // Enable/Add booking type
      updatedTypes = [...admin.bookingTypes, bookingType];
      updatedPricing = [
        ...admin.bookingPricing,
        {
          type: bookingType,
          graceTime: "0",
          priceTiers: [{ hours: "", price: "0" }],
        },
      ];
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/update-admin/${admin.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_type: updatedTypes.join(","),
            booking_pricing: JSON.stringify(updatedPricing),
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setAdmin({
        ...admin,
        bookingTypes: updatedTypes,
        bookingPricing: updatedPricing,
      });
      alert(
        `Booking type ${
          isCurrentlyActive ? "disabled" : "enabled"
        } successfully!`
      );
    } catch (error) {
      console.error("Error updating booking type:", error);
      alert("Failed to update booking type. Please try again.");
    }
  };

  const handleAddBookingType = async () => {
    if (!admin || !selectedNewType) return;

    if (admin.bookingTypes.includes(selectedNewType)) {
      alert("This booking type is already added!");
      return;
    }

    const updatedTypes = [...admin.bookingTypes, selectedNewType];
    const updatedPricing = [
      ...admin.bookingPricing,
      {
        type: selectedNewType,
        graceTime: "0",
        priceTiers: [{ hours: "", price: "0" }],
      },
    ];

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/update-admin/${admin.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_type: updatedTypes.join(","),
            booking_pricing: JSON.stringify(updatedPricing),
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setAdmin({
        ...admin,
        bookingTypes: updatedTypes,
        bookingPricing: updatedPricing,
      });
      setShowAddBookingType(false);
      setSelectedNewType("");
      alert("Booking type added successfully!");
    } catch (error) {
      console.error("Error adding booking type:", error);
      alert("Failed to add booking type. Please try again.");
    }
  };

  const handlePayment = async () => {
    if (!admin) return;

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/update-admin/${admin.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_status: "Completed",
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setAdmin({ ...admin, paymentStatus: "Completed" });
      alert("Payment processed successfully!");
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Failed to process payment. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!admin) return;

    if (
      !window.confirm(`Are you sure you want to delete admin "${admin.name}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/delete-admin/${admin.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

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
    loginId: loading ? "Loading..." : "N/A",
    phoneNo: loading ? "Loading..." : "N/A",
    since: loading ? "Loading..." : "N/A",
    nextPayment: loading ? "Loading..." : "N/A",
    paymentStatus: "Pending" as const,
    bookingTypes: [],
    bookingPricing: [],
  };

  return (
    <div>
      <div className="admin-details-container">
        <Navbar activePage="admin-list" />

        <div className="content">
          {loading && (
            <div className="warning-message">⏳ Loading admin details...</div>
          )}
          {error && !loading && (
            <div className="warning-message">⚠️ {error}</div>
          )}
          <div className="header">
            <h1>Admin Details</h1>
            <button
              className="back-btn"
              onClick={() => navigate("/admin-list")}
            >
              ← Back to List
            </button>
          </div>

          <div className="details-card">
            <div className="detail-row">
              <div className="detail-label">
                <FaUser className="detail-icon" />
                <span>Name</span>
              </div>
              <div className="detail-value">{displayAdmin.name}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <span>Login ID</span>
              </div>
              <div className="detail-value">{displayAdmin.loginId}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <FaPhoneAlt className="detail-icon" />
                <span>Phone Number</span>
              </div>
              <div className="detail-value">{displayAdmin.phoneNo}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <FaCalendarAlt className="detail-icon" />
                <span>Member Since</span>
              </div>
              <div className="detail-value">{displayAdmin.since}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <FaClipboardList className="detail-icon" />
                <span>Next Payment Date</span>
              </div>
              <div className="detail-value">{displayAdmin.nextPayment}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">
                <IoFlash className="detail-icon" />
                <span>Payment Status</span>
              </div>
              <div className="detail-value">
                <span
                  className={`status-badge ${
                    displayAdmin.paymentStatus === "Completed"
                      ? "status-completed"
                      : displayAdmin.paymentStatus === "Pending"
                      ? "status-pending"
                      : "status-overdue"
                  }`}
                >
                  {displayAdmin.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {displayAdmin.bookingTypes.length > 0 && (
            <div className="booking-type-section">
              <h2>
                <span className="section-icon">🚌</span> Seating Types & Pricing
              </h2>
              <p className="booking-subtitle">
                Manage seating categories and their pricing (
                {displayAdmin.bookingTypes.length}{" "}
                {displayAdmin.bookingTypes.length === 1 ? "type" : "types"})
              </p>
              <div className="booking-types-grid">
                {displayAdmin.bookingTypes.map((bookingType) => {
                  const typeInfo: Record<
                    string,
                    { icon: string; color: string; title: string }
                  > = {
                    sitting: { icon: "🔵", color: "#5d8ed9", title: "Sitting" },
                    sleeping: {
                      icon: "🟠",
                      color: "#ff8c42",
                      title: "Sleeper",
                    },
                    luggage: { icon: "🟣", color: "#9b59b6", title: "Luggage" },
                  };
                  const info = typeInfo[bookingType];
                  if (!info) return null;

                  const pricing = displayAdmin.bookingPricing.find(
                    (p) => p.type === bookingType
                  );
                  if (!pricing) return null;

                  return (
                    <div key={bookingType} className="booking-type-card">
                      <div className="card-header">
                        <div className="card-title-wrapper">
                          <span className="type-icon">{info.icon}</span>
                          <span className="type-title">{info.title}</span>
                        </div>
                        <button
                          className="toggle-btn"
                          onClick={() => handleToggleBookingType(bookingType)}
                          disabled={!admin || loading}
                        >
                          Disable
                        </button>
                      </div>

                      <div className="card-body">
                        {/* Grace Time Display */}
                        <div className="field-section">
                          <label className="field-label">
                            <span className="clock-icon">⏱</span> Grace Time
                            (minutes)
                          </label>
                          <div className="display-field-container">
                            <span className="field-value">
                              {pricing.graceTime}
                            </span>
                          </div>
                        </div>

                        {/* Price Tiers Display */}
                        <div className="field-section price-tiers-section">
                          <label className="field-label">
                            Price for Hours (₹)
                          </label>
                          <div className="price-tiers-grid">
                            {pricing.priceTiers.map((tier, index) => (
                              <div key={index} className="price-tier-row">
                                {tier.hours && (
                                  <div className="tier-hours">{tier.hours}</div>
                                )}
                                <div className="tier-price-wrapper">
                                  <div className="display-field-container inline">
                                    <div className="tier-price-display">
                                      <span className="rupee-symbol">₹</span>
                                      <span className="field-value">
                                        {tier.price}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Booking Type Section */}
              <div style={{ marginTop: "25px" }}>
                {!showAddBookingType ? (
                  <button
                    className="pay-btn"
                    onClick={() => setShowAddBookingType(true)}
                    disabled={!admin || loading}
                    style={{ width: "auto", padding: "12px 24px" }}
                  >
                    + Add Booking Type
                  </button>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                    }}
                  >
                    <select
                      value={selectedNewType}
                      onChange={(e) => setSelectedNewType(e.target.value)}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                        fontSize: "0.95rem",
                        minWidth: "150px",
                      }}
                    >
                      <option value="">Select Type</option>
                      {!admin?.bookingTypes.includes("sitting") && (
                        <option value="sitting">Sitting</option>
                      )}
                      {!admin?.bookingTypes.includes("sleeping") && (
                        <option value="sleeping">Sleeping</option>
                      )}
                      {!admin?.bookingTypes.includes("luggage") && (
                        <option value="luggage">Luggage</option>
                      )}
                    </select>
                    <button
                      className="pay-btn"
                      onClick={handleAddBookingType}
                      disabled={!selectedNewType}
                      style={{ width: "auto", padding: "12px 24px" }}
                    >
                      Add
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setShowAddBookingType(false);
                        setSelectedNewType("");
                      }}
                      style={{ width: "auto", padding: "12px 24px" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="actions">
            <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={
                !admin || loading || displayAdmin.paymentStatus === "Completed"
              }
            >
              Mark as Paid
            </button>
            <button
              className="delete-btn"
              onClick={handleDelete}
              disabled={!admin || loading}
            >
              Delete Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDetails;
