import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint
      // const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });

      // For now, simulate authentication
      // In production, validate credentials with backend
      if (email && password) {
        // Store authentication data in sessionStorage
        sessionStorage.setItem("super_admin_id", "1"); // Replace with actual ID from API
        sessionStorage.setItem("user_email", email);

        // Navigate to admin list after successful login
        navigate("/admin-list");
      } else {
        setError("Please enter valid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="welcome-content">
          <h1>Welcome Back!</h1>
          <p>Login to start work</p>
        </div>
        <div className="login-footer">
          <a href="#">Private policy</a>
          <a href="#">Terms of use</a>
          <span className="company">AR Technologies</span>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <h2>Login Page</h2>
          {error && (
            <div
              style={{
                color: "#f44336",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Login</label>
              <p className="subtitle">Sign in to your account to continue</p>

              <div className="input-group">
                <label htmlFor="email">User Name</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEye />
                    ) : (
                      <AiOutlineEyeInvisible />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
