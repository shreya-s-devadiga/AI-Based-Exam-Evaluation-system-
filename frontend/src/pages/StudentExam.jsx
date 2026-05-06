import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function StudentExam() {
  const { subject_id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  useEffect(() => {
    fetchPaper();
  }, []);

  // ⏱️ TIMER EFFECT
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ⏰ AUTO SUBMIT WHEN TIME UP
  useEffect(() => {
    if (timeLeft === 0 && paper) {
      submitExam(true);
    }
  }, [timeLeft]);

  const fetchPaper = async () => {
    try {
      const res = await API.get(`/student/paper/${subject_id}`, {
        params: { token: localStorage.getItem("token") },
      });

      setPaper(res.data);
      setAnswers(new Array(res.data.questions.length).fill(""));
      setAnsweredQuestions(new Array(res.data.questions.length).fill(false));
      setTimeLeft(res.data.duration * 60); // minutes → seconds
      
    } catch {
      alert("Unable to load exam");
    }
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
    
    const updatedAnswered = [...answeredQuestions];
    updatedAnswered[index] = value.trim() !== "";
    setAnsweredQuestions(updatedAnswered);
  };

  const submitExam = async (auto = false) => {
    if (submitting) return;

    if (!auto && answers.some((a) => a.trim() === "")) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?")) {
        return;
      }
    }

    try {
      setSubmitting(true);

      const res = await API.post(
        "/student/submit-exam",
        { subject_id, answers },
        { params: { token: localStorage.getItem("token") } }
      );

      // alert(
      //   auto
      //     ? "Time is up! Exam auto-submitted."
      //     : "Exam submitted successfully."
      // );

      navigate("/student-results");
    } catch {
      alert("Error submitting exam");
    }
  };

  if (!paper) {
    return (
      <div className="exam-container">
        <div className="exam-loading">
          <div className="loading-spinner"></div>
          <p>Loading exam paper...</p>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalQuestions = paper.questions.length;
  const answeredCount = answeredQuestions.filter(Boolean).length;

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
        
        .exam-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 24px;
        }
        
        .exam-loading {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          gap: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .loading-spinner {
          width: 56px;
          height: 56px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .exam-loading p {
          color: white;
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        .exam-header {
          background: white;
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 28px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border-left: 6px solid #6366f1;
          position: relative;
          overflow: hidden;
        }
        
        .exam-header:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
        }
        
        .exam-title {
          color: #1e293b;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .exam-title:before {
          content: '📝';
          font-size: 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .exam-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-top: 28px;
        }
        
        .info-card {
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          padding: 24px;
          border-radius: 16px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: #c7d2fe;
        }
        
        .info-card:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 6px;
          height: 100%;
        }
        
        .info-card.time-card:before {
          background: linear-gradient(to bottom, #ef4444, #f87171);
        }
        
        .info-card.questions-card:before {
          background: linear-gradient(to bottom, #3b82f6, #60a5fa);
        }
        
        .info-card.answered-card:before {
          background: linear-gradient(to bottom, #10b981, #34d399);
        }
        
        .info-card.remaining-card:before {
          background: linear-gradient(to bottom, #f59e0b, #fbbf24);
        }
        
        .info-label {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .info-value {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
        }
        
        .timer-critical {
          animation: pulseCritical 1.5s infinite;
        }
        
        @keyframes pulseCritical {
          0%, 100% { 
            color: #1e293b;
            transform: scale(1);
          }
          50% { 
            color: #ef4444;
            transform: scale(1.05);
          }
        }
        
        .exam-body {
          display: flex;
          gap: 28px;
        }
        
        .question-navigation {
          flex: 0 0 280px;
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          height: fit-content;
          position: sticky;
          top: 28px;
          border: 2px solid #e2e8f0;
        }
        
        .navigation-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .navigation-title:before {
          content: '📍';
          font-size: 20px;
        }
        
        .question-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .question-number {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          font-size: 15px;
          position: relative;
        }
        
        .question-number.unanswered {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #64748b;
        }
        
        .question-number.answered {
          background: linear-gradient(135deg, #10b981, #34d399);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .question-number.current {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: white;
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          z-index: 2;
        }
        
        .question-number:hover:not(.current) {
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        
        .question-content {
          flex: 1;
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
        }
        
        .question-counter {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .question-counter:before {
          content: '📌';
          font-size: 16px;
        }
        
        .question-text {
          font-size: 20px;
          line-height: 1.7;
          color: #1e293b;
          margin-bottom: 32px;
          padding: 28px;
          background: #f8fafc;
          border-radius: 16px;
          border-left: 6px solid #6366f1;
          font-weight: 500;
        }
        
        .answer-section {
          margin-bottom: 32px;
        }
        
        .answer-textarea {
          width: 100%;
          min-height: 240px;
          padding: 24px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-size: 16px;
          line-height: 1.7;
          resize: vertical;
          transition: all 0.3s;
          background: #f8fafc;
          color: #334155;
          font-weight: 400;
        }
        
        .answer-textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          background: white;
        }
        
        .answer-textarea:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .exam-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
          padding-top: 32px;
          border-top: 2px solid #f1f5f9;
        }
        
        .nav-buttons {
          display: flex;
          gap: 16px;
        }
        
        .nav-button {
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          letter-spacing: 0.3px;
        }
        
        .nav-button.prev {
          background: white;
          border-color: #6366f1;
          color: #6366f1;
        }
        
        .nav-button.next {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }
        
        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        
        .nav-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .submit-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
        }
        
        .submit-button {
          padding: 18px 40px;
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: 0.5px;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }
        
        .submit-button:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
        }
        
        .submit-button:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .time-warning {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: #78350f;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
        }
        
        .auto-submit-notice {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          border: 2px solid #fbbf24;
          color: #92400e;
          padding: 20px;
          border-radius: 16px;
          margin-top: 28px;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-weight: 500;
        }
        
        .legend-container {
          background: #f8fafc;
          padding: 20px;
          border-radius: 14px;
          border: 2px solid #e2e8f0;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }
        
        .legend-color {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          border: 2px solid;
        }
        
        @media (max-width: 1200px) {
          .exam-body {
            flex-direction: column;
          }
          
          .question-navigation {
            position: static;
            order: 2;
          }
        }
        
        @media (max-width: 768px) {
          .exam-container {
            padding: 16px;
          }
          
          .exam-header,
          .question-content,
          .question-navigation {
            padding: 24px;
          }
          
          .exam-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .question-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .exam-footer {
            flex-direction: column;
            gap: 24px;
          }
          
          .nav-buttons {
            width: 100%;
            justify-content: space-between;
          }
          
          .submit-section {
            width: 100%;
            align-items: stretch;
          }
          
          .exam-title {
            font-size: 26px;
          }
          
          .question-text {
            font-size: 18px;
            padding: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .exam-info-grid {
            grid-template-columns: 1fr;
          }
          
          .question-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .nav-buttons {
            flex-direction: column;
          }
          
          .submit-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="exam-container">
        <div className="exam-header">
          <h1 className="exam-title">{paper.subject_name} Examination</h1>
          
          <div className="exam-info-grid">
            <div className="info-card time-card">
              <div className="info-label">
                <span>⏱️</span> Time Remaining
              </div>
              <div className={`info-value ${timeLeft < 300 ? 'timer-critical' : ''}`}>
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </div>
              {timeLeft < 300 && (
                <div className="time-warning" style={{ marginTop: '12px' }}>
                  ⚠️ Less than 5 minutes remaining!
                </div>
              )}
            </div>
            
            <div className="info-card questions-card">
              <div className="info-label">
                <span>📋</span> Total Questions
              </div>
              <div className="info-value">{totalQuestions}</div>
            </div>
            
            <div className="info-card answered-card">
              <div className="info-label">
                <span>✅</span> Answered
              </div>
              <div className="info-value">{answeredCount}</div>
            </div>
            
            <div className="info-card remaining-card">
              <div className="info-label">
                <span>⏳</span> Remaining
              </div>
              <div className="info-value">{totalQuestions - answeredCount}</div>
            </div>
          </div>
        </div>

        <div className="exam-body">
          <div className="question-navigation">
            <h3 className="navigation-title">Question Navigation</h3>
            <div className="question-grid">
              {paper.questions.map((_, index) => (
                <div
                  key={index}
                  className={`question-number ${
                    currentQuestion === index 
                      ? 'current' 
                      : answeredQuestions[index] 
                        ? 'answered' 
                        : 'unanswered'
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            
            <div className="legend-container">
              <div className="legend-item">
                <div className="legend-color" style={{ 
                  background: '#10b981',
                  borderColor: '#10b981'
                }}></div>
                <span>Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ 
                  background: '#6366f1',
                  borderColor: '#6366f1'
                }}></div>
                <span>Current</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ 
                  background: '#f8fafc',
                  borderColor: '#e2e8f0'
                }}></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>

          <div className="question-content">
            <div className="question-counter">
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            
            <div className="question-text">
              <strong>Q{currentQuestion + 1}:</strong> {paper.questions[currentQuestion].question_text}
            </div>
            
            <div className="answer-section">
              <textarea
                className="answer-textarea"
                placeholder="Type your answer here..."
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                disabled={submitting}
              />
            </div>
            
            {timeLeft < 600 && (
              <div className="auto-submit-notice">
                ⚠️ Exam will be automatically submitted when time runs out.
                {timeLeft < 300 && ' Please save your answers!'}
              </div>
            )}
            
            <div className="exam-footer">
              <div className="nav-buttons">
                <button
                  className="nav-button prev"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0 || submitting}
                >
                  ← Previous
                </button>
                
                <button
                  className="nav-button next"
                  onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQuestion === totalQuestions - 1 || submitting}
                >
                  Next →
                </button>
              </div>
              
              <div className="submit-section">
                {timeLeft < 600 && (
                  <div className="time-warning">
                    Hurry! Only {Math.floor(timeLeft / 60)} minutes left
                  </div>
                )}
                
                <button
                  className="submit-button"
                  onClick={() => submitExam(false)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="loading-spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Exam'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}