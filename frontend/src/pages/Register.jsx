import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    courseBatch: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
    
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Please enter your full name";
    }
    
    if (!form.email.trim()) {
      return "Please enter your email address";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address";
    }
    
    if (!form.password) {
      return "Please enter a password";
    }
    
    if (form.password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

 if (form.role === "student" && !form.courseBatch) {
 return "Please select your Course / Batch";
 }


    
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Remove confirmPassword from the data sent to API
     const { confirmPassword, courseBatch, ...rest } = form;

const registerData = {
  ...rest,
  course_batch: courseBatch   // ✅ FIX: map correctly
};

console.log("REGISTER DATA 👉", registerData); // optional debug

await API.post("/register", registerData);

      
      setSuccess("Registration successful! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
      console.error("Registration error:", err);
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
        
        .register-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%);
          position: relative;
          overflow: hidden;
        }
        
        .register-container::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          top: -100px;
          right: -100px;
        }
        
        .register-container::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          bottom: -50px;
          left: -50px;
        }
        
        .register-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          width: 100%;
          max-width: 450px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          z-index: 10;
          position: relative;
          overflow: hidden;
        }
        
        .register-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #4CAF50, #66BB6A, #81C784);
        }
        
        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .register-header h2 {
          color: #4CAF50;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          background: linear-gradient(90deg, #4CAF50, #66BB6A);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .register-header p {
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
        
        .required::after {
          content: ' *';
          color: #f44336;
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .input-icon {
          position: absolute;
          left: 15px;
          color: #4CAF50;
          font-size: 18px;
        }
        
        .register-input {
          width: 100%;
          padding: 14px 14px 14px 45px;
          border-radius: 12px;
          border: 2px solid #e1e5e9;
          font-size: 15px;
          transition: all 0.3s ease;
          background-color: #f8fafc;
        }
        
        .register-input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
          background-color: white;
        }
        
        .select-wrapper {
          position: relative;
        }
        
        .role-select {
          width: 100%;
          padding: 14px 14px 14px 45px;
          border-radius: 12px;
          border: 2px solid #e1e5e9;
          font-size: 15px;
          transition: all 0.3s ease;
          background-color: #f8fafc;
          appearance: none;
          cursor: pointer;
        }
        
        .role-select:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
          background-color: white;
        }
        
        .select-arrow {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }
        
        .password-strength {
          margin-top: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .strength-meter {
          height: 4px;
          flex-grow: 1;
          background-color: #eee;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .strength-fill {
          height: 100%;
          width: 0%;
          transition: width 0.3s ease;
        }
        
        .strength-fill.weak {
          width: 33%;
          background-color: #f44336;
        }
        
        .strength-fill.medium {
          width: 66%;
          background-color: #ff9800;
        }
        
        .strength-fill.strong {
          width: 100%;
          background-color: #4CAF50;
        }
        
        .register-button {
          width: 100%;
          background: linear-gradient(90deg, #4CAF50, #66BB6A);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }
        
        .register-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
        }
        
        .register-button:active {
          transform: translateY(0);
        }
        
        .register-button:disabled {
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
        
        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 12px 15px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-left: 4px solid #4CAF50;
        }
        
        .message-icon {
          font-size: 18px;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .login-footer {
          text-align: center;
          margin-top: 25px;
          color: #666;
          font-size: 15px;
        }
        
        .login-link {
          color: #1976d2;
          font-weight: 600;
          text-decoration: none;
          margin-left: 5px;
          transition: color 0.2s;
        }
        
        .login-link:hover {
          color: #0d47a1;
          text-decoration: underline;
        }
        
        .terms-agreement {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 20px 0;
          font-size: 14px;
          color: #555;
        }
        
        .terms-checkbox {
          min-width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .terms-checkbox.checked {
          background-color: #4CAF50;
          border-color: #4CAF50;
        }
        
        .terms-checkbox.checked::after {
          content: '✓';
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .terms-link {
          color: #1976d2;
          text-decoration: none;
        }
        
        .terms-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 480px) {
          .register-card {
            padding: 30px 25px;
            margin: 20px;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>

      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Join our platform and get started</p>
          </div>
          
          {error && (
            <div className="error-message">
              <span className="message-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <span className="message-icon">✅</span>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  className="register-input"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label required">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  className="register-input"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label required">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="register-input"
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {form.password && (
                <div className="password-strength">
                  <span>Strength:</span>
                  <div className="strength-meter">
                    <div className={`strength-fill ${
                      form.password.length < 6 ? 'weak' : 
                      form.password.length < 10 ? 'medium' : 'strong'
                    }`}></div>
                  </div>
                  <span>
                    {form.password.length < 6 ? 'Weak' : 
                     form.password.length < 10 ? 'Medium' : 'Strong'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label required">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="register-input"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="password-strength" style={{color: '#f44336'}}>
                  Passwords do not match
                </div>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <div className="password-strength" style={{color: '#4CAF50'}}>
                  ✓ Passwords match
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label required">Account Type</label>
              <div className="select-wrapper">
                <span className="input-icon">🎓</span>
                <select
                  className="role-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>
              <div style={{fontSize: '13px', color: '#666', marginTop: '5px'}}>
                {form.role === 'student' 
                  ? 'Students can enroll in courses and submit assignments' 
                  : 'Teachers can create courses, assignments, and manage students'}
              </div>
            </div>

{form.role === "student" && (
  <div className="form-group">
    <label className="form-label required">Course / Batch</label>
    <div className="select-wrapper">
      <span className="input-icon">📚</span>
      <select
        className="role-select"
        name="courseBatch"
        value={form.courseBatch}
        onChange={handleChange}
        disabled={isLoading}
      >
        <option value="">Select Course / Batch</option>
        <option value="MCA Batch 2026">MCA Batch 2026</option>
        <option value="MCA Batch 2025">MCA Batch 2025</option>
        <option value="BCA Batch 2026">BCA Batch 2026</option>
        <option value="BCA Batch 2025">BCA Batch 2025</option>
      </select>
      <span className="select-arrow">▼</span>
    </div>

    <div style={{ fontSize: "13px", color: "#666", marginTop: "5px" }}>
      Select your academic course and batch
    </div>
  </div>
)} 


            
            <button 
              className="register-button" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            Already have an account? 
            <Link to="/login" className="login-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}