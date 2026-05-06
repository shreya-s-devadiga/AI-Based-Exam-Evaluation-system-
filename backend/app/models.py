from jose import jwt, JWTError
from pydantic import EmailStr, BaseModel
from typing import List
from typing import Optional

class RegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    course_batch: Optional[str] = None 
    # active: bool = True   # ✅ DEFAULT ACTIVE # student or teacher

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class QuestionModel(BaseModel):
    question_text: str
    model_answer: str
    marks: int

class CreatePaperModel(BaseModel):
    subject_name: str
    subject_id: str
    duration: int
    questions: List[QuestionModel]

class StudentAnswerModel(BaseModel):
    subject_id: str
    answers: List[str]    

class UpdateUserModel(BaseModel):
    name: str
    email: EmailStr
