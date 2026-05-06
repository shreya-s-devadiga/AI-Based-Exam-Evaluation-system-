import { useState } from "react";
import API from "../services/api";

export default function CreatePaper() {
  const [paper, setPaper] = useState({
    subject_name: "",
    subject_id: "",
    duration: "",
  });

  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // ➕ Add Question
  const addQuestion = () => {
    const newQuestion = {
      question_text: "",
      model_answer: "",
      marks: 5,
    };
    
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(questions.length);
  };

  // ✏️ Edit Question
  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    
    // Special handling for marks field
    if (field === "marks") {
      const marksValue = parseInt(value) || 0;
      updated[index][field] = marksValue < 0 ? 0 : marksValue;
    } else {
      updated[index][field] = value;
    }
    
    setQuestions(updated);
  };

  // 🗑️ Delete Question
  const deleteQuestion = (index) => {
    const filtered = questions.filter((_, i) => i !== index);
    setQuestions(filtered);
    
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else if (expandedQuestion > index) {
      setExpandedQuestion(expandedQuestion - 1);
    }
  };

  // ⬆️⬇️ Move Question
  const moveQuestion = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newQuestions = [...questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[newIndex];
    newQuestions[newIndex] = temp;
    setQuestions(newQuestions);
    
    if (expandedQuestion === index) {
      setExpandedQuestion(newIndex);
    } else if (expandedQuestion === newIndex) {
      setExpandedQuestion(index);
    }
  };

  // 📊 Calculate Total Marks
  const calculateTotalMarks = () => {
    return questions.reduce((total, q) => total + (parseInt(q.marks) || 0), 0);
  };

  // 📤 Submit Paper
  const submitPaper = async () => {
    if (!paper.subject_name.trim() || !paper.subject_id.trim() || !paper.duration.trim()) {
      alert("Please fill in all paper details");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Validate all questions
    const incompleteQuestions = questions.filter(
      (q) => !q.question_text.trim() || !q.model_answer.trim() || !q.marks
    );
    
    if (incompleteQuestions.length > 0) {
      alert("Please complete all questions before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await API.post(
        "/teacher/create-paper",
        { ...paper, questions },
        { params: { token: localStorage.getItem("token") } }
      );

      alert("Question Paper Created Successfully!");
      
      // Reset form
      setPaper({
        subject_name: "",
        subject_id: "",
        duration: "",
      });
      setQuestions([]);
      setExpandedQuestion(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Error creating paper. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        
        .create-paper-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
          padding: 30px;
        }
        
        .paper-header {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border-left: 6px solid #673AB7;
        }
        
        .header-title {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .header-title h1 {
          color: #333;
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(90deg, #673AB7, #9C27B0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .header-title:before {
          content: '📝';
          font-size: 28px;
        }
        
        .paper-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .input-group {
          position: relative;
        }
        
        .input-label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 500;
          font-size: 14px;
        }
        
        .input-label:after {
          content: ' *';
          color: #f44336;
        }
        
        .paper-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 10px;
          border: 2px solid #e0e0e0;
          font-size: 15px;
          transition: all 0.3s;
          background: #fafafa;
        }
        
        .paper-input:focus {
          outline: none;
          border-color: #673AB7;
          box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.1);
          background: white;
        }
        
        .input-icon {
          position: absolute;
          right: 15px;
          top: 40px;
          color: #673AB7;
        }
        
        .paper-stats {
          display: flex;
          gap: 20px;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 2px dashed #eee;
        }
        
        .stat-card {
          flex: 1;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #673AB7;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
        }
        
        .questions-section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        
        .section-title h2 {
          color: #333;
          font-size: 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .section-title h2:before {
          content: '❓';
        }
        
        .add-question-btn {
          background: linear-gradient(90deg, #673AB7, #9C27B0);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(103, 58, 183, 0.2);
        }
        
        .add-question-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(103, 58, 183, 0.3);
        }
        
        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .question-card {
          background: white;
          border-radius: 12px;
          border: 2px solid #e0e0e0;
          overflow: hidden;
          transition: all 0.3s;
        }
        
        .question-card:hover {
          border-color: #673AB7;
          box-shadow: 0 5px 15px rgba(103, 58, 183, 0.1);
        }
        
        .question-card.expanded {
          border-color: #673AB7;
          box-shadow: 0 8px 25px rgba(103, 58, 183, 0.15);
        }
        
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          background: #fafafa;
          cursor: pointer;
          transition: background 0.3s;
        }
        
        .question-header:hover {
          background: #f5f5f5;
        }
        
        .question-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .question-number {
          width: 36px;
          height: 36px;
          background: #673AB7;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }
        
        .question-preview {
          font-size: 15px;
          color: #555;
          max-width: 500px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .question-actions {
          display: flex;
          gap: 10px;
        }
        
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #f5f5f5;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background: #673AB7;
          color: white;
          transform: translateY(-1px);
        }
        
        .action-btn.delete:hover {
          background: #f44336;
        }
        
        .question-content {
          padding: 25px;
          background: #fefefe;
          border-top: 1px solid #eee;
        }
        
        .question-content textarea {
          width: 100%;
          min-height: 120px;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          line-height: 1.6;
          resize: vertical;
          margin-bottom: 20px;
          transition: all 0.3s;
          background: #fafafa;
        }
        
        .question-content textarea:focus {
          outline: none;
          border-color: #673AB7;
          box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.1);
          background: white;
        }
        
        .answer-row {
          display: grid;
          grid-template-columns: 1fr 150px;
          gap: 20px;
          align-items: start;
        }
        
        .marks-input {
          width: 100%;
          padding: 15px;
          border-radius: 10px;
          border: 2px solid #e0e0e0;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          background: #fafafa;
        }
        
        .marks-input:focus {
          outline: none;
          border-color: #673AB7;
          background: white;
        }
        
        .paper-footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px dashed #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .total-marks {
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }
        
        .total-marks span {
          color: #673AB7;
          font-size: 32px;
          margin-left: 10px;
        }
        
        .submit-btn {
          background: linear-gradient(90deg, #4CAF50, #66BB6A);
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
        }
        
        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #888;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 20px;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .create-paper-container {
            padding: 20px;
          }
          
          .paper-header,
          .questions-section {
            padding: 20px;
          }
          
          .paper-details-grid {
            grid-template-columns: 1fr;
          }
          
          .answer-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .paper-footer {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .question-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .question-actions {
            align-self: flex-end;
          }
        }
      `}</style>

      <div className="create-paper-container">
        <div className="paper-header">
          <div className="header-title">
            <h1>Create Question Paper</h1>
          </div>
          
          <div className="paper-details-grid">
            <div className="input-group">
              <label className="input-label">Subject Name</label>
              <input
                className="paper-input"
                type="text"
                placeholder="e.g., Mathematics, Physics, etc."
                value={paper.subject_name}
                onChange={(e) =>
                  setPaper({ ...paper, subject_name: e.target.value })
                }
              />
              <span className="input-icon">📚</span>
            </div>
            
            <div className="input-group">
              <label className="input-label">Subject ID</label>
              <input
                className="paper-input"
                type="text"
                placeholder="e.g., MATH101, PHY202"
                value={paper.subject_id}
                onChange={(e) =>
                  setPaper({ ...paper, subject_id: e.target.value })
                }
              />
              <span className="input-icon">#️⃣</span>
            </div>
            
            <div className="input-group">
              <label className="input-label">Duration (minutes)</label>
              <input
                className="paper-input"
                type="number"
                min="1"
                placeholder="e.g., 120"
                value={paper.duration}
                onChange={(e) =>
                  setPaper({ ...paper, duration: e.target.value })
                }
              />
              <span className="input-icon">⏱️</span>
            </div>
          </div>
          
          <div className="paper-stats">
            <div className="stat-card">
              <div className="stat-value">{questions.length}</div>
              <div className="stat-label">Total Questions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{calculateTotalMarks()}</div>
              <div className="stat-label">Total Marks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{paper.duration || 0}</div>
              <div className="stat-label">Duration (mins)</div>
            </div>
          </div>
        </div>

        <div className="questions-section">
          <div className="section-title">
            <h2>Questions</h2>
            <button className="add-question-btn" onClick={addQuestion}>
              <span>+</span> Add Question
            </button>
          </div>
          
          {questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Questions Added Yet</h3>
              <p>Click "Add Question" to start creating your question paper</p>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((q, index) => (
                <div 
                  key={index} 
                  className={`question-card ${expandedQuestion === index ? 'expanded' : ''}`}
                >
                  <div 
                    className="question-header"
                    onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                  >
                    <div className="question-info">
                      <div className="question-number">{index + 1}</div>
                      <div className="question-preview">
                        {q.question_text || "New Question (Click to edit)"}
                      </div>
                    </div>
                    
                    <div className="question-actions">
                      <button 
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveQuestion(index, "up");
                        }}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button 
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveQuestion(index, "down");
                        }}
                        disabled={index === questions.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to delete this question?")) {
                            deleteQuestion(index);
                          }
                        }}
                        title="Delete Question"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {expandedQuestion === index && (
                    <div className="question-content">
                      <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#555' }}>
                          Question Text
                        </label>
                        <textarea
                          placeholder="Enter the question here..."
                          value={q.question_text}
                          onChange={(e) =>
                            updateQuestion(index, "question_text", e.target.value)
                          }
                          autoFocus
                        />
                      </div>
                      
                      <div className="answer-row">
                        <div>
                          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#555' }}>
                            Model Answer
                          </label>
                          <textarea
                            placeholder="Enter the expected answer here..."
                            value={q.model_answer}
                            onChange={(e) =>
                              updateQuestion(index, "model_answer", e.target.value)
                            }
                          />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500', color: '#555' }}>
                            Marks
                          </label>
                          <input
                            className="marks-input"
                            type="number"
                            min="1"
                            max="100"
                            value={q.marks}
                            onChange={(e) =>
                              updateQuestion(index, "marks", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {questions.length > 0 && (
            <div className="paper-footer">
              <div className="total-marks">
                Total Marks: <span>{calculateTotalMarks()}</span>
              </div>
              
              <button 
                className="submit-btn" 
                onClick={submitPaper} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    Creating Paper...
                  </>
                ) : (
                  'Create Question Paper'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}