from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"

client = MongoClient(MONGO_URL)
db = client["ai_exam_system"]

users_collection = db["users"]
papers_collection = db["question_papers"]
answers_collection = db["student_answers"] 
