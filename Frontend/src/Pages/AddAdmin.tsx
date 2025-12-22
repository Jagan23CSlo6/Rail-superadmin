import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import "./AddAdmin.css";

const AddAdmin = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";
  const [formData, setFormData] = useState({
    adminName: "",
    phoneNumber: "",
    location: "",
    date: "",
    loginId: "",
    password: "",
    duration: "",
    amount: "",
    bookingType: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingTypeChange = (value: string) => {
    setFormData((prev) => {
      const currentTypes = prev.bookingType;
      if (currentTypes.includes(value)) {
        return {
          ...prev,
          bookingType: currentTypes.filter((type) => type !== value),
        };
      } else {
        return {
          ...prev,
          bookingType: [...currentTypes, value],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate booking type selection
    if (formData.bookingType.length === 0) {
      setError("Please select at least one booking type");
      alert("Please select at least one booking type");
      return;
    }

    setLoading(true);

    try {
      // Get super_admin_id from sessionStorage
      const superAdminId = sessionStorage.getItem("super_admin_id") || "1";

      // Initialize booking pricing with default values for selected types
      const bookingPricing = formData.bookingType.map((type) => ({
        type,
        graceTime: "0",
        priceTiers: [{ hours: "", price: "0" }],
      }));

      const payload = {
        super_admin_id: parseInt(superAdminId),
        admin_name: formData.adminName,
        phone_number: formData.phoneNumber,
        location: formData.location,
        join_date: formData.date,
        login_id: formData.loginId,
        password: formData.password,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        booking_type: formData.bookingType.join(","),
        booking_pricing: JSON.stringify(bookingPricing),
      };

      const response = await fetch(`${apiBaseUrl}/api/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create admin");
      }

      console.log("Admin created successfully:", result);
      alert("Admin created successfully!");
      navigate("/admin-list");
    } catch (err: any) {
      console.error("Error creating admin:", err);
      setError(err.message || "Failed to create admin. Please try again.");
      alert(err.message || "Failed to create admin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin-list");
  };

  return (
    <div className="add-admin-container">
      <Navbar activePage="add-login" />

      <div className="content">
        <div className="form-header">
          <h2>New Admin</h2>
          <p>Fill the details to add the Admin</p>
        </div>

        <div className="form-card">
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="adminName">Admin Name</label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  placeholder="Name"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Mobile number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Location of Station"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  placeholder="Enter Date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="loginId">Login Id</label>
                <input
                  type="text"
                  id="loginId"
                  name="loginId"
                  placeholder="Login Id"
                  value={formData.loginId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="text"
                  id="password"
                  name="password"
                  placeholder="00"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  placeholder="Duration in month"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  placeholder="Enter Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div
                className="form-group booking-type-group"
                style={{ gridColumn: "1 / -1" }}
              >
                <label>Booking Type</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.bookingType.includes("sitting")}
                      onChange={() => handleBookingTypeChange("sitting")}
                    />
                    <span>Sitting</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.bookingType.includes("sleeping")}
                      onChange={() => handleBookingTypeChange("sleeping")}
                    />
                    <span>Sleeping</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.bookingType.includes("luggage")}
                      onChange={() => handleBookingTypeChange("luggage")}
                    />
                    <span>Luggage</span>
                  </label>
                </div>
                {formData.bookingType.length > 0 && (
                  <p className="selected-types">
                    Selected: {formData.bookingType.join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
