import google.generativeai as genai
from app.config import settings
from app.database import SessionLocal
from app import models
import json
import logging

logger = logging.getLogger(__name__)

# Configure Gemini if key is provided
HAS_GEMINI = bool(settings.GEMINI_API_KEY)
if HAS_GEMINI:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def call_gemini(prompt: str, system_instruction: str = None) -> str:
    """Helper to query Gemini API with support for system instructions and clean fallbacks."""
    if not HAS_GEMINI:
        logger.warning("GEMINI_API_KEY not configured. Falling back to rules-based generation.")
        return ""
    
    try:
        model_name = "gemini-1.5-flash"
        if system_instruction:
            model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction
            )
        else:
            model = genai.GenerativeModel(model_name=model_name)
            
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return ""

def get_colleges_tool(exam_type: str, score: float, category: str = "General", preferred_cities: str = "") -> list:
    """Tool: Get predicted colleges matching the student score/rank."""
    db = SessionLocal()
    try:
        from app.crud import get_predictions
        percentile = score if exam_type == "MHT-CET" else None
        rank = int(score) if exam_type == "JEE" else None
        
        predictions = get_predictions(db, exam_type, percentile, rank, category, preferred_cities)
        
        # Format results for agent digestion
        formatted = []
        for p in predictions:
            c = p["college"]
            formatted.append({
                "college_name": c.name,
                "city": c.city,
                "average_package": f"{c.average_package} LPA",
                "highest_package": f"{c.highest_package} LPA",
                "fees": f"₹{c.fees:,} / yr",
                "branch": p["branch"],
                "cutoff_percentile": p["cutoff_percentile"],
                "cutoff_rank": p["cutoff_rank"],
                "admission_probability": p["admission_probability"],
                "chance_percentage": f"{p['chance_percentage']}%"
            })
        return formatted[:15]  # Return top 15 matches
    finally:
        db.close()

def get_cutoffs_tool(college_name: str) -> dict:
    """Tool: Retrieve all cutoff configurations for a college name."""
    db = SessionLocal()
    try:
        college = db.query(models.College).filter(models.College.name.ilike(f"%{college_name}%")).first()
        if not college:
            return {"error": f"College '{college_name}' not found."}
        
        cutoffs = db.query(models.Cutoff).filter(models.Cutoff.college_id == college.id).all()
        return {
            "college_name": college.name,
            "city": college.city,
            "cutoffs": [
                {
                    "branch": cut.branch,
                    "exam_type": cut.exam_type,
                    "category": cut.category,
                    "cutoff_percentile": cut.cutoff_percentile,
                    "cutoff_rank": cut.cutoff_rank
                } for cut in cutoffs
            ]
        }
    finally:
        db.close()

def get_placements_tool(college_name: str) -> dict:
    """Tool: Get detailed placement dashboard stats for a college."""
    db = SessionLocal()
    try:
        college = db.query(models.College).filter(models.College.name.ilike(f"%{college_name}%")).first()
        if not college:
            return {"error": f"College '{college_name}' not found."}
        
        # Placement metadata
        recruiters_map = {
            "coep": ["Microsoft", "Google", "Amazon", "Barclays", "Citi", "Tata Motors", "L&T"],
            "vjti": ["Morgan Stanley", "Works Applications", "Texas Instruments", "Samsung", "JPMC", "L&T"],
            "spit": ["Morgan Stanley", "JPMC", "Goldman Sachs", "Barclays", "Oracle", "Quantiphi"],
            "pict": ["PhonePe", "Mastercard", "Deutsche Bank", "SQL Star", "TCS", "Infosys"],
            "djsce": ["JPMC", "TCS", "Accenture", "Infosys", "ICICI Bank"],
            "iitb": ["Uber", "Quantbox", "Google", "Microsoft", "Tower Research", "Rubrik", "Apple"],
            "iitm": ["Jane Street", "Rubrik", "Cohesity", "Google", "Microsoft", "Jaguar Land Rover"],
            "nitt": ["Amazon", "Qualcomm", "Nvidia", "Oracle", "Paypal", "TCS"],
            "vnit": ["Nvidia", "Samsung", "Siemens", "TATA Elxsi", "L&T"]
        }
        
        short_name = college.name.lower()
        top_rec = recruiters_map.get("djsce", ["TCS", "L&T", "Infosys", "Capgemini"])  # Default fallback
        for key, val in recruiters_map.items():
            if key in short_name:
                top_rec = val
                break
                
        return {
            "college_id": college.id,
            "college_name": college.name,
            "average_package": college.average_package,
            "highest_package": college.highest_package,
            "fees": college.fees,
            "placement_ratio": "95%" if college.average_package > 15 else "91%" if college.average_package > 10 else "87%",
            "top_recruiters": top_rec
        }
    finally:
        db.close()

def generate_roadmap_tool(branch: str, interests: str = "", current_year: int = 1) -> dict:
    """Tool: Generate a detailed 4-year learning roadmap based on branch and student interests."""
    prompt = (
        f"Create a JSON 4-year study roadmap for an engineering student majoring in '{branch}' "
        f"with interests in '{interests}'. The current student is in year {current_year}.\n"
        f"Return ONLY valid JSON in this schema:\n"
        f"{{\n"
        f"  \"branch\": \"{branch}\",\n"
        f"  \"year_1\": {{\n"
        f"     \"title\": \"Programming Fundamentals\",\n"
        f"     \"description\": \"Focus on basic building blocks\",\n"
        f"     \"skills\": [\"C/C++\", \"Linux basics\"],\n"
        f"     \"courses\": [\"CS50\", \"Introduction to C\"],\n"
        f"     \"projects\": [\"Calculator App\", \"Basic CLI Database\"],\n"
        f"     \"certifications\": [\"None needed yet\"]\n"
        f"  }},\n"
        f"  \"year_2\": {{ ... }},\n"
        f"  \"year_3\": {{ ... }},\n"
        f"  \"year_4\": {{ ... }}\n"
        f"}}\n"
        f"Do not write any other text or markdown block formatting. Only JSON."
    )
    
    response_text = call_gemini(prompt, "You are a professional technical career counselor and study planner agent.")
    
    if response_text:
        try:
            # Strip potential code block markdown wrapper
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            return json.loads(clean_text.strip())
        except Exception as e:
            logger.error(f"Failed to parse LLM roadmap response: {e}")
            
    # Mock fallback if Gemini fails or is not present
    branch_lower = branch.lower()
    is_cs = "computer" in branch_lower or "information" in branch_lower or "ai" in branch_lower or "ml" in branch_lower or "software" in branch_lower
    
    if is_cs:
        return {
            "branch": branch,
            "year_1": {
                "title": "Programming & Web Fundamentals",
                "description": "Master core programming concepts and build standard algorithmic reasoning.",
                "skills": ["Python/C++", "Data Structures Basics", "HTML/CSS", "Git & GitHub"],
                "courses": ["CS50 by Harvard", "Python for Everybody (Coursera)", "Responsive Web Design (freeCodeCamp)"],
                "projects": ["Personal Portfolio Website", "Command-line Contact Manager", "Quiz Game in Python"],
                "certifications": ["freeCodeCamp Web Responsive Certification"]
            },
            "year_2": {
                "title": "DSA & Backend Development",
                "description": "Deep dive into complex Data Structures, Algorithms, Databases, and backend frameworks.",
                "skills": ["Advanced DSA", "SQL & Databases", "Node.js / Express or Django", "OOP Concepts"],
                "courses": ["DSA Specialization by UCSD (Coursera)", "Database Management Systems (NPTEL)", "The Web Developer Bootcamp (Udemy)"],
                "projects": ["E-Commerce Backend API", "Task Manager App with DB connection", "Interactive CLI Chess Game"],
                "certifications": ["AWS Certified Cloud Practitioner"]
            },
            "year_3": {
                "title": "Specialization & System Design",
                "description": "Focus on high-level specializations (AI/ML, DevOps, or Web Dev) and software engineering practices.",
                "skills": ["System Design", "Cloud Computing", "AI/ML (Scikit-Learn, TensorFlow)" if "ai" in interests.lower() else "React/Next.js & Frontend", "Docker"],
                "courses": ["Machine Learning by Andrew Ng" if "ai" in interests.lower() else "React - The Complete Guide (Udemy)", "System Design Primer"],
                "projects": ["Smart Recommendation System" if "ai" in interests.lower() else "Real-time Chat Web App", "Microservices-based User Management System"],
                "certifications": ["Google Cloud Professional Data Engineer" if "ai" in interests.lower() else "Meta Front-End Developer Certificate"]
            },
            "year_4": {
                "title": "Interview Prep & Capstone Project",
                "description": "Intense interview preparation (LeetCode, behavioral) and completion of a major capstone project.",
                "skills": ["Leetcode (Medium/Hard)", "System Architecture", "Resume Engineering", "Mock Interviewing"],
                "courses": ["Tech Interview Handbook", "Groking the Coding Interview", "Clean Code Book Studies"],
                "projects": ["Full Stack Production Grade Enterprise Application", "Open Source Contribution Portfolio"],
                "certifications": ["HashiCorp Certified Terraform Associate"]
            }
        }
    else:
        # Non-CS Engineering (Mechanical, Civil, Electrical, etc.)
        return {
            "branch": branch,
            "year_1": {
                "title": "Engineering Foundation & Design Basics",
                "description": "Establish standard engineering mathematics, physics, and basic computer graphics / CAD modeling.",
                "skills": ["AutoCAD", "C++ Programming", "Engineering Mechanics", "Calculus"],
                "courses": ["Intro to CAD (Coursera)", "Engineering Drawing (NPTEL)", "Basic C++ Series"],
                "projects": ["3D Modeling of Engine Components", "Stress-Strain Simulator Script"],
                "certifications": ["Autodesk Certified User"]
            },
            "year_2": {
                "title": "Core Theory & Simulation Tools",
                "description": "Engage with core subjects and simulate physical systems using computer-aided tools.",
                "skills": ["MATLAB / Simulink", "SolidWorks", "Thermodynamics / Circuit Analysis", "Python for Science"],
                "courses": ["SolidWorks Masterclass", "MATLAB Onramp", "Core Branch Fundamentals (NPTEL)"],
                "projects": ["Aerodynamic Wing Analysis" if "mech" in branch_lower else "Smart Grid Inverter Simulation", "Data Acquisition Logger in Python"],
                "certifications": ["Certified SolidWorks Associate (CSWA)"]
            },
            "year_3": {
                "title": "Advanced Application & Systems",
                "description": "Specialise in domain subfields, study automation, and work on experimental prototypes.",
                "skills": ["Ansys / FEA", "Microcontrollers (Arduino/Raspberry Pi)", "LabVIEW", "IoT integrations"],
                "courses": ["Finite Element Method (FEA)", "Embedded Systems (NPTEL)"],
                "projects": ["Self-Balancing Robot with Arduino", "Structural Analysis of Bridge Frame", "Automated Irrigation System"],
                "certifications": ["Ansys Associate Certification"]
            },
            "year_4": {
                "title": "Capstone Projects & Industrial Entry",
                "description": "Optimize skills for placement exams, prepare industry portfolios, and finish graduation projects.",
                "skills": ["Project Management", "Industrial Automation", "Six Sigma", "Technical Writing"],
                "courses": ["Project Management Principles", "Preparation for GATE/Campus Placements"],
                "projects": ["Hybrid Vehicle Chassis Design", "Smart Industrial PLC Automation Panel"],
                "certifications": ["Six Sigma Green Belt"]
            }
        }

def summarize_pdf_tool(pdf_text: str) -> dict:
    """Tool: Summarize parsed PDF text and generate study materials."""
    if len(pdf_text) > 8000:
        pdf_text = pdf_text[:8000] + "\n...[truncated for limits]..."
        
    prompt = (
        f"You are a study tutor helper. Below is the text extracted from a student study note. "
        f"Analyze the text and output a JSON object containing the summary, 4-5 key points, and 4-5 revision notes.\n"
        f"Text:\n{pdf_text}\n\n"
        f"Return ONLY valid JSON in this schema:\n"
        f"{{\n"
        f"  \"summary\": \"A short 3-sentence summary of the document.\",\n"
        f"  \"key_points\": [\"Point 1\", \"Point 2\", ...],\n"
        f"  \"revision_notes\": [\"Rev Note 1\", \"Rev Note 2\", ...]\n"
        f"}}\n"
        f"Do not write any markdown code block wrapper or conversational text. Just raw JSON."
    )
    
    response_text = call_gemini(prompt, "You are a professional student academic advisor and study tutor.")
    
    if response_text:
        try:
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            return json.loads(clean_text.strip())
        except Exception as e:
            logger.error(f"Failed to parse LLM PDF summary: {e}")
            
    # Mock fallback summary
    return {
        "summary": "This document contains student lecture notes on engineering subjects, highlighting key formulas, conceptual explanations, and structural principles.",
        "key_points": [
            "Covers fundamental concepts and standard technical terminology.",
            "Illustrates the applications of core laws in real-world scenarios.",
            "Lists step-by-step methodologies to solve standard equations.",
            "Emphasizes system constraints and performance parameters."
        ],
        "revision_notes": [
            "Review the definitions of the primary variables and units.",
            "Re-solve the numerical examples detailed in the text.",
            "Remember key constraints, safety margins, and edge cases.",
            "Practice diagrammatic representations of system structures."
        ]
    }
