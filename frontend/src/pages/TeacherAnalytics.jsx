import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";




import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  TrendingUp,
  Users,
  FileText,
  Award,
  Filter,
  SortAsc,
  SortDesc,
  BarChart2,
  PieChart as PieChartIcon
} from "lucide-react";

export default function TeacherAnalytics() {
  const navigate = useNavigate();
  
  
  const [data, setData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("pie");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get("/teacher/analytics", {
        params: { token: localStorage.getItem("token") },
      });
      setData(res.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="analytics-container">
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load analytics</h3>
        <p>Please try again later</p>
      </div>
    </div>
  );

  /* ---------- FILTER + SORT ---------- */

  const filteredRows =
    selectedSubject === "ALL"
      ? data.details
      : data.details.filter(
          (d) => d.subject_id === selectedSubject
        );

  const sortedRows = [...filteredRows].sort((a, b) =>
    sortOrder === "asc"
      ? a.marks_obtained - b.marks_obtained
      : b.marks_obtained - a.marks_obtained
  );

  /* ---------- PIE CHART ---------- */

  const passCount = data.details.filter(
    (d) => d.result === "Pass"
  ).length;
  const failCount = data.details.length - passCount;
  const passPercentage = Math.round((passCount / data.details.length) * 100) || 0;

  const pieData = [
    { name: "Pass", value: passCount, color: "#10b981" },
    { name: "Fail", value: failCount, color: "#ef4444" },
  ];

  /* ---------- BAR CHART DATA ---------- */
  const subjectPerformance = Object.entries(
    data.details.reduce((acc, curr) => {
      if (!acc[curr.subject_name]) {
        acc[curr.subject_name] = { total: 0, count: 0, passes: 0 };
      }
      acc[curr.subject_name].total += curr.marks_obtained;
      acc[curr.subject_name].count += 1;
      if (curr.result === "Pass") acc[curr.subject_name].passes += 1;
      return acc;
    }, {})
  ).map(([subject, stats]) => ({
    subject,
    averageScore: Math.round(stats.total / stats.count),
    passRate: Math.round((stats.passes / stats.count) * 100),
    submissions: stats.count,
  }));

  /* ---------- EXPORT PDF ---------- */

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 220, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Teacher Analytics Report", 14, 25);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
    doc.setTextColor(0, 0, 0);

    // Summary stats
    const yPos = 50;
    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Papers', data.total_papers],
        ['Total Submissions', data.total_submissions],
        ['Pass Rate', `${passPercentage}%`],
        ['Average Score', `${Math.round(data.details.reduce((sum, d) => sum + d.marks_obtained, 0) / data.details.length)}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    });

    // Detailed results table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [
        [
          "Rank",
          "Student Name",
          "Subject",
          "Subject ID",
          "Max Marks",
          "Marks",
          "Result",
        ],
      ],
      body: sortedRows.map((r) => [
        r.rank,
        r.student_name,
        r.subject_name,
        r.subject_id,
        r.max_marks,
        r.marks_obtained,
        r.result,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    });

    doc.save("teacher_analytics_report.pdf");
  };

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

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
        
        .analytics-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 24px;
        }
        
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.98);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
        }
        
        .main-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        }
        
        /* Header */
        .dashboard-header {
          margin-bottom: 32px;
        }
        
        .dashboard-header h1 {
          font-size: 36px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .dashboard-header h1:before {
          content: '📊';
          font-size: 32px;
        }
        
        .dashboard-header p {
          color: #64748b;
          font-size: 16px;
          font-weight: 500;
          padding-left: 48px;
        }
        
        /* Summary Cards */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        
        .summary-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .summary-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
          border-color: #667eea;
        }
        
        .summary-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        }
        
        .papers-icon { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
        .submissions-icon { background: linear-gradient(135deg, #10b981, #34d399); color: white; }
        .pass-rate-icon { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; }
        .rank-icon { background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: white; }
        
        .card-value {
          font-size: 42px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .card-label {
          font-size: 15px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        
        .card-trend {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #10b981;
          margin-top: 12px;
        }
        
        /* Controls */
        .controls-section {
          background: #f8fafc;
          border-radius: 18px;
          padding: 24px;
          margin: 32px 0;
          border: 2px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .filter-label {
          font-size: 15px;
          color: #475569;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        select {
          padding: 12px 20px;
          border-radius: 12px;
          border: 2px solid #cbd5e1;
          background: white;
          font-size: 15px;
          font-weight: 500;
          color: #334155;
          min-width: 220px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
          margin-left: auto;
        }
        
        .action-btn {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .sort-btn {
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          color: #475569;
        }
        
        .export-btn {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .chart-toggle {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
        }
        
        .chart-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .chart-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        /* Charts */
        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 24px;
          margin: 32px 0;
        }
        
        .chart-container {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .chart-title {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .chart-stat {
          font-size: 32px;
          font-weight: 700;
          color: #667eea;
        }
        
        /* Table */
        .table-section {
          margin-top: 40px;
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
          overflow: hidden;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .table-header h3 {
          font-size: 22px;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .table-header h3:before {
          content: '📋';
          font-size: 20px;
        }
        
        .results-count {
          color: #64748b;
          font-size: 15px;
          font-weight: 500;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 12px;
        }
        
        .results-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .results-table th {
          background: #f8fafc;
          padding: 18px 16px;
          text-align: left;
          font-weight: 600;
          color: #475569;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
          position: sticky;
          top: 0;
        }
        
        .results-table td {
          padding: 20px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-weight: 500;
        }
        
        .results-table tr:hover {
          background: #f8fafc;
        }
        
        .rank-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }
        
        .result-badge {
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .pass-badge {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
        }
        
        .fail-badge {
          background: linear-gradient(135deg, #ef4444, #f87171);
          color: white;
        }
        
        .score-cell {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }
        
        /* Loading and Error States */
        .loading-state, .error-state {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 80vh;
          gap: 24px;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
          
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .analytics-container {
            padding: 16px;
          }
          
          .main-content {
            padding: 24px;
          }
          
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .action-buttons {
            margin-left: 0;
            justify-content: stretch;
          }
          
          .action-btn {
            flex: 1;
            justify-content: center;
          }
          
          .results-table {
            display: block;
            overflow-x: auto;
          }
          
          .card-value {
            font-size: 36px;
          }
        }
        
        @media (max-width: 480px) {
          .chart-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .table-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="analytics-container">
        <div className="main-content">
          {/* Header */}
          <div className="dashboard-header">
            <h1>Teacher Analytics Dashboard</h1>
            <p>Student performance and evaluation insights</p>
          </div>

          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-icon papers-icon">
                <FileText size={24} />
              </div>
              <div className="card-value">{data.total_papers}</div>
              <div className="card-label">Total Question Papers</div>
              <div className="card-trend">
                <TrendingUp size={16} />
                <span>Active papers: {data.details.length}</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon submissions-icon">
                <Users size={24} />
              </div>
              <div className="card-value">{data.total_submissions}</div>
              <div className="card-label">Total Submissions</div>
              <div className="card-trend">
                <TrendingUp size={16} />
                <span>Across {new Set(data.details.map(d => d.subject_id)).size} subjects</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon pass-rate-icon">
                <Award size={24} />
              </div>
              <div className="card-value">{passPercentage}%</div>
              <div className="card-label">Overall Pass Rate</div>
              <div className="card-trend">
                <TrendingUp size={16} />
                <span>{passCount} passed, {failCount} failed</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon rank-icon">
                <Award size={24} />
              </div>
              <div className="card-value">#{data.details[0]?.rank || 1}</div>
              <div className="card-label">Top Student Rank</div>
              <div className="card-trend">
                <TrendingUp size={16} />
                <span>{data.details[0]?.student_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-section">
            <div className="filter-group">
              <span className="filter-label">
                <Filter size={18} />
                Filter by Subject:
              </span>
              <select
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="ALL">All Subjects</option>
                {[...new Set(data.details.map((d) => d.subject_id))].map(
                  (sid) => (
                    <option key={sid} value={sid}>
                      {sid}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="chart-toggle">
              <button 
                className={`chart-btn ${activeChart === 'pie' ? 'active' : ''}`}
                onClick={() => setActiveChart('pie')}
              >
                <PieChartIcon size={18} />
                Pie Chart
              </button>
              <button 
                className={`chart-btn ${activeChart === 'bar' ? 'active' : ''}`}
                onClick={() => setActiveChart('bar')}
              >
                <BarChart2 size={18} />
                Bar Chart
              </button>
            </div>

            <div className="action-buttons">
              <button
                className="action-btn sort-btn"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
                Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
              </button>

              <button className="action-btn export-btn" onClick={exportPDF}>
                <Download size={18} />
                Export PDF Report
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-section">
            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">
                  <PieChartIcon size={24} />
                  Performance Distribution
                </h3>
                <div className="chart-stat">{passPercentage}%</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3 className="chart-title">
                  <BarChart2 size={24} />
                  Subject Performance
                </h3>
                <div className="chart-stat">Avg: {
                  Math.round(subjectPerformance.reduce((sum, s) => sum + s.averageScore, 0) / subjectPerformance.length)
                }%</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="subject" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'averageScore') return [`${value}%`, 'Average Score'];
                      if (name === 'passRate') return [`${value}%`, 'Pass Rate'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="averageScore" fill="#667eea" name="Average Score" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="passRate" fill="#10b981" name="Pass Rate" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Results Table */}
          <div className="table-section">
            <div className="table-header">
              <h3>Detailed Results Analysis</h3>
              <div className="results-count">
                Showing {sortedRows.length} of {data.details.length} results
              </div>
            </div>
            
            <table className="results-table">
  <thead>
    <tr>
      <th style={{ width: '80px' }}>Rank</th>
      <th>Student Name</th>
      <th>Subject Name</th>
      <th style={{ width: '120px' }}>Subject ID</th>
      <th style={{ width: '100px' }}>Max Marks</th>
      <th style={{ width: '120px' }}>Marks Obtained</th>
      <th style={{ width: '100px' }}>Result</th>
      <th style={{ width: '140px' }}>Action</th>
    </tr>
  </thead>

  <tbody>
    {sortedRows.map((r, i) => (
      <tr key={i}>
        <td><div className="rank-badge">#{r.rank}</div></td>
        <td style={{ fontWeight: 600 }}>{r.student_name}</td>
        <td>{r.subject_name}</td>
        <td>{r.subject_id}</td>
        <td>{r.max_marks}</td>
        <td>{r.marks_obtained}</td>
        <td>
          <span className={`result-badge ${r.result === "Pass" ? "pass-badge" : "fail-badge"}`}>
            {r.result}
          </span>
        </td>
        <td>
          <button
            className="view-answer-btn"
            onClick={() =>
              navigate(`/teacher/answer/${r.subject_name}/${r.student_email}`)
            }
          >
            👁 View Answer
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- COMPONENT ---------- */

const SummaryCard = ({ title, value, icon: Icon, trend }) => (
  <div className="summary-card">
    <div className="card-icon">
      <Icon size={24} />
    </div>
    <div className="card-value">{value}</div>
    <div className="card-label">{title}</div>
    {trend && (
      <div className="card-trend">
        <TrendingUp size={16} />
        <span>{trend}</span>
      </div>
    )}
  </div>
);