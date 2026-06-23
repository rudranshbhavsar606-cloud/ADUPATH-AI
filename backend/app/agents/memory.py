from sqlalchemy.orm import Session
from app import models

def get_student_context(db: Session, user_id: int) -> str:
    """Load student profile details to provide memory/context for agents."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return "Student profile is not created yet."
        
    context = (
        f"Student Name: {user.name}\n"
        f"Exam Taken: {user.exam_type}\n"
        f"Percentile Score: {user.percentile if user.percentile else 'N/A'}\n"
        f"Rank Score: {user.rank if user.rank else 'N/A'}\n"
        f"Category Quota: {user.category}\n"
        f"Preferred Cities: {user.preferred_cities}\n"
        f"Academic Interests: {user.interests}\n"
        f"Favorite Subjects: {user.favorite_subjects}\n"
    )
    return context

def get_recent_history_context(db: Session, user_id: int, limit: int = 4) -> str:
    """Retrieve recent queries and responses to help keep conversation coherent."""
    histories = db.query(models.SearchHistory).filter(
        models.SearchHistory.user_id == user_id
    ).order_by(models.SearchHistory.timestamp.desc()).limit(limit).all()
    
    if not histories:
        return "No prior search history."
        
    lines = []
    # Reverse to keep chronological order
    for hist in reversed(histories):
        lines.append(f"Student: {hist.query}")
        resp_trunc = hist.response[:150] + "..." if hist.response and len(hist.response) > 150 else hist.response
        lines.append(f"Agent: {resp_trunc}")
    
    return "\n".join(lines)
