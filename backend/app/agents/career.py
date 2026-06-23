from sqlalchemy.orm import Session
from app.agents.tools import call_gemini
from app.agents.memory import get_student_context
from app import models

def process_career(db: Session, user_id: int, message: str) -> str:
    """Career Agent: Recommends engineering branches and career trajectories based on interests."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    student_ctx = get_student_context(db, user_id) if user else "No profile created."
    
    prompt = (
        f"You are the Career Agent of EduPath AI. Your goal is to guide students on which engineering branches "
        f"align with their skills and interests, explaining job prospects, future scopes, and salary ranges in India.\n\n"
        f"Student Profile:\n{student_ctx}\n"
        f"Student Query: {message}\n\n"
        f"Provide a structured, personalized recommendation outlining:\n"
        f"1. Recommended engineering branches (e.g., Computer Science, AI/ML, ECE, Robotics, Mechanical).\n"
        f"2. Alignment with student's interests and favorite subjects.\n"
        f"3. Core skills they need to develop.\n"
        f"4. Market demand, top career roles, and average salary trends (in LPA) in India.\n"
        f"Use clear formatting with Markdown tables, bold terms, and bullet points."
    )
    
    response = call_gemini(prompt, "You are a professional career counselor specializing in engineering careers.")
    
    if not response:
        # Fallback if Gemini fails or is not configured
        interests_str = user.interests.lower() if user else ""
        rec_branches = []
        
        if any(x in interests_str for x in ["ai", "ml", "data science", "python", "intelligence"]):
            rec_branches.append({
                "branch": "Computer Science (AI/ML) / Data Science",
                "scope": "Extremely high growth. Driven by automation, generative AI, and data analytics.",
                "salary": "8 - 18 LPA starting",
                "skills": ["Python", "Linear Algebra", "SQL", "Scikit-Learn / TensorFlow", "Data Wrangling"]
            })
        if any(x in interests_str for x in ["web", "dev", "app", "software", "code", "programming", "cyber"]):
            rec_branches.append({
                "branch": "Computer Science / Information Technology",
                "scope": "Consistent high demand across IT services, SaaS product startups, and fintech.",
                "salary": "6 - 15 LPA starting",
                "skills": ["Data Structures & Algorithms", "Full Stack Development", "Git", "Cloud (AWS/GCP)", "SQL/NoSQL"]
            })
        if any(x in interests_str for x in ["robot", "iot", "hardware", "chips", "sensor", "electronics"]):
            rec_branches.append({
                "branch": "Electronics & Telecommunication / Robotics & Automation",
                "scope": "Growing rapidly due to 5G rollout, IoT devices, semiconductor manufacturing policies in India, and smart factory trends.",
                "salary": "5 - 12 LPA starting",
                "skills": ["Microcontrollers (Arduino/ESP32)", "MATLAB", "Embedded C", "Circuit Simulation", "Verilog"]
            })
        if not rec_branches:  # Default/Fallback
            rec_branches.append({
                "branch": "Computer Engineering / Information Technology",
                "scope": "Excellent core tech placements and software engineering careers globally.",
                "salary": "5 - 12 LPA starting",
                "skills": ["Programming (Python/Java/C++)", "DSA", "Web Dev fundamentals", "SQL"]
            })
            rec_branches.append({
                "branch": "Mechanical Engineering / Mechatronics",
                "scope": "Steadily integrating with CAD, robotics, and Electric Vehicle (EV) technology.",
                "salary": "4 - 8 LPA starting",
                "skills": ["SolidWorks/CAD", "Thermodynamics", "Ansys Simulation", "Python for Engineering"]
            })
            
        lines = [
            f"### Career & Branch Recommendations for {user.name if user else 'Student'}",
            "Based on your registered interests and academic profile, here is a customized report:",
            ""
        ]
        for idx, rec in enumerate(rec_branches, 1):
            lines.append(f"#### {idx}. {rec['branch']}")
            lines.append(f"- **Future Scope**: {rec['scope']}")
            lines.append(f"- **Typical Starting Salary**: {rec['salary']}")
            lines.append(f"- **Key Skills to Learn**: {', '.join(rec['skills'])}")
            lines.append("")
            
        lines.append("\n*Tip: Choosing a branch that overlaps both your favorite subjects and high salary potential is generally recommended for long-term satisfaction.*")
        response = "\n".join(lines)
        
    return response
