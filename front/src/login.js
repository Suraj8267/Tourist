// Login.js (updated)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import loginLogo from "./Logo_login.png";
import log from "./log.png";

function Login() {
  const [authorityId, setAuthorityId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authorityId || !password) {
      setError("⚠ Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorityId: authorityId,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store the token in localStorage
      localStorage.setItem("authToken", data.access_token);
      localStorage.setItem("authorityId", authorityId);
      
      // Redirect to dashboard based on the response
      if (data.redirect) {
        navigate(data.redirect);
      } else {
        navigate("/dashboard");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Header with Emblem */}
      <header className="gov-header">
        <img
          src={log}
          alt="Government Emblem"
          className="gov-emblem"
          style={{ width: "90px" }}
        />

        <div>
          <h1 className="portal-title">Ministry of Tourism</h1>
          <p className="portal-subtitle">Government of India</p>
        </div>
      </header>

      {/* Login Card */}
      <div className="login-card">
        <img
          src={loginLogo} 
          alt="Tourism Portal Logo"
          className="gov-emblem"
          style={{ width: "100px" }}
        />
        <h2 className="login-title">Authority Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="authorityId">Authority ID</label>
            <input
              type="text"
              id="authorityId"
              placeholder="Enter Authority ID"
              value={authorityId}
              onChange={(e) => setAuthorityId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-links">
          <p>
            <a href="/reset">🔑 Forgot your password?</a>
          </p>
          <p>
            <a href="/res">🆕 Create New Account</a>
          </p>
        </div>

        
      </div>

      {/* Footer */}
      <footer className="gov-footer">
        <p>© 2025 Ministry of Tourism | Government of India</p>
      </footer>
    </div>
  );
}

export default Login;