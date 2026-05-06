import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await API.post("/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      // Redirect based on role
      if (res.data.role === "admin") {
  navigate("/admin");
} else if (res.data.role === "teacher") {
  navigate("/teacher");
} else {
  navigate("/student");
}

    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }
        
        .login-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%);
          position: relative;
          overflow: hidden;
        }
        
        .login-container::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          top: -100px;
          right: -100px;
        }
        
        .login-container::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          bottom: -50px;
          left: -50px;
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          width: 100%;
          max-width: 420px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          z-index: 10;
          position: relative;
          overflow: hidden;
        }
        
        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #1976d2, #42a5f5, #90caf9);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .login-header h2 {
          color: #1976d2;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(90deg, #1976d2, #42a5f5);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .login-header p {
          color: #666;
          font-size: 15px;
          font-weight: 400;
        }
        
        .form-group {
          margin-bottom: 20px;
          position: relative;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #444;
          font-weight: 500;
          font-size: 14px;
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-icon {
          position: absolute;
          left: 15px;
          color: #1976d2;
          font-size: 18px;
        }
        
        .login-input {
          width: 100%;
          padding: 14px 14px 14px 45px;
          border-radius: 12px;
          border: 2px solid #e1e5e9;
          font-size: 15px;
          transition: all 0.3s ease;
          background-color: #f8fafc;
        }
        
        .login-input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
          background-color: white;
        }
        
        .options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          font-size: 14px;
        }
        
        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #555;
          cursor: pointer;
        }
        
        .remember-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .remember-checkbox.checked {
          background-color: #1976d2;
          border-color: #1976d2;
        }
        
        .remember-checkbox.checked::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .forgot-password {
          color: #1976d2;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .forgot-password:hover {
          color: #0d47a1;
          text-decoration: underline;
        }
        
        .login-button {
          width: 100%;
          background: linear-gradient(90deg, #1976d2, #42a5f5);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        
        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
        }
        
        .login-button:active {
          transform: translateY(0);
        }
        
        .login-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 4px solid #c62828;
        }
        
        .error-icon {
          font-size: 18px;
        }
        
        .divider {
          display: flex;
          align-items: center;
          margin: 25px 0;
          color: #888;
          font-size: 14px;
        }
        
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #ddd;
        }
        
        .divider span {
          padding: 0 15px;
        }
        
        .social-login {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .social-button {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          border: 2px solid #e1e5e9;
          background: white;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          color: #444;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .social-button:hover {
          border-color: #1976d2;
          background-color: #f5f9ff;
        }
        
        .login-footer {
          text-align: center;
          margin-top: 25px;
          color: #666;
          font-size: 15px;
        }
        
        .register-link {
          color: #1976d2;
          font-weight: 600;
          text-decoration: none;
          margin-left: 5px;
          transition: color 0.2s;
        }
        
        .register-link:hover {
          color: #0d47a1;
          text-decoration: underline;
        }
        
        @media (max-width: 480px) {
          .login-card {
            padding: 30px 25px;
            margin: 20px;
          }
          
          .options-row {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  className="login-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="login-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="options-row">
              <div 
                className="remember-me" 
                onClick={() => !isLoading && setRememberMe(!rememberMe)}
              >
                <div className={`remember-checkbox ${rememberMe ? 'checked' : ''}`}></div>
                <span>Remember me</span>
              </div>
              
              
            </div>
            
            <button 
              className="login-button" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Logging in...
                </>
              ) : (
                'Login to your account'
              )}
            </button>
          </form>
          
          <div className="divider">
            <span>Or continue with</span>
          </div>
          
          <div className="social-login">
            <button className="social-button" type="button" disabled={isLoading}>
              <span>🔵</span> Google
            </button>
            <button className="social-button" type="button" disabled={isLoading}>
              <span>🔷</span> Microsoft
            </button>
          </div>
          
          <div className="login-footer">
            Don't have an account? 
            <Link to="/register" className="register-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}