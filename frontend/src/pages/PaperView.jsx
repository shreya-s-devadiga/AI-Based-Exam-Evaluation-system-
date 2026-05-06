import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import API from "../services/api";

export default function PaperView() {
  const { subject_id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    fetchPaper();
  }, []);

  const fetchPaper = async () => {
    try {
      const res = await API.get(`/teacher/paper/${subject_id}`, {
        params: { token: localStorage.getItem("token") },
      });
      setPaper(res.data);
    } catch (err) {
      alert("Unable to load paper");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const downloadQuestionPaperPDF = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text(`Question Paper`, 10, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Subject: ${paper.subject_name}`, 10, y);
    y += 10;

    paper.questions.forEach((q, index) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(12);
      doc.text(`${index + 1}. ${q.question_text}`, 10, y);
      y += 8;

      doc.text(`Marks: ${q.marks}`, 10, y);
      y += 10;
    });

    doc.save(`${paper.subject_id}_Question_Paper.pdf`);
  };

  const downloadAnswerSheetPDF = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text(`Answer Sheet`, 10, y);
    y += 8;

    doc.setFontSize(12);
    doc.text(`Subject: ${paper.subject_name}`, 10, y);
    y += 12;

    paper.questions.forEach((q, index) => {
      if (y > 260) {
        doc.addPage();
        y = 15;
      }

      doc.text(`Q${index + 1}`, 10, y);
      y += 6;

      const answerLines = doc.splitTextToSize(q.model_answer, 180);
      doc.text(answerLines, 10, y);
      y += answerLines.length * 6;

      doc.text(`Marks: ${q.marks}`, 10, y);
      y += 10;
    });

    doc.save(`${paper.subject_id}_Answer_Sheet.pdf`);
  };

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading paper details...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <h2 style={styles.errorTitle}>No Paper Found</h2>
        <p style={styles.errorMessage}>The requested paper could not be loaded.</p>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Go Back
        </button>
      </div>
    );
  }

  const totalMarks = paper.questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          {/* <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <span style={styles.backArrow}>←</span> Back to Papers
          </button>
          <div style={styles.headerActions}>
            <button onClick={downloadQuestionPaperPDF} style={styles.downloadBtnPrimary}>
              📄 Download Question Paper
            </button>
            <button onClick={downloadAnswerSheetPDF} style={styles.downloadBtnSecondary}>
              📝 Download Answer Sheet
            </button>
          </div> */}
        </div>

        <div style={styles.infoCard}>
          <div style={styles.subjectHeader}>
            <h1 style={styles.subjectTitle}>{paper.subject_name}</h1>
            <div style={styles.subjectCode}>ID: {paper.subject_id}</div>
          </div>
          
          <div style={styles.paperMeta}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Duration:</span>
              <span style={styles.metaValue}>{paper.duration} minutes</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Total Questions:</span>
              <span style={styles.metaValue}>{paper.questions.length}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Total Marks:</span>
              <span style={styles.highlightedValue}>{totalMarks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div style={styles.questionsContainer}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Exam Questions</h2>
          <span style={styles.questionCount}>{paper.questions.length} Questions</span>
        </div>

        <div style={styles.questionsList}>
          {paper.questions.map((q, index) => (
            <div 
              key={index} 
              style={{
                ...styles.questionCard,
                ...(activeQuestion === index ? styles.expandedCard : {})
              }}
              onClick={() => toggleQuestion(index)}
            >
              <div style={styles.questionHeader}>
                <div style={styles.questionNumber}>
                  <span style={styles.numberBadge}>Q{index + 1}</span>
                  <span style={styles.marksBadge}>{q.marks} marks</span>
                </div>
                <div style={styles.questionPreview}>
                  {q.question_text.length > 120 
                    ? q.question_text.substring(0, 120) + '...' 
                    : q.question_text}
                </div>
                <div style={styles.toggleIcon}>
                  {activeQuestion === index ? '▼' : '▶'}
                </div>
              </div>

              {activeQuestion === index && (
                <div style={styles.questionDetails}>
                  <div style={styles.detailSection}>
                    <h4 style={styles.detailTitle}>Question:</h4>
                    <p style={styles.questionText}>{q.question_text}</p>
                  </div>
                  <div style={styles.detailSection}>
                    <h4 style={styles.detailTitle}>Model Answer:</h4>
                    <div style={styles.answerBox}>
                      {q.model_answer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={styles.footerActions}>
        <button onClick={() => navigate(-1)} style={styles.outlineButton}>
          ← Back to List
        </button>
        <div style={styles.downloadGroup}>
          <button onClick={downloadQuestionPaperPDF} style={styles.primaryButton}>
            📥 Download Question Paper
          </button>
          <button onClick={downloadAnswerSheetPDF} style={styles.successButton}>
            📥 Download Answer Sheet
          </button>
        </div>
      </div>

      {/* Inline CSS */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .header-top {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
          
          .header-actions {
            flex-direction: column;
          }
          
          .subject-header {
            flex-direction: column;
            gap: 15px;
          }
          
          .paper-meta {
            grid-template-columns: 1fr !important;
          }
          
          .footer-actions {
            flex-direction: column;
            gap: 15px;
          }
          
          .download-group {
            flex-direction: column;
            width: 100%;
          }
          
          .action-btn {
            width: 100%;
            justify-content: center;
          }
          
          .question-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .question-number {
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
          }
        }
        
        @media (max-width: 480px) {
          .info-card {
            padding: 20px !important;
          }
          
          .subject-title {
            font-size: 24px !important;
          }
          
          .questions-container {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  
  // Loading State
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'white',
    textAlign: 'center',
  },
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
    marginBottom: '20px',
  },
  
  loadingText: {
    fontSize: '16px',
    opacity: 0.9,
  },
  
  // Error State
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'white',
    textAlign: 'center',
    padding: '20px',
  },
  
  errorIcon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  
  errorTitle: {
    fontSize: '24px',
    marginBottom: '10px',
    fontWeight: '600',
  },
  
  errorMessage: {
    fontSize: '16px',
    marginBottom: '20px',
    opacity: 0.9,
  },
  
  backButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  
  // Header
  header: {
    maxWidth: '1200px',
    margin: '0 auto 30px',
  },
  
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  
  backBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    fontSize: '14px',
    fontWeight: '500',
  },
  
  backArrow: {
    fontSize: '18px',
  },
  
  headerActions: {
    display: 'flex',
    gap: '15px',
  },
  
  downloadBtnPrimary: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  
  downloadBtnSecondary: {
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  
  // Paper Info Card
  infoCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  
  subjectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f0f0f0',
  },
  
  subjectTitle: {
    fontSize: '32px',
    color: '#2d3436',
    margin: 0,
    fontWeight: '700',
  },
  
  subjectCode: {
    background: '#6366f1',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '50px',
    fontWeight: '600',
    fontSize: '14px',
  },
  
  paperMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  
  metaLabel: {
    color: '#666',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  metaValue: {
    color: '#2d3436',
    fontSize: '18px',
    fontWeight: '600',
  },
  
  highlightedValue: {
    color: '#6366f1',
    fontSize: '24px',
    fontWeight: '600',
  },
  
  // Questions Container
  questionsContainer: {
    maxWidth: '1200px',
    margin: '0 auto 30px',
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  },
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #f8f9fa',
  },
  
  sectionTitle: {
    fontSize: '24px',
    color: '#2d3436',
    margin: 0,
    fontWeight: '600',
  },
  
  questionCount: {
    background: '#e3f2fd',
    color: '#1976d2',
    padding: '8px 16px',
    borderRadius: '50px',
    fontWeight: '600',
    fontSize: '14px',
  },
  
  // Questions List
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  
  questionCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '2px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  },
  
  expandedCard: {
    borderColor: '#6366f1',
    boxShadow: '0 15px 30px rgba(99, 102, 241, 0.15)',
  },
  
  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    background: '#fafafa',
  },
  
  questionNumber: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    minWidth: '100px',
  },
  
  numberBadge: {
    background: '#6366f1',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '50px',
    fontWeight: '600',
    fontSize: '16px',
  },
  
  marksBadge: {
    background: '#ffeb3b',
    color: '#333',
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
  },
  
  questionPreview: {
    flex: 1,
    color: '#555',
    lineHeight: 1.6,
    fontSize: '15px',
  },
  
  toggleIcon: {
    color: '#6366f1',
    fontSize: '20px',
    fontWeight: 'bold',
    width: '30px',
    textAlign: 'center',
  },
  
  // Question Details
  questionDetails: {
    padding: '25px',
    background: 'white',
    borderTop: '2px solid #f8f9fa',
  },
  
  detailSection: {
    marginBottom: '25px',
  },
  
  detailTitle: {
    color: '#6366f1',
    fontSize: '16px',
    margin: '0 0 12px 0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  questionText: {
    color: '#333',
    lineHeight: 1.8,
    fontSize: '16px',
    margin: 0,
    paddingLeft: '20px',
    borderLeft: '3px solid #e3f2fd',
  },
  
  answerBox: {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    color: '#333',
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    marginTop: '10px',
    fontFamily: "'Courier New', monospace",
  },
  
  // Footer Actions
  footerActions: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
  },
  
  downloadGroup: {
    display: 'flex',
    gap: '15px',
  },
  
  outlineButton: {
    background: 'transparent',
    border: '2px solid white',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  
  primaryButton: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  
  successButton: {
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
};