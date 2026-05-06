import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// 📄 PDF & Excel libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// 📊 Chart Components
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
  Legend
} from "recharts";

import {
  Download,
  FileText,
  FileSpreadsheet,
  ArrowLeft,
  Award,
  TrendingUp,
  TrendingDown,
  Percent,
  Hash,
  BookOpen,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [filter, setFilter] = useState("all"); // all, pass, fail
  const [sortBy, setSortBy] = useState("percentage"); // percentage, marks, subject
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resultsRes = await API.get("/student/results", {
        params: { token },
      });
      const profileRes = await API.get("/student/profile", {
        params: { token },
      });

      setResults(resultsRes.data);
      setStudentName(profileRes.data.name);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (percentage) => (percentage >= 40 ? "Pass" : "Fail");
  const getStatusColor = (percentage) => (percentage >= 40 ? "#10b981" : "#ef4444");
  const getStatusIcon = (percentage) => (percentage >= 40 ? <CheckCircle size={16} /> : <XCircle size={16} />);

  // Calculate statistics
  const totalExams = results.length;
  const passedExams = results.filter(r => r.percentage >= 40).length;
  const failedExams = totalExams - passedExams;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
  const averagePercentage = totalExams > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalExams)
    : 0;
  const highestPercentage = totalExams > 0
    ? Math.max(...results.map(r => r.percentage))
    : 0;

  // Filter and sort results
  const filteredResults = results.filter(r => {
    if (filter === "pass") return r.percentage >= 40;
    if (filter === "fail") return r.percentage < 40;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "percentage") {
      return sortOrder === "asc" ? a.percentage - b.percentage : b.percentage - a.percentage;
    }
    if (sortBy === "marks") {
      return sortOrder === "asc" ? a.marks - b.marks : b.marks - a.marks;
    }
    if (sortBy === "subject") {
      return sortOrder === "asc" 
        ? a.subject_name.localeCompare(b.subject_name)
        : b.subject_name.localeCompare(a.subject_name);
    }
    return 0;
  });

  // Chart Data
  const barChartData = sortedResults.map((r, index) => ({
    subject: r.subject_name.substring(0, 12) + (r.subject_name.length > 12 ? "..." : ""),
    percentage: r.percentage,
    marks: r.marks,
    maxMarks: r.max_marks,
    fill: r.percentage >= 40 ? "#10b981" : "#ef4444"
  }));

  const pieData = [
    { name: "Passed", value: passedExams, color: "#10b981" },
    { name: "Failed", value: failedExams, color: "#ef4444" }
  ];

  const lineChartData = sortedResults.map((r, index) => ({
    name: `Exam ${index + 1}`,
    percentage: r.percentage,
    subject: r.subject_name.substring(0, 8)
  }));

  // ================= PDF EXPORT =================
  const exportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    
    // Add header with gradient background
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 600, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Student Results Report", 40, 35);
    
    // Add student info
    doc.setFontSize(12);
    doc.text(`Student: ${studentName || "N/A"}`, 40, 70);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 85);
    doc.text(`Total Exams: ${totalExams} | Pass Rate: ${passRate}% | Average: ${averagePercentage}%`, 40, 100);
    
    doc.setTextColor(0, 0, 0);

    const columns = [
      "Subject ID",
      "Subject Name",
      "Marks",
      "Max Marks",
      "Percentage",
      "Status",
    ];

    const rows = sortedResults.map((r) => [
      r.subject_id,
      r.subject_name,
      r.marks,
      r.max_marks,
      `${r.percentage}%`,
      getStatus(r.percentage),
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 120,
      styles: {
        fontSize: 10,
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const value = parseInt(data.cell.raw);
          if (value < 40) {
            doc.setTextColor(220, 53, 69);
          } else {
            doc.setTextColor(40, 167, 69);
          }
        }
      }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 20);
    }

    doc.save(`${studentName || "student"}_results.pdf`);
  };

  // ================= EXCEL EXPORT =================
  const exportExcel = () => {
    const excelData = sortedResults.map((r) => ({
      "Subject ID": r.subject_id,
      "Subject Name": r.subject_name,
      "Marks": r.marks,
      "Max Marks": r.max_marks,
      "Percentage": `${r.percentage}%`,
      "Status": getStatus(r.percentage),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    // Add some formatting
    const wscols = [
      {wch: 12}, // Subject ID
      {wch: 30}, // Subject Name
      {wch: 8},  // Marks
      {wch: 10}, // Max Marks
      {wch: 12}, // Percentage
      {wch: 10}, // Status
    ];
    worksheet['!cols'] = wscols;

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, `${studentName || "student"}_results.xlsx`);
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
        
        .results-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }
        
        .results-wrapper {
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
        .results-header {
          padding: 48px 48px 32px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 2px solid #e2e8f0;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .header-info h1 {
          font-size: 36px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .header-info p {
          color: #64748b;
          font-size: 16px;
          font-weight: 500;
          margin-left: 56px;
          line-height: 1.6;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .action-button {
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .back-button {
          background: #f1f5f9;
          color: #475569;
        }
        
        .export-pdf-button {
          background: linear-gradient(135deg, #ef4444, #f87171);
          color: white;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        
        .export-excel-button {
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
          padding: 28px;
          border: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-align: center;
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
          height: 5px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
        }
        
        .total-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
        .passed-icon { background: linear-gradient(135deg, #10b981, #34d399); }
        .average-icon { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .highest-icon { background: linear-gradient(135deg, #ec4899, #f472b6); }
        
        .stat-value {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
        
        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          padding: 0 48px 32px;
        }
        
        .chart-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s;
          min-height: 350px;
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
        
        .chart-container {
          flex: 1;
          min-height: 250px;
        }
        
        /* Controls Section */
        .controls-section {
          background: #f1f5f9;
          border-radius: 20px;
          padding: 24px;
          margin: 0 48px 32px;
          border: 2px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
        }
        
        .filter-group, .sort-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .control-label {
          font-size: 15px;
          color: #475569;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        select {
          padding: 10px 18px;
          border-radius: 12px;
          border: 2px solid #cbd5e1;
          background: white;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          min-width: 160px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .sort-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }
        
        .sort-button {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: white;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #64748b;
        }
        
        .sort-button:hover {
          border-color: #667eea;
          color: #667eea;
        }
        
        /* Results Table */
        .table-section {
          padding: 0 48px 64px;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .table-title {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .results-count {
          color: #64748b;
          font-size: 15px;
          font-weight: 500;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 20px;
        }
        
        .results-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 2px solid #e2e8f0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        
        .results-table th {
          background: linear-gradient(135deg, #667eea, #764ba2);
          padding: 20px 24px;
          text-align: left;
          font-weight: 600;
          color: white;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
        }
        
        .results-table th:first-child {
          border-top-left-radius: 18px;
        }
        
        .results-table th:last-child {
          border-top-right-radius: 18px;
        }
        
        .results-table td {
          padding: 20px 24px;
          border-bottom: 2px solid #f1f5f9;
          color: #334155;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .results-table tr:last-child td {
          border-bottom: none;
        }
        
        .results-table tr:hover td {
          background: #f8fafc;
        }
        
        .subject-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .subject-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          flex-shrink: 0;
        }
        
        .subject-info {
          display: flex;
          flex-direction: column;
        }
        
        .subject-id {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }
        
        .subject-name {
          font-weight: 600;
          color: #1e293b;
          margin-top: 2px;
        }
        
        .marks-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }
        
        .percentage-cell {
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .pass-badge {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        
        .fail-badge {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          border: 1px solid #fecaca;
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
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Empty State */
        .empty-state {
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
        
        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .results-wrapper {
            padding: 0 16px;
          }
          
          .results-header,
          .stats-grid,
          .charts-grid,
          .controls-section,
          .table-section {
            padding-left: 24px;
            padding-right: 24px;
          }
          
          .header-content {
            flex-direction: column;
            gap: 24px;
          }
          
          .header-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .action-button {
            width: 100%;
            justify-content: center;
          }
          
          .controls-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-group,
          .sort-group {
            width: 100%;
          }
          
          select {
            flex: 1;
          }
          
          .sort-toggle {
            margin-left: 0;
            justify-content: center;
          }
          
          .results-table {
            display: block;
            overflow-x: auto;
          }
          
          .stats-grid,
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .header-info h1 {
            font-size: 28px;
          }
          
          .subject-cell {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .table-header {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .chart-card {
            padding: 24px;
          }
        }
      `}</style>
      
      <div className="results-container">
        <div className="results-wrapper">
          <div className="glass-container">
            {/* Header */}
            <div className="results-header">
              <div className="header-content">
                <div className="header-info">
                  <h1>
                    <Award size={32} />
                    Examination Results
                  </h1>
                  <p>
                    Detailed performance analysis for {studentName || "Student"} • 
                    Track your progress and export reports
                  </p>
                </div>
                
                <div className="header-actions">
                  <button 
                    className="action-button back-button"
                    onClick={() => navigate("/student")}
                  >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                  </button>
                  
                  <button 
                    className="action-button export-pdf-button"
                    onClick={exportPDF}
                  >
                    <FileText size={18} />
                    Export PDF
                  </button>
                  
                  <button 
                    className="action-button export-excel-button"
                    onClick={exportExcel}
                  >
                    <FileSpreadsheet size={18} />
                    Export Excel
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>
                  Loading your results...
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3 className="empty-title">No Results Available</h3>
                <p className="empty-description">
                  You haven't attempted any exams yet. Start by taking an exam from your dashboard.
                </p>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon total-icon">
                      <BookOpen size={24} />
                    </div>
                    <div className="stat-value">{totalExams}</div>
                    <div className="stat-label">Total Exams Attempted</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon passed-icon">
                      <CheckCircle size={24} />
                    </div>
                    <div className="stat-value">{passedExams}</div>
                    <div className="stat-label">Exams Passed</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon average-icon">
                      <TrendingUp size={24} />
                    </div>
                    <div className="stat-value">{averagePercentage}%</div>
                    <div className="stat-label">Average Score</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon highest-icon">
                      <Award size={24} />
                    </div>
                    <div className="stat-value">{highestPercentage}%</div>
                    <div className="stat-label">Highest Score</div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                  {/* Bar Chart - Subject-wise Performance */}
                  <div className="chart-card">
                    <h4><BarChart3 size={20} /> Subject-wise Performance</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="subject" 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            fontSize={12}
                          />
                          <YAxis 
                            label={{ 
                              value: 'Percentage (%)', 
                              angle: -90, 
                              position: 'insideLeft',
                              fontSize: 12
                            }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Percentage']}
                            labelStyle={{ fontWeight: 'bold' }}
                          />
                          <Bar 
                            dataKey="percentage" 
                            name="Percentage" 
                            radius={[4, 4, 0, 0]}
                          >
                            {barChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart - Pass/Fail Distribution */}
                  <div className="chart-card">
                    <h4><PieChartIcon size={20} /> Pass/Fail Distribution</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Exams']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Line Chart - Performance Trend */}
                  <div className="chart-card">
                    <h4><LineChartIcon size={20} /> Performance Trend</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="subject" 
                            fontSize={12}
                          />
                          <YAxis 
                            label={{ 
                              value: 'Percentage (%)', 
                              angle: -90, 
                              position: 'insideLeft',
                              fontSize: 12
                            }}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Percentage']}
                            labelStyle={{ fontWeight: 'bold' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="#667eea"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Controls Section */}
                <div className="controls-section">
                  <div className="filter-group">
                    <span className="control-label">
                      <Filter size={18} />
                      Filter Results:
                    </span>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                      <option value="all">All Results</option>
                      <option value="pass">Passed Only</option>
                      <option value="fail">Failed Only</option>
                    </select>
                  </div>
                  
                  <div className="sort-group">
                    <span className="control-label">
                      <BarChart3 size={18} />
                      Sort By:
                    </span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="percentage">Percentage</option>
                      <option value="marks">Marks</option>
                      <option value="subject">Subject Name</option>
                    </select>
                  </div>
                  
                  <div className="sort-toggle">
                    <button 
                      className="sort-button"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>

                {/* Results Table */}
                <div className="table-section">
                  <div className="table-header">
                    <h3 className="table-title">
                      <FileText size={24} />
                      Detailed Results
                    </h3>
                    <div className="results-count">
                      Showing {sortedResults.length} of {results.length} results
                    </div>
                  </div>
                  
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Max Marks</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((result, index) => {
                        const isPass = result.percentage >= 40;
                        const statusColor = getStatusColor(result.percentage);
                        
                        return (
                          <tr key={index}>
                            <td>
                              <div className="subject-cell">
                                <div className="subject-icon">
                                  <Hash size={18} />
                                </div>
                                <div className="subject-info">
                                  <div className="subject-id">{result.subject_id}</div>
                                  <div className="subject-name">{result.subject_name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="marks-cell">
                              {result.marks}
                            </td>
                            <td>{result.max_marks}</td>
                            <td className="percentage-cell" style={{ color: statusColor }}>
                              <Percent size={16} />
                              {result.percentage}%
                            </td>
                            <td className="status-cell">
                              <span className={`status-badge ${isPass ? 'pass-badge' : 'fail-badge'}`}>
                                {isPass ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {isPass ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}