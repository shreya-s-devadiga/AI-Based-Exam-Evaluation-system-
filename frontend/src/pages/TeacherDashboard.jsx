import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  Plus, 
  BarChart3, 
  FileText, 
  CheckCircle, 
  Clock, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Upload,
  Users,
  Calendar,
  Hash
} from "lucide-react";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  useEffect(() => {
    API.get("/teacher/dashboard", {
      params: { token: localStorage.getItem("token") },
    }).catch(() => {
      alert("Unauthorized");
    });

    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/teacher/papers", {
        params: { token: localStorage.getItem("token") },
      });
      setPapers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const deletePaper = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) return;
    
    try {
      await API.delete("/teacher/paper", {
        params: {
          subject_id: subjectId,
          token: localStorage.getItem("token"),
        },
      });
      fetchPapers();
      alert("Paper deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Error deleting paper");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published": return "bg-emerald-100 text-emerald-800";
      case "draft": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
  switch (status) {
    case "published":
      return <CheckCircle size={14} />;
    case "draft":
      return <Clock size={14} />;
    default:
      return <FileText size={14} />;
  }
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
        
        .teacher-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 0;
          position: relative;
        }
        
        .dashboard-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px;
          min-height: 100vh;
        }
        
        .glass-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          position: relative;
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
          position: relative;
        }
        
        .dashboard-title {
          font-size: 42px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          letter-spacing: -0.5px;
        }
        
        .dashboard-subtitle {
          color: #64748b;
          font-size: 18px;
          font-weight: 500;
          padding-left: 56px;
          line-height: 1.6;
        }
        
        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          padding: 0 48px 48px;
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
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        
        .stat-value {
          font-size: 48px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        /* Action Bar */
        .action-bar {
          background: #f1f5f9;
          border-radius: 20px;
          padding: 24px;
          margin: 0 48px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 2px solid #e2e8f0;
        }
        
        .action-buttons {
          display: flex;
          gap: 16px;
        }
        
        .primary-action {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 16px 32px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        }
        
        .primary-action:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(102, 126, 234, 0.4);
        }
        
        .secondary-action {
          background: white;
          color: #475569;
          padding: 16px 32px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          border: 2px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .secondary-action:hover {
          border-color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        
        /* Papers Grid */
        .papers-section {
          padding: 0 48px 48px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        
        .section-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .papers-count {
          background: #f1f5f9;
          color: #475569;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
        }
        
        .papers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 28px;
        }
        
        /* Paper Card */
        .paper-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .paper-card:hover {
          transform: translateY(-8px);
          border-color: #c7d2fe;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
        }
        
        .paper-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          position: relative;
        }
        
        .paper-title {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.4;
          flex: 1;
        }
        
        .paper-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .paper-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 24px 0;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .meta-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }
        
        .meta-content {
          display: flex;
          flex-direction: column;
        }
        
        .meta-label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
        }
        
        .meta-value {
          font-size: 16px;
          font-weight: 600;
          color: #334155;
        }
        
        .paper-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #f1f5f9;
        }
        
        .questions-count {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-weight: 500;
        }
        
        .paper-actions {
          display: flex;
          gap: 12px;
        }
        
        .action-button {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .publish-button {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }
        
        .publish-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }
        
        .view-button {
          background: #f1f5f9;
          color: #475569;
        }
        
        .view-button:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }
        
        .more-actions {
          position: relative;
        }
        
        .more-button {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        
        .more-button:hover {
          background: #e2e8f0;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          min-width: 200px;
          overflow: hidden;
        }
        
        .dropdown-item {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #475569;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .dropdown-item:hover {
          background: #f8fafc;
          color: #667eea;
        }
        
        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 40px;
        }
        
        .empty-icon {
          font-size: 72px;
          margin-bottom: 24px;
          opacity: 0.1;
        }
        
        .empty-title {
          font-size: 24px;
          color: #64748b;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .empty-description {
          color: #94a3b8;
          font-size: 16px;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        /* Loading State */
        .loading-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 40px;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f1f5f9;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
          .dashboard-wrapper {
            padding: 24px;
          }
          
          .dashboard-header,
          .stats-grid,
          .action-bar,
          .papers-section {
            padding-left: 32px;
            padding-right: 32px;
          }
          
          .papers-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-wrapper {
            padding: 16px;
          }
          
          .dashboard-header,
          .stats-grid,
          .action-bar,
          .papers-section {
            padding-left: 24px;
            padding-right: 24px;
          }
          
          .dashboard-title {
            font-size: 32px;
            gap: 12px;
          }
          
          .dashboard-subtitle {
            padding-left: 0;
          }
          
          .action-bar {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .papers-grid {
            grid-template-columns: 1fr;
          }
          
          .paper-meta {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .dashboard-header {
            padding: 32px 24px;
          }
          
          .paper-card-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .paper-footer {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }
          
          .paper-actions {
            flex-direction: column;
          }
        }
      `}</style>
      
      <div className="teacher-dashboard">
        <div className="dashboard-wrapper">
          <div className="glass-container">
            {/* Header */}
            <div className="dashboard-header">
              <h1 className="dashboard-title">
                <span style={{ 
                  width: '56px', 
                  height: '56px', 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  👨‍🏫
                </span>
                Teacher Dashboard
              </h1>
              <p className="dashboard-subtitle">
                Manage question papers, publish exams, and track student performance
              </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText size={28} />
                </div>
                <div className="stat-value">{papers.length}</div>
                <div className="stat-label">Total Papers</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={28} />
                </div>
                <div className="stat-value">
                  {papers.filter(p => p.status === "published").length}
                </div>
                <div className="stat-label">Published Papers</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={28} />
                </div>
                <div className="stat-value">
                  {papers.filter(p => p.status === "draft").length}
                </div>
                <div className="stat-label">Draft Papers</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={28} />
                </div>
                <div className="stat-value">
                  {papers.reduce((total, paper) => total + (paper.questions?.length || 0), 0)}
                </div>
                <div className="stat-label">Total Questions</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
              <div className="action-buttons">
                <button 
                  className="primary-action"
                  onClick={() => navigate("/create-paper")}
                >
                  <Plus size={20} />
                  Create New Paper
                </button>
                
                <button 
                  className="secondary-action"
                  onClick={() => navigate("/teacher-analytics")}
                >
                  <BarChart3 size={20} />
                  View Analytics
                </button>
              </div>
              
              <div className="papers-count">
                {papers.length} {papers.length === 1 ? 'Paper' : 'Papers'} Total
              </div>
            </div>

            {/* Papers Section */}
            <div className="papers-section">
              <div className="section-header">
                <h2 className="section-title">
                  <FileText size={24} />
                  My Question Papers
                </h2>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p className="empty-title">Loading papers...</p>
                </div>
              ) : papers.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3 className="empty-title">No Papers Created Yet</h3>
                  <p className="empty-description">
                    Start by creating your first question paper. Click the "Create New Paper" button above.
                  </p>
                </div>
              ) : (
                <div className="papers-grid">
                  {papers.map((paper, index) => (
                    <div key={index} className="paper-card">
                      <div className="paper-card-header">
                        <h3 className="paper-title">{paper.subject_name}</h3>
                        <div className={`paper-status ${getStatusColor(paper.status)}`}>
                          {getStatusIcon(paper.status)}
                          {paper.status.toUpperCase()}
                        </div>
                      </div>

                      <div className="paper-meta">
                        <div className="meta-item">
                          <div className="meta-icon">
                            <Hash size={18} />
                          </div>
                          <div className="meta-content">
                            <span className="meta-label">Subject ID</span>
                            <span className="meta-value">{paper.subject_id}</span>
                          </div>
                        </div>
                        
                        <div className="meta-item">
                          <div className="meta-icon">
                            <Clock size={18} />
                          </div>
                          <div className="meta-content">
                            <span className="meta-label">Duration</span>
                            <span className="meta-value">{paper.duration} minutes</span>
                          </div>
                        </div>
                        
                        <div className="meta-item">
                          <div className="meta-icon">
                            <FileText size={18} />
                          </div>
                          <div className="meta-content">
                            <span className="meta-label">Questions</span>
                            <span className="meta-value">{paper.questions?.length || 0}</span>
                          </div>
                        </div>
                        
                        <div className="meta-item">
                          <div className="meta-icon">
                            <Calendar size={18} />
                          </div>
                          <div className="meta-content">
                            <span className="meta-label">Created</span>
                            <span className="meta-value">Recently</span>
                          </div>
                        </div>
                      </div>

                      <div className="paper-footer">
                        {/* <div className="questions-count">
                          <FileText size={16} />
                          {paper.questions?.length || 0} Questions
                        </div> */}
                        
                        <div className="paper-actions">
                         
                          
                          <button
                            className="action-button view-button"
                            onClick={() => navigate(`/paper/${paper.subject_id}`)}
                          >
                            <Eye size={16} />
                            View
                          </button>
                          
                           <div className="more-actions">
                            {/* <button 
                              className="more-button"
                              onClick={() => setShowActionsMenu(showActionsMenu === index ? null : index)}
                            >
                              <MoreVertical size={20} />
                            </button> */}
                            
                            {/* {showActionsMenu === index && (
                              <div className="dropdown-menu">
                                <div 
                                  className="dropdown-item"
                                  onClick={() => {
                                    navigate(`/edit-paper/${paper.subject_id}`);
                                    setShowActionsMenu(null);
                                  }}
                                >
                                  <Edit size={10} />
                                  Edit Paper
                                </div>
                                <div 
                                  className="dropdown-item"
                                  onClick={() => {
                                    deletePaper(paper.subject_id);
                                    setShowActionsMenu(null);
                                  }}
                                >
                                  <Trash2 size={10} />
                                  Delete Paper
                                </div>
                              </div>  
                              

                            )} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}