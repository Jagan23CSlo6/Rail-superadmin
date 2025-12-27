import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { adminAPI } from "../api/index";
import { markAdminsListAsChanged } from "../utils/auth";

const AddAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminName: "",
    phoneNumber: "",
    email: "",
    password: "",
    duration: "",
    amount: "",
    paymentStatus: "Pending",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Admin Name validation
    if (!formData.adminName.trim()) {
      errors.adminName = "Admin name is required";
    } else if (formData.adminName.trim().length < 3) {
      errors.adminName = "Admin name must be at least 3 characters";
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = "Phone number must be 10 digits";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.trim().length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    // Duration validation
    if (!formData.duration.trim()) {
      errors.duration = "Duration is required";
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      errors.duration = "Duration must be a positive number";
    }

    // Amount validation
    if (!formData.amount.trim()) {
      errors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = "Amount must be a positive number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form data
    if (!validateForm()) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.adminName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.phoneNumber.trim(),
        password: formData.password.trim(),
        paymentStatus: formData.paymentStatus,
        duration: parseInt(formData.duration),
        amount: parseFloat(formData.amount),
      };

      console.log("Submitting admin data:", payload);

      const response = await adminAPI.createAdmin(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        console.log("Admin created successfully:", response);
        
        // Mark admin list as changed to force refresh
        markAdminsListAsChanged();
        
        alert("Admin created successfully!");
        navigate("/admin-list");
      } else {
        throw new Error(response.message || "Failed to create admin");
      }
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
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="add-login" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">New Admin</h2>
          <p className="text-gray-600 mt-2">Fill the details to add a new admin</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 px-6 py-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="adminName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  placeholder="Enter admin name"
                  value={formData.adminName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition-all ${
                    validationErrors.adminName 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:border-gray-400"
                  }`}
                />
                {validationErrors.adminName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.adminName}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="10-digit mobile number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition-all ${
                    validationErrors.phoneNumber 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:border-gray-400"
                  }`}
                />
                {validationErrors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition-all ${
                    validationErrors.email 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:border-gray-400"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition-all ${
                    validationErrors.password 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:border-gray-400"
                  }`}
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (months) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  placeholder="Enter duration in months"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition-all ${
                    validationErrors.duration 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:border-gray-400"
                  }`}
                />
                {validationErrors.duration && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none transition-all ${
                    validationErrors.amount 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:border-gray-400"
                  }`}
                />
                {validationErrors.amount && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="paymentStatus" className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Over Due">Over Due</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Admin...
                  </span>
                ) : (
                  "Create Admin"
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
