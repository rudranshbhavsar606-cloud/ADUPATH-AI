from app.agents.tools import call_gemini
import json
import logging

logger = logging.getLogger(__name__)

# Simple in-memory storage for uploaded PDF content
pdf_cache = {}  # Format: {user_id: {"filename": str, "text": str}}

def set_pdf_content(user_id: int, filename: str, text: str):
    pdf_cache[user_id] = {"filename": filename, "text": text}

def get_pdf_content(user_id: int) -> dict:
    return pdf_cache.get(user_id, {})

def process_pdf_query(user_id: int, question: str) -> str:
    """PDF Tutor Agent: Answers student questions based on the uploaded notes context."""
    pdf_data = get_pdf_content(user_id)
    if not pdf_data or not pdf_data.get("text"):
        return "I don't have any uploaded study notes in my memory. Please upload a PDF file first in the PDF Tutor tab!"
        
    pdf_text = pdf_data["text"]
    if len(pdf_text) > 8000:
        pdf_text = pdf_text[:8000] + "\n...[truncated]..."

    prompt = (
        f"You are the PDF Tutor Agent of EduPath AI. Below is the text of the study notes uploaded by the student. "
        f"Answer the student's question based strictly on this text. If the answer is not present, use your general knowledge "
        f"but mention that it is not explicitly stated in the document.\n\n"
        f"Study Note Text ({pdf_data['filename']}):\n{pdf_text}\n\n"
        f"Student Question: {question}\n\n"
        f"Give a clear, educational, and structured explanation using Markdown. Highlight formulas, equations, or key terms."
    )
    
    response = call_gemini(prompt, "You are a professional university professor and academic tutor.")
    
    if not response:
        # Fallback if Gemini is not configured
        # Try a primitive keyword search
        matches = []
        words = question.lower().split()
        lines = pdf_text.split('\n')
        for line in lines:
            if any(w in line.lower() for w in words if len(w) > 3):
                matches.append(line.strip())
                if len(matches) >= 3:
                    break
        
        if matches:
            response = (
                f"### Answer from {pdf_data['filename']} (Fallback Search)\n\n"
                f"Here are some relevant excerpts found in your document:\n\n" + 
                "\n".join([f"- *{m}*" for m in matches]) + 
                f"\n\n*Note: To receive full comprehensive explanations, please configure a valid `GEMINI_API_KEY` in the backend.*"
            )
        else:
            response = (
                f"### PDF Tutor Response\n\n"
                f"I processed your note **{pdf_data['filename']}** (size: {len(pdf_data['text'])} chars). "
                f"However, I couldn't find a direct keyword match for your question: *\"{question}\"*.\n\n"
                f"*Please configure a `GEMINI_API_KEY` to unlock AI-based RAG searching!*"
            )
            
    return response

def generate_quiz_from_pdf(pdf_text: str) -> list:
    """Calls Gemini to parse note text and output a structured list of multiple choice questions (JSON)."""
    if len(pdf_text) > 6000:
        pdf_text = pdf_text[:6000]
        
    prompt = (
        f"Based on the following lecture notes, generate a quiz of 3-4 Multiple Choice Questions (MCQs).\n"
        f"Notes:\n{pdf_text}\n\n"
        f"Return ONLY a JSON list in this exact schema, without markdown formatting:\n"
        f"[\n"
        f"  {{\n"
        f"     \"id\": 1,\n"
        f"     \"question\": \"Question text?\",\n"
        f"     \"options\": [\n"
        f"        {{\"option_id\": \"A\", \"text\": \"Option A content\"}},\n"
        f"        {{\"option_id\": \"B\", \"text\": \"Option B content\"}},\n"
        f"        {{\"option_id\": \"C\", \"text\": \"Option C content\"}},\n"
        f"        {{\"option_id\": \"D\", \"text\": \"Option D content\"}}\n"
        f"     ],\n"
        f"     \"correct_option\": \"A\",\n"
        f"     \"explanation\": \"Detailed explanation of why A is correct.\"\n"
        f"  }},\n"
        f"  ... \n"
        f"]\n"
        f"Ensure options are distinct. Do not output anything other than raw JSON."
    )
    
    response_text = call_gemini(prompt, "You are a professional quiz maker.")
    
    if response_text:
        try:
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            return json.loads(clean_text.strip())
        except Exception as e:
            logger.error(f"Failed to parse LLM quiz JSON: {e}")
            
    # Mock fallback quiz
    return [
        {
            "id": 1,
            "question": "What is the primary role of a compilation process in high-level programming?",
            "options": [
                {"option_id": "A", "text": "To interpret code line-by-line during runtime"},
                {"option_id": "B", "text": "To translate high-level code into executable machine code"},
                {"option_id": "C", "text": "To upload executable binary files to a server"},
                {"option_id": "D", "text": "To design user-friendly UI/UX mockups"}
            ],
            "correct_option": "B",
            "explanation": "Compilers translate the entire source code written in a high-level language into machine code (object code) in one go, producing an executable file."
        },
        {
            "id": 2,
            "question": "Which data structure operates on a Last-In, First-Out (LIFO) model?",
            "options": [
                {"option_id": "A", "text": "Queue"},
                {"option_id": "B", "text": "Linked List"},
                {"option_id": "C", "text": "Stack"},
                {"option_id": "D", "text": "Binary Search Tree"}
            ],
            "correct_option": "C",
            "explanation": "A stack is a linear data structure that follows the LIFO principle, where elements are inserted (pushed) and removed (popped) from the same end."
        },
        {
            "id": 3,
            "question": "Why is Big O notation used in computational complexity analysis?",
            "options": [
                {"option_id": "A", "text": "To count the exact number of seconds a script runs"},
                {"option_id": "B", "text": "To calculate memory usage in megabytes precisely"},
                {"option_id": "C", "text": "To describe the upper bound performance scaling of an algorithm"},
                {"option_id": "D", "text": "To identify syntax errors in compiler design"}
            ],
            "correct_option": "C",
            "explanation": "Big O notation describes the worst-case time or space complexity of an algorithm, showing how resource requirements grow relative to input size."
        }
    ]
