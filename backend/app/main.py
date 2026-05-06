import token
from fastapi import Body, FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from .email_utils import send_email
import re
from .ai_evaluation import ai_evaluate_answer

import subprocess


from dotenv import load_dotenv
import os
import requests
import json
import google.generativeai as genai

load_dotenv()

# delete this below line
print(os.getenv("GEMINI_API_KEY"))


app = FastAPI()
# ---------------- CORS ----------------
class UpdateUserModel(BaseModel):
    name: str
    email: EmailStr 

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from .database import (
    users_collection,
    papers_collection,
    answers_collection
)
from .models import (
    RegisterModel,
    LoginModel,
    CreatePaperModel,
    StudentAnswerModel
)
from .auth import (
    hash_password,
    verify_password,
    create_token,
    SECRET_KEY,
    ALGORITHM
)



# ---------------- CORS ----------------






# ---------------- REGISTER ----------------
from fastapi import HTTPException

@app.post("/register")
def register(user: RegisterModel):
    email = user.email.lower()
    role = user.role.lower()

    # 🔹 Check if user already exists
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="User already exists")

    # 🔹 Validate course/batch ONLY for students
    if role == "student":
        if not user.course_batch or not user.course_batch.strip():
            raise HTTPException(
                status_code=400,
                detail="Course / Batch is required for students"
            )

    # 🔹 Prepare data to insert
    user_data = {
        "name": user.name,
        "email": email,
        "password": hash_password(user.password),
        "role": role
    }

    # 🔹 Add course_batch only if present
    if role == "student":
        user_data["course_batch"] = user.course_batch.strip()

    # 🔹 Insert into MongoDB
    users_collection.insert_one(user_data)

    return {"message": "Registration successful"}


# ---------------- LOGIN ----------------
@app.post("/login")
def login(user: LoginModel):
    email = user.email.lower()
    db_user = users_collection.find_one({"email": email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "email": email,
        "role": db_user["role"]
    })

    return {
        "access_token": token,
        "role": db_user["role"]
    }


# ---------------- TEACHER DASHBOARD ----------------
@app.get("/teacher/dashboard")
def teacher_dashboard(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


    if payload.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Access denied")

    return {"message": "Welcome to Teacher Dashboard"}


# ---------------- CREATE QUESTION PAPER ----------------
@app.post("/teacher/create-paper")
def create_question_paper(data: CreatePaperModel, token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers allowed")

    papers_collection.insert_one({
        "teacher_email": payload["email"].lower(),
        "subject_name": data.subject_name,
        "subject_id": data.subject_id,
        "duration": data.duration,
        "status": "draft",
        "questions": [q.dict() for q in data.questions]
    })

    return {"message": "Question paper created successfully"}


# ---------------- VIEW TEACHER PAPERS ----------------
@app.get("/teacher/papers")
def get_teacher_papers(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied")

    return list(
        papers_collection.find(
            {"teacher_email": payload["email"].lower()},
            {"_id": 0}
        )
    )
# ---------------- VIEW SINGLE TEACHER PAPER view ----------------
@app.get("/teacher/paper/{subject_id}")
def view_teacher_paper(subject_id: str, token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied")

    paper = papers_collection.find_one(
        {
            "teacher_email": payload["email"].lower(),
            "subject_id": subject_id
        },
        {"_id": 0}
    )

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    return paper


# ---------------- PUBLISH QUESTION PAPER ----------------
@app.put("/teacher/publish-paper")
def publish_paper(subject_id: str, token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied")

    paper = papers_collection.find_one({
        "teacher_email": payload["email"].lower(),
        "subject_id": subject_id
    })

    if not paper:
        raise HTTPException(status_code=404, detail="Question paper not found")

    # 1️⃣ Publish the paper
    papers_collection.update_one(
        {"_id": paper["_id"]},
        {"$set": {"status": "published"}}
    )

    # 2️⃣ Fetch all students
    students = users_collection.find({"role": "student"})

    # 3️⃣ Send email notification ONCE
    for student in students:
        send_email(
            student["email"],
            "📢 New Exam Published",
            f"""
Hello {student['name']},

A new exam has been published.

📘 Subject: {paper['subject_name']}
⏱ Duration: {paper['duration']} minutes

Please login and attempt the exam.

All the best!
"""
        )

    return {"message": "Question paper published and students notified by email"}



# ---------------- STUDENT DASHBOARD ----------------
@app.get("/student/papers")
def get_published_papers(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    # 🔹 ADD: get student email
    student_email = payload["email"].lower()

    # 🔹 ADD: fetch student's course/batch
    student = users_collection.find_one(
        {"email": student_email},
        {"_id": 0, "course_batch": 1}
    )

    if not student or not student.get("course_batch"):
        raise HTTPException(
            status_code=400,
            detail="Student course/batch not assigned"
        )

    course_batch = student["course_batch"]

    # 🔹 ADD: filter papers by batch
    return list(
        papers_collection.find(
            {
                "status": "published",
                "target_batch": course_batch   # ✅ ONLY THIS FILTER ADDED
            },
            {"_id": 0}
        )
    )


# ---------------- GET SINGLE PAPER ----------------
@app.get("/student/paper/{subject_id}")
def get_single_paper(subject_id: str, token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    paper = papers_collection.find_one(
        {"subject_id": subject_id, "status": "published"},
        {"_id": 0}
    )

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    return paper


# ---------------- SUBMIT EXAM ----------------
@app.post("/student/submit-exam")
def submit_exam(data: StudentAnswerModel, token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    # if payload["role"] != "student":
    if payload["role"] not in ["student", "teacher"]:
        raise HTTPException(status_code=403, detail="Access denied")

    email = payload["email"].lower()

    paper = papers_collection.find_one({
        "subject_id": data.subject_id,
        "status": "published"
    })

    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    evaluation = []
    total_marks = 0

    for i, q in enumerate(paper["questions"]):
        student_answer = data.answers[i] if i < len(data.answers) else ""

        try:
            ai_result = ai_evaluate_answer(
            question=q["question_text"],
            student_answer=student_answer,
            max_marks=q["marks"]
            )
        except Exception as e:
            raise HTTPException(
            status_code=500,
            detail=f"AI Evaluation failed: {str(e)}"
            )

        evaluation.append({
            "question": q["question_text"],
            "student_answer": student_answer,
            "marks_awarded": ai_result["marks"],
            "max_marks": q["marks"],
            "feedback": ai_result["feedback"]
        })

        total_marks += ai_result["marks"]

    answers_collection.insert_one({
        "student_email": email,
        "subject_id": data.subject_id,
        "evaluation": evaluation,
        "total_marks": total_marks,
        "status": "evaluated"
    })

    return {
        "message": "Exam submitted & evaluated successfully",
        "total_marks": total_marks
    }

# test ai evaluation without any db or authorization - delte this later

@app.post("/test/ai-evaluate")
def test_ai_evaluate(
        question: str = Body(...),
        answer: str = Body(...),
        max_marks: int = Body(5)
):
    try:
        result = ai_evaluate_answer(
        question=question,
        student_answer=answer,
        max_marks=max_marks
    )
        return {
        "status": "success",
        "evaluation": result
    }
    except Exception as e:
        raise HTTPException(
        status_code=500,
        detail=f"Gemini evaluation failed: {str(e)}"
    )



# ---------------- STUDENT RESULTS ----------------
@app.get("/student/results")
def get_student_results(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    email = payload["email"].lower()

    answers = list(
        answers_collection.find(
            {"student_email": email},
            {"_id": 0}
        )
    )

    results = []

    for a in answers:
        paper = papers_collection.find_one(
            {"subject_id": a["subject_id"]},
            {"_id": 0, "subject_name": 1}
        )

        max_marks = sum(e["max_marks"] for e in a.get("evaluation", []))
        total = a.get("total_marks", 0)
        percentage = round((total / max_marks) * 100, 2) if max_marks else 0

        results.append({
            "subject_id": a["subject_id"],
            "subject_name": paper["subject_name"] if paper else "N/A",
            "marks": total,
            "max_marks": max_marks,
            "percentage": percentage,
            "status": a.get("status", "evaluated")
        })

    return results





# ---------------- STUDENT PROFILE ----------------
@app.get("/student/profile")
def get_student_profile(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "student":
        raise HTTPException(status_code=403, detail="Access denied")

    user = users_collection.find_one(
        {"email": payload["email"].lower()},
        {"_id": 0, "name": 1, "email": 1}
    )

    return user

# ---------------- TEACHER ANALYTICS ----------------
@app.get("/teacher/analytics")
def teacher_analytics(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied")

    teacher_email = payload["email"].lower()

    papers = list(
        papers_collection.find(
            {"teacher_email": teacher_email},
            {"_id": 0, "subject_id": 1, "subject_name": 1}
        )
    )

    subject_map = {
        p["subject_id"]: p["subject_name"]
        for p in papers
    }

    subject_ids = list(subject_map.keys())

    answers = list(
        answers_collection.find(
            {"subject_id": {"$in": subject_ids}},
            {
                "_id": 0,
                "student_email": 1,
                "subject_id": 1,
                "total_marks": 1,
                "evaluation": 1
            }
        )
    )

    details = []

    for a in answers:
        evaluation = a.get("evaluation", [])

        max_marks = sum(
            q.get("max_marks", 0)
            for q in evaluation
        )

        marks_obtained = a.get("total_marks", 0)
        percentage = (marks_obtained / max_marks) * 100 if max_marks else 0

        details.append({
            "student_name": a["student_email"].split("@")[0].title(),
            "student_email": a["student_email"],   # ✅ REQUIRED
            "subject_id": a["subject_id"],         # ✅ INTERNAL
            "subject_name": subject_map.get(a["subject_id"], "N/A"),  # ✅ DISPLAY
            "max_marks": max_marks,
            "marks_obtained": marks_obtained,
            "result": "Pass" if percentage >= 40 else "Fail"
        })

    details.sort(key=lambda x: x["marks_obtained"], reverse=True)
    for i, d in enumerate(details):
        d["rank"] = i + 1

    return {
        "details": details,
        "total_submissions": len(details)
    }


# ---------------- VIEW STUDENT ANSWER SHEET ----------------
@app.get("/teacher/student-answer")
def view_student_answer(student_email: str, subject_name: str, token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Access denied")

    student_email = student_email.lower().strip()
    subject_name = subject_name.strip()

    # 🔹 Step 1: Find subject (try ID first, then name)
    paper = papers_collection.find_one(
        {"subject_id": subject_name},
        {"subject_id": 1}
    )

    if not paper:
        paper = papers_collection.find_one(
            {"subject_name": {"$regex": f"^{subject_name}$", "$options": "i"}},
            {"subject_id": 1}
        )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Subject not found"
        )

    subject_id = paper["subject_id"]

    # 🔹 Step 2: Find ONLY THIS student's answer
    answer = answers_collection.find_one(
        {
            "student_email": student_email,
            "subject_id": subject_id
        },
        {"_id": 0}
    )

    if not answer:
        raise HTTPException(
            status_code=404,
            detail="This student has not submitted the exam for this subject"
        )

    return answer

# ---------------- ADMIN: VIEW ALL USERS ----------------
from fastapi import Header, HTTPException
import jwt

@app.get("/admin/users")
def get_users(
    authorization: str = Header(None),
    course_batch: str | None = None   # ✅ optional filter
):
    # 🔐 Authorization check
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    # 🔍 Build query
    query = {}
    if course_batch:
        query["course_batch"] = course_batch

    # 📥 Fetch users (hide password)
    users = list(
        users_collection.find(
            query,
            {
                "_id": 0,
                "name": 1,
                "email": 1,
                "role": 1,
                "course_batch": 1   # ✅ ADDED
            }
        )
    )

    return users

#
@app.get("/admin/students-by-batch")
def students_by_batch(course_batch: str):
    students = list(
        users_collection.find(
            {
                "role": "student",
                "course_batch": course_batch
            },
            {"password": 0}
        )
    )

    for s in students:
        s["_id"] = str(s["_id"])

    return students


# ---------------- ADMIN: DELETE USER ----------------
@app.delete("/admin/delete-user")
def delete_user(
    email: str,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    email = email.strip()

    # 🔥 CASE-INSENSITIVE EMAIL MATCH
    user = users_collection.find_one({
        "email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}
    })

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # delete using actual stored email
    stored_email = user["email"]

    users_collection.delete_one({"email": stored_email})
    answers_collection.delete_many({"student_email": stored_email})
    papers_collection.delete_many({"teacher_email": stored_email})

    return {"message": "User deleted successfully"}


# ---------------- ADMIN: UPDATE USER ----------------
@app.put("/admin/update-user/{old_email}")
def update_user(
    old_email: str,
    data: UpdateUserModel,
    authorization: str = Header(...)
):
    # 🔐 Token validation
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    # 🔒 Admin-only access
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    # 🔍 Check user exists
    user = users_collection.find_one({"email": old_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🚫 Prevent duplicate email
    if data.email.lower() != old_email:
        if users_collection.find_one({"email": data.email.lower()}):
            raise HTTPException(status_code=400, detail="Email already exists")

    # 🧩 Prepare update data
    update_data = {
        "name": data.name.strip(),
        "email": data.email.lower()
    }

    # ✅ Update course_batch ONLY for students
    if user.get("role") == "student" and data.course_batch:
        update_data["course_batch"] = data.course_batch.strip()

    users_collection.update_one(
        {"email": old_email},
        {"$set": update_data}
    )

    return {"message": "User updated successfully"}

# ---------------- ADMIN: VIEW PUBLISHED PAPERS ----------------
# ---------------- ADMIN: PUBLISH PAPER ----------------
@app.get("/admin/published-papers")
def get_published_papers(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    papers = list(
        papers_collection.find(
            {},
            {
                "_id": 0,
                "subject_id": 1,
                "subject_name": 1,
                "teacher_email": 1,
                "questions": 1,
                "status": 1,
                "target_batch": 1
            }
        )
    )

    return [
        {
            "subject_id": p["subject_id"],
            "subject_name": p["subject_name"],
            "teacher_email": p["teacher_email"],
            "status": p.get("status", "draft"),
            "target_batch": p.get("target_batch"),
            "total_questions": len(p.get("questions", []))
        }
        for p in papers
    ]

@app.put("/admin/publish-paper/{subject_id}")
def publish_paper(
    subject_id: str,
    data: dict,
    authorization: str = Header(...)
):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    if not data.get("course_batch"):
        raise HTTPException(status_code=400, detail="Course batch is required")

    result = papers_collection.update_one(
        {"subject_id": subject_id},
        {"$set": {
            "status": "published",
            "target_batch": data["course_batch"],
            "published_by": payload.get("email")
        }}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Paper not found")

    return {"message": "Paper published successfully"}

















