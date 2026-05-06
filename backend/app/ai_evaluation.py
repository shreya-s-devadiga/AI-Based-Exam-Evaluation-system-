# import os
# import json
# import google.generativeai as genai
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# if not GEMINI_API_KEY:
#     raise RuntimeError("GEMINI_API_KEY not found in .env file")

# # Configure Gemini
# genai.configure(api_key=GEMINI_API_KEY)

# model = genai.GenerativeModel("models/gemini-1.5-flash")


# def ai_evaluate_answer(question: str, student_answer: str, max_marks: int):
#     """
#     AI evaluates student answer WITHOUT a model answer.
#     Uses conceptual correctness, clarity, relevance, and completeness.
#     """

#     prompt = f"""
# You are an experienced university exam evaluator.

# Evaluate the student's answer based ONLY on:
# - Relevance to the question
# - Conceptual correctness
# - Clarity of explanation
# - Completeness

# DO NOT expect exact keywords or a model answer.
# Award marks fairly based on understanding.

# Question:
# {question}

# Student Answer:
# {student_answer}

# Maximum Marks: {max_marks}

# Respond ONLY in valid JSON format:
# {{
#   "marks": number (0 to {max_marks}),
#   "feedback": "short constructive feedback"
# }}
# """

#     try:
#         response = model.generate_content(
#             prompt,
#             generation_config={
#                 "temperature": 0.2,
#                 "max_output_tokens": 200
#             }
#         )

#         text = response.text.strip()

#         # Extract JSON safely
#         start = text.find("{")
#         end = text.rfind("}") + 1

#         if start == -1 or end == -1:
#             return {
#                 "marks": 0,
#                 "feedback": "Invalid AI response format"
#             }

#         result = json.loads(text[start:end])

#         # Safety checks
#         marks = int(result.get("marks", 0))
#         marks = max(0, min(marks, max_marks))

#         feedback = result.get("feedback", "Answer evaluated")

#         return {
#             "marks": marks,
#             "feedback": feedback
#         }

#     except Exception as e:
#         print("Gemini AI Error:", e)
#         return {
#             "marks": 0,
#             "feedback": "AI evaluation failed"
#         }


import json
import re
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def ai_evaluate_answer(question, student_answer, max_marks):
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")

        prompt = f"""
You are an exam evaluator.

Evaluate the following answer.

Question:
{question}

Student Answer:
{student_answer}

Maximum Marks: {max_marks}

IMPORTANT:
Respond with ONLY valid JSON.
No explanations. No markdown.

Format:
{{"marks": <number>, "feedback": "<short feedback>"}}
"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # 🔐 SAFE JSON EXTRACTION
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON found in response")

        result = json.loads(match.group())

        return {
            "marks": int(result.get("marks", 0)),
            "feedback": result.get("feedback", "No feedback")
        }

    except Exception as e:
        return {
            "marks": 0,
            "feedback": f"AI evaluation failed: {str(e)}"
        }