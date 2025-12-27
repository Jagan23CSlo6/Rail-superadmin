import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { authAPI } from "../api/index";
import { setAuthToken, setUserData, getAuthToken, clearAuth } from "../utils/auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          // Verify token with backend
          await authAPI.verifyToken(token);
          // Token is valid, redirect to admin list
          navigate("/admin-list", { replace: true });
        } catch (err) {
          // Token is invalid, clear storage
          clearAuth();
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call login API
      const response = await authAPI.login(username, password);

      if (response.statusCode === 200) {
        // Store token with 24hr expiry
        if (response.token) {
          setAuthToken(response.token, 24);
        }
        
        // Store user data
        setUserData(username, response.name);

        // Navigate to admin list after successful login
        navigate("/admin-list");
      } else {
        setError(response.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Super Admin Text */}
      <div className="flex-1 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center p-12">
        <h1 className="text-gray-700 text-6xl font-bold uppercase tracking-wider">
          Super Admin
        </h1>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white flex items-center justify-center p-16">
        <div className="w-full max-w-md px-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">Login</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 mt-12">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-3">
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <AiOutlineEye className="text-xl" />
                  ) : (
                    <AiOutlineEyeInvisible className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
