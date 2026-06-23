from sqlalchemy.orm import Session
from app.agents.tools import generate_roadmap_tool, call_gemini
from app.agents.memory import get_student_context
from app import models

def process_study_planner(db: Session, user_id: int, message: str) -> str:
    """Study Planner Agent: Formulates learning paths, projects, and roadmaps based on branch and interests."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    # Guess branch/interest from history or profile
    branch = "Computer Engineering"
    interests = ""
    if user:
        interests = user.interests
        # Find if user has a preference or just CS
        if "ai" in interests.lower() or "ml" in interests.lower():
            branch = "Computer Science (AI/ML)"
        elif "robot" in interests.lower():
            branch = "Robotics & Automation"
        elif "mech" in interests.lower():
            branch = "Mechanical Engineering"
            
    # Check if student asked for a specific branch in the message
    msg_l = message.lower()
    if "mechanical" in msg_l:
        branch = "Mechanical Engineering"
    elif "computer" in msg_l or "cs" in msg_l:
        branch = "Computer Engineering"
    elif "electronics" in msg_l or "ece" in msg_l or "entc" in msg_l:
        branch = "Electronics & Telecommunication"
    elif "robot" in msg_l:
        branch = "Robotics & Automation"

    roadmap = generate_roadmap_tool(branch=branch, interests=interests, current_year=1)
    
    # Format the roadmap dict for Gemini context
    roadmap_str = f"Branch: {roadmap['branch']}\n"
    for yr in ["year_1", "year_2", "year_3", "year_4"]:
        y_data = roadmap.get(yr, {})
        roadmap_str += (
            f"--- {yr.upper().replace('_', ' ')}: {y_data.get('title', '')} ---\n"
            f"Description: {y_data.get('description', '')}\n"
            f"Skills: {', '.join(y_data.get('skills', []))}\n"
            f"Courses: {', '.join(y_data.get('courses', []))}\n"
            f"Projects: {', '.join(y_data.get('projects', []))}\n"
            f"Certifications: {', '.join(y_data.get('certifications', []))}\n"
        )
        
    student_ctx = get_student_context(db, user_id) if user else "No profile."
    
    prompt = (
        f"You are the Study Planner Agent of EduPath AI. A student is asking for a learning roadmap, project ideas, "
        f"or study advice. Below is their context and their default 4-year roadmap outline.\n\n"
        f"Student Context:\n{student_ctx}\n"
        f"Generated Roadmap Outline:\n{roadmap_str}\n"
        f"Student Query: {message}\n\n"
        f"Provide a friendly, motivating study plan. Explain how they should structure their semesters, "
        f"how to balance GPA with practical skills, detail some of the projects listed, and recommend specific "
        f"resources. Format with clean Markdown headers and lists."
    )
    
    response = call_gemini(prompt, "You are a senior academic tutor and technical mentor.")
    
    if not response:
        # Fallback if Gemini fails or is not configured
        lines = [
            f"### 🚀 Custom 4-Year Learning Roadmap: {branch}",
            f"Here is a year-by-year learning guide curated for your interests in **{interests or 'General Engineering'}**:",
            ""
        ]
        for yr in ["year_1", "year_2", "year_3", "year_4"]:
            y_data = roadmap.get(yr, {})
            lines.append(f"#### 📅 {yr.upper().replace('_', ' ')}: {y_data.get('title')}")
            lines.append(f"*{y_data.get('description')}*")
            lines.append(f"- 💡 **Skills to Master**: {', '.join(y_data.get('skills', []))}")
            lines.append(f"- 📚 **Recommended Courses**: {', '.join(y_data.get('courses', []))}")
            lines.append(f"- 🛠️ **Mini-Projects**: {', '.join(y_data.get('projects', []))}")
            lines.append(f"- 🏅 **Certifications**: {', '.join(y_data.get('certifications', []))}")
            lines.append("")
            
        lines.append("\n*Tip: Focus on building 1 solid project every semester rather than collecting certificates. Practical coding speaks louder than papers!*")
        response = "\n".join(lines)
        
    return response
