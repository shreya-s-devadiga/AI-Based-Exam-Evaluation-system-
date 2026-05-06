import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreatePaper from "./pages/CreatePaper";
import StudentDashboard from "./pages/StudentDashboard";
import StudentExam from "./pages/StudentExam";
import StudentResults from "./pages/StudentResults";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import PaperView from "./pages/PaperView";
import StudentAnswerView from "./pages/StudentAnswerView";
import AdminDashboard from "./pages/AdminDashboard";






export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/create-paper" element={<CreatePaper />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/exam/:subject_id" element={<StudentExam />} />
        <Route path="/student-results" element={<StudentResults />} />
        <Route path="/teacher-analytics" element={<TeacherAnalytics />} />
        <Route path="/paper/:subject_id" element={<PaperView />} />
        <Route
         path="/teacher/answer/:subject_name/:student_email"
  element={<StudentAnswerView />}
/>

<Route path="/admin" element={<AdminDashboard />} />





        


      </Routes>
    </BrowserRouter>
  );
}
