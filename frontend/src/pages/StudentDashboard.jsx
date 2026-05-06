import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import {
  BookOpen,
  FileText,
  Award,
  TrendingUp,
  Clock,
  LogOut,
  User,
  CheckCircle,
  Circle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
  Calendar,
  Hash,
  ChevronRight
} from "lucide-react";

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [results, setResults] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const papersRes = await API.get("/student/papers", { params: { token } });
      const resultsRes = await API.get("/student/results", { params: { token } });
      const profileRes = await API.get("/student/profile", { params: { token } });

      setPapers(papersRes.data);
      setResults(resultsRes.data);
      setStudentName(profileRes.data.name);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const attemptedSubjects = results.map((r) => r.subject_id);

  /* ---------- ANALYTICS DATA ---------- */
  // EXACT SAME LOGIC AS ORIGINAL CODE

  // Progress %
  const totalExams = papers.length;
  const attemptedCount = results.length;
  const completionPercent =
    totalExams === 0 ? 0 : Math.round((attemptedCount / totalExams) * 100);

  // Bar + Line data - EXACT SAME AS ORIGINAL
  const chartData = results.map((r) => ({
    subject: r.subject_name,
    marks: r.marks,
  }));

  // Pie data - EXACT SAME AS ORIGINAL
  const pieData = [
    { name: "Attempted", value: attemptedCount },
    { name: "Not Attempted", value: totalExams - attemptedCount },
  ];

  const PIE_COLORS = ["#2e7d32", "#9e9e9e"];

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        body {
          background: #f8fafc;
        }
        
        .student-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }
        
        .dashboard-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          min-height: 100vh;
        }
        
        .glass-container {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 32px 32px 0 0;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          position: relative;
          min-height: calc(100vh - 32px);
          margin-top: 32px;
        }
        
        .glass-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #667eea, #764ba2, #ec4899);
        }
        
        /* Header */
        .dashboard-header {
          padding: 48px 48px 32px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 2px solid #e2e8f0;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .user-avatar {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }
        
        .user-details h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .user-details .role-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e0e7ff;
          color: #4f46e5;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        
        .header-actions {
          display: flex;
          gap: 16px;
        }
        
        .action-button {
          padding: 12px 28px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .results-button {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }
        
        .logout-button {
          background: white;
          color: #ef4444;
          border: 2px solid #ef4444;
        }
        
        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        }
        
        /* Welcome Section */
        .welcome-section {
          padding: 32px 48px 16px;
        }
        
        .welcome-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .welcome-subtitle {
          color: #64748b;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.6;
          max-width: 600px;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          padding: 32px 48px;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border-radius: 24px;
          padding: 32px;
          border: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card:hover {
          transform: translateY(-8px);
          border-color: #c7d2fe;
          box-shadow: 0 24px 48px rgba(102, 126, 234, 0.1);
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: white;
        }
        
        .total-exams-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
        .attempted-icon { background: linear-gradient(135deg, #10b981, #34d399); }
        .average-icon { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .highest-icon { background: linear-gradient(135deg, #ec4899, #f472b6); }
        
        .stat-value {
          font-size: 42px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 15px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        /* Progress Section */
        .progress-section {
          padding: 0 48px 32px;
        }
        
        .progress-container {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 2px solid #e2e8f0;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .progress-title {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .progress-percent {
          font-size: 32px;
          font-weight: 800;
          color: #667eea;
        }
        
        .progress-bar {
          height: 16px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin: 20px 0;
          position: relative;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 10px;
          transition: width 1s ease-in-out;
          position: relative;
          overflow: hidden;
        }
        
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
            rgba(255,255,255,0.1) 25%, 
            rgba(255,255,255,0.2) 50%, 
            rgba(255,255,255,0.1) 75%);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .progress-labels {
          display: flex;
          justify-content: space-between;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }
        
        /* Analytics Grid - EXACT SAME LAYOUT AS ORIGINAL BUT STYLED */
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          padding: 0 48px 48px;
        }
        
        .chart-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }
        
        .chart-card:hover {
          border-color: #c7d2fe;
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.1);
        }
        
        .chart-card h4 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        /* Progress Chart Card */
        .progress-chart-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .progress-outer {
          width: 100%;
          height: 12px;
          background-color: #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          margin: 10px 0 15px 0;
        }
        
        .progress-inner {
          height: 100%;
          background: linear-gradient(90deg, #2e7d32, #4caf50);
          border-radius: 8px;
          transition: width 0.4s ease;
        }
        
        /* Chart Container */
        .chart-container {
          flex: 1;
          min-height: 250px;
        }
        
        /* Exams Section */
        .exams-section {
          padding: 0 48px 64px;
        }
        
        .exams-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        
        .exams-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .exams-count {
          background: #f1f5f9;
          color: #475569;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }
        
        .exam-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }
        
        .exam-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .exam-card:hover {
          transform: translateY(-8px);
          border-color: #c7d2fe;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
        }
        
        .exam-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .exam-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.4;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .completed-badge {
          background: linear-gradient(135deg, #2e7d32, #4caf50);
          color: white;
        }
        
        .pending-badge {
          background: linear-gradient(135deg, #9e9e9e, #bdbdbd);
          color: white;
        }
        
        .exam-info {
          margin: 20px 0;
        }
        
        .exam-info p {
          margin: 8px 0;
          color: #64748b;
          font-size: 15px;
        }
        
        .exam-info b {
          color: #475569;
        }
        
        .attempt-btn {
          margin-top: 20px;
          width: 100%;
          background: linear-gradient(135deg, #2e7d32, #4caf50);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .attempt-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.3);
        }
        
        .submitted-text {
          margin-top: 20px;
          color: #2e7d32;
          font-weight: 600;
          text-align: center;
          padding: 12px;
          background: #f0f9f0;
          border-radius: 12px;
          border: 1px solid #c8e6c9;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 60vh;
          gap: 24px;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f1f5f9;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          .analytics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .exam-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-wrapper {
            padding: 0 16px;
          }
          
          .dashboard-header,
          .welcome-section,
          .stats-grid,
          .progress-section,
          .analytics-grid,
          .exams-section {
            padding-left: 24px;
            padding-right: 24px;
          }
          
          .header-content {
            flex-direction: column;
            gap: 24px;
            align-items: stretch;
          }
          
          .header-actions {
            flex-direction: column;
          }
          
          .analytics-grid {
            grid-template-columns: 1fr;
          }
          
          .exam-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-card {
            min-height: 350px;
          }
        }
        
        @media (max-width: 480px) {
          .user-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .exam-header {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
      
      <div className="student-dashboard">
        <div className="dashboard-wrapper">
          <div className="glass-container">
            {/* Header */}
            <div className="dashboard-header">
              <div className="header-content">
                <div className="user-info">
                  <div className="user-avatar">
                    {studentName?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div className="user-details">
                    <h1>{studentName || "Student"}</h1>
                    <span className="role-tag">
                      <User size={14} />
                      Student Account
                    </span>
                  </div>
                </div>
                
                <div className="header-actions">
                  <button 
                    className="action-button results-button"
                    onClick={() => navigate("/student-results")}
                  >
                    <FileText size={18} />
                    View Results
                  </button>
                  
                  <button 
                    className="action-button logout-button"
                    onClick={logout}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Welcome Section */}
            <div className="welcome-section">
              <h2 className="welcome-title">
                Welcome, {studentName?.split(" ")[0] || "Student"} 👋
              </h2>
              <p className="welcome-subtitle">
                View exams, attempt tests, and track your performance
              </p>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
                  Loading your dashboard...
                </p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                {/* <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon total-exams-icon">
                      <BookOpen size={24} />
                    </div>
                    <div className="stat-value">{papers.length}</div>
                    <div className="stat-label">Total Exams</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon attempted-icon">
                      <FileText size={24} />
                    </div>
                    <div className="stat-value">{results.length}</div>
                    <div className="stat-label">Exams Attempted</div>
                  </div>
                </div> */}

                {/* Progress Section */}
                <div className="progress-section">
                  <div className="progress-container">
                    <div className="progress-header">
                      <h3 className="progress-title">
                        <Target size={24} />
                        Overall Completion
                      </h3>
                      <div className="progress-percent">{completionPercent}%</div>
                    </div>
                    
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${completionPercent}%` }}
                      ></div>
                    </div>
                    
                    <div className="progress-labels">
                      <span>{attemptedCount} Attempted</span>
                      <span>{papers.length} Total</span>
                    </div>
                  </div>
                </div>

              
                {/* EXAMS - EXACT SAME LOGIC */}
                <div className="exams-section">
                  <div className="exams-header">
                    <h3 className="exams-title">
                      <BookOpen size={24} />
                      Available Exams
                    </h3>
                    <div className="exams-count">
                      {papers.length} {papers.length === 1 ? 'Exam' : 'Exams'}
                    </div>
                  </div>

                  <div className="exam-grid">
                    {papers.map((paper, index) => {
                      const attempted = attemptedSubjects.includes(paper.subject_id);

                      return (
                        <div key={index} className="exam-card">
                          <div className="exam-header">
                            <h4 className="exam-title">
                              <BookOpen size={20} />
                              {paper.subject_name}
                            </h4>
                            <span
                              className={`status-badge ${attempted ? 'completed-badge' : 'pending-badge'}`}
                            >
                              {attempted ? "Completed" : "Not Attempted"}
                            </span>
                          </div>

                          <div className="exam-info">
                            <p><b>Subject ID:</b> {paper.subject_id}</p>
                            <p><b>Duration:</b> {paper.duration} mins</p>
                            <p><b>Total Questions:</b> {paper.questions.length}</p>
                          </div>

                          {!attempted ? (
                            <button
                              className="attempt-btn"
                              onClick={() => navigate(`/exam/${paper.subject_id}`)}
                            >
                              <ChevronRight size={18} />
                              Attempt Exam
                            </button>
                          ) : (
                            <div className="submitted-text">
                              <CheckCircle size={18} />
                              ✔ Exam Submitted
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}