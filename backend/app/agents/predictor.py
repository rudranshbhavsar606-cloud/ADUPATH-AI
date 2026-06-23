from sqlalchemy.orm import Session
from app.agents.tools import get_colleges_tool, call_gemini
from app.agents.memory import get_student_context
from app import models

def process_prediction(db: Session, user_id: int, message: str) -> str:
    """Predictor Agent: Predicts colleges & branches based on student score and provides advice."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return "Please complete your Student Profile first so I have your exam scores to predict colleges."
        
    score = user.percentile if user.exam_type == "MHT-CET" else user.rank
    if score is None:
        return f"Please add your score (Percentile or Rank) for {user.exam_type} in your profile so I can make predictions."
        
    # Get matches from tool
    matches = get_colleges_tool(
        exam_type=user.exam_type,
        score=score,
        category=user.category,
        preferred_cities=user.preferred_cities
    )
    
    if not matches:
        return (
            f"Based on your {user.exam_type} score of {score} ({user.category} category), "
            f"I couldn't find matches in our current database for your preferred cities ({user.preferred_cities}). "
            f"Try widening your preferred cities or check if your score matches the typical cutoffs."
        )

    # Format matches into a structured string for Gemini
    matches_str = ""
    for idx, m in enumerate(matches, 1):
        matches_str += (
            f"{idx}. {m['college_name']} ({m['city']}) - Branch: {m['branch']} | "
            f"Admissions Prob: {m['admission_probability']} ({m['chance_percentage']}) | "
            f"Cutoff Percentile: {m['cutoff_percentile']} | Cutoff Rank: {m['cutoff_rank'] or 'N/A'} | "
            f"Avg Package: {m['average_package']} | Fees: {m['fees']}\n"
        )
        
    student_ctx = get_student_context(db, user_id)
    
    prompt = (
        f"You are the College Predictor Agent of EduPath AI. Your job is to analyze the student's profile "
        f"and the predicted college cutoffs below, then write a warm, expert college advising report.\n\n"
        f"Student Profile:\n{student_ctx}\n"
        f"Predicted College Matches:\n{matches_str}\n"
        f"User Message: {message}\n\n"
        f"Explain which colleges they have a 'High', 'Medium', or 'Low' probability of getting. "
        f"Provide specific actionable advice (e.g. branch choices, seat options, whether they should look for state CAP rounds). "
        f"Keep the tone encouraging, objective, and realistic. Use clean Markdown formatting."
    )
    
    response = call_gemini(prompt, "You are a professional engineering college admissions counselor in India.")
    
    if not response:
        # Fallback if Gemini fails or is not configured
        lines = [
            f"### College Prediction Report for {user.name}",
            f"Based on your **{user.exam_type}** score of **{score}** ({user.category} category), here are your top matches:",
            ""
        ]
        for m in matches:
            prob_color = "🟢" if m['admission_probability'] == "High" else "🟡" if m['admission_probability'] == "Medium" else "🔴"
            lines.append(
                f"- {prob_color} **{m['college_name']}**, {m['city']} - **{m['branch']}**\n"
                f"  - Admission Chance: **{m['chance_percentage']}** ({m['admission_probability']} probability)\n"
                f"  - Fees: {m['fees']} | Avg Package: {m['average_package']} (Highest: {m['highest_package']})\n"
                f"  - Cutoff: {m['cutoff_percentile']}% / Rank: {m['cutoff_rank'] or 'N/A'}"
            )
        lines.append("\n*Tip: Focus on filling 'High' chance colleges as safety choices, and 'Medium' chance colleges as targets in your preference form.*")
        response = "\n".join(lines)
        
    return response
