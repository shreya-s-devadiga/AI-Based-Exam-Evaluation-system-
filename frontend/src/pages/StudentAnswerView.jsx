import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function StudentAnswerView() {
  const { subject_name, student_email } = useParams();
  const navigate = useNavigate();

  const [answerSheet, setAnswerSheet] = useState(null);

  useEffect(() => {
    fetchAnswer();
  }, []);

  const fetchAnswer = async () => {
    try {
      const res = await API.get("/teacher/student-answer", {
        params: {
          subject_name,
          student_email,
          token: localStorage.getItem("token")
        }
      });
      setAnswerSheet(res.data);
    } catch {
      alert("Unable to load student answer sheet");
      navigate(-1);
    }
  };

  if (!answerSheet) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Student Answer Sheet (AI Evaluated)</h2>

      <p><b>Student:</b> {student_email}</p>
      <p><b>Subject:</b> {subject_name}</p>

      <hr />

      {answerSheet.evaluation.map((q, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 6,
            marginBottom: 12
          }}
        >
          <p><b>Q{i + 1}:</b> {q.question}</p>

          {/* ✅ AI evaluated student answer */}
          <p><b>Student Answer:</b> {q.student_answer}</p>

          {/* ✅ AI marks */}
          <p><b>Marks:</b> {q.marks_awarded} / {q.max_marks}</p>

          {/* ✅ AI feedback */}
          <p><b>AI Feedback:</b> {q.feedback}</p>
        </div>
      ))}

      <button onClick={() => navigate(-1)}>⬅ Back</button>
    </div>
  );
}
