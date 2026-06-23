from sqlalchemy.orm import Session
from app.agents.tools import call_gemini
from app.agents.predictor import process_prediction
from app.agents.career import process_career
from app.agents.research import process_research
from app.agents.study_planner import process_study_planner
from app.agents.pdf_tutor import process_pdf_query
import logging

logger = logging.getLogger(__name__)

def route_request(db: Session, user_id: int, message: str) -> tuple[str, str]:
    """Manager Agent: Classifies user prompt and routes it to the correct specialist subagent.
    
    Returns:
        (response_text, agent_type_routed)
    """
    msg_l = message.lower()
    
    # Define rules-based fallback routing first to ensure robustness
    inferred_agent = "career"  # Default
    
    if any(k in msg_l for k in ["predict", "chance", "probability", "cutoff", "get college", "percentile", "jee", "cet", "rank"]):
        inferred_agent = "predictor"
    elif any(k in msg_l for k in ["placement", "recruit", "fee", "package", "website", "iit", "vjti", "coep", "pict", "spit", "djsce", "nit"]):
        inferred_agent = "research"
    elif any(k in msg_l for k in ["roadmap", "learn", "study", "course", "project", "semester", "year"]):
        inferred_agent = "study_planner"
    elif any(k in msg_l for k in ["pdf", "notes", "quiz", "explain", "summarize", "document"]):
        inferred_agent = "pdf_tutor"
    elif any(k in msg_l for k in ["career", "salary", "job", "branch", "recommend", "interest", "subject"]):
        inferred_agent = "career"

    # Try to use LLM for classification if key is configured
    classification_prompt = (
        f"You are the routing manager of EduPath AI. Your job is to classify the student's message into one of these categories:\n"
        f"- 'predictor': If they ask about admission probabilities, cutoffs, or which colleges they can get.\n"
        f"- 'career': If they ask about branch options, career scopes, salaries, or interest matching.\n"
        f"- 'research': If they ask about fees, placements, recruiters, or general info for a specific college.\n"
        f"- 'study_planner': If they ask for study paths, roadmaps, programming courses, or project ideas.\n"
        f"- 'pdf_tutor': If they ask about uploaded PDF notes, summary revisions, or quizzes.\n\n"
        f"Student Message: \"{message}\"\n\n"
        f"Respond with ONLY the category name in lowercase. No other punctuation or words."
    )
    
    routed_agent = call_gemini(classification_prompt)
    if routed_agent:
        cleaned = routed_agent.strip().lower()
        if cleaned in ["predictor", "career", "research", "study_planner", "pdf_tutor"]:
            inferred_agent = cleaned

    logger.info(f"Routing query '{message[:30]}...' to '{inferred_agent}' subagent")

    # Delegate execution
    if inferred_agent == "predictor":
        response = process_prediction(db, user_id, message)
    elif inferred_agent == "career":
        response = process_career(db, user_id, message)
    elif inferred_agent == "research":
        response = process_research(db, user_id, message)
    elif inferred_agent == "study_planner":
        response = process_study_planner(db, user_id, message)
    elif inferred_agent == "pdf_tutor":
        response = process_pdf_query(db, user_id, message)
    else:
        response = process_career(db, user_id, message)

    return response, inferred_agent
