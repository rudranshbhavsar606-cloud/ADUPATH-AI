from sqlalchemy.orm import Session
from app.agents.tools import get_placements_tool, get_cutoffs_tool, call_gemini
from app import models
import re

def process_research(db: Session, user_id: int, message: str) -> str:
    """Research Agent: Provides detailed facts, figures, fees, and placements for a specified college."""
    # Attempt to extract college name from query
    college_name = ""
    
    # Simple regex search for popular colleges
    colleges = db.query(models.College).all()
    for col in colleges:
        # Check if user mentioned the college acronym or short name
        words = re.findall(r'\b\w+\b', col.name.lower())
        short_names = [w for w in words if len(w) >= 3]
        short_names.append(col.name.split(",")[0].lower())
        
        # Add acronyms manually for ease
        acronyms = {
            "coep": "coep",
            "vjti": "vjti",
            "spit": "spit",
            "pict": "pict",
            "djsce": "djsce",
            "iitb": "iit bombay",
            "iitm": "iit madras",
            "nitt": "nit trichy",
            "vnit": "vnit"
        }
        for acr, full in acronyms.items():
            if acr in col.name.lower():
                short_names.append(acr)
                
        if any(s in message.lower() for s in short_names):
            college_name = col.name
            break

    if not college_name:
        # Default fallback to first matched or general search
        words = message.lower().split()
        for w in words:
            if len(w) > 3:
                matched = db.query(models.College).filter(models.College.name.ilike(f"%{w}%")).first()
                if matched:
                    college_name = matched.name
                    break

    if not college_name:
        return (
            "I can help you research specific engineering colleges (e.g. VJTI, COEP, PICT, SPIT, IIT Bombay, NIT Trichy). "
            "Which college would you like to know more about? Please mention its name clearly."
        )

    # Gather data using tools
    placement_info = get_placements_tool(college_name)
    cutoff_info = get_cutoffs_tool(college_name)
    
    if "error" in placement_info:
        return f"Could not find detailed research data for college matching '{college_name}'."

    # Format info for Gemini
    data_summary = (
        f"College Name: {placement_info['college_name']}\n"
        f"Fees: ₹{placement_info['fees']:,} / yr\n"
        f"Average Package: {placement_info['average_package']} LPA\n"
        f"Highest Package: {placement_info['highest_package']} LPA\n"
        f"Placement Ratio: {placement_info['placement_ratio']}\n"
        f"Top Recruiters: {', '.join(placement_info['top_recruiters'])}\n"
    )
    
    if "cutoffs" in cutoff_info:
        data_summary += "Cutoffs Sample:\n"
        for cut in cutoff_info["cutoffs"][:6]:  # Limit sample size
            data_summary += f"- Branch: {cut['branch']} | Exam: {cut['exam_type']} | Category: {cut['category']} | Cutoff: {cut['cutoff_percentile']}% (Rank {cut['cutoff_rank'] or 'N/A'})\n"

    prompt = (
        f"You are the Research Agent of EduPath AI. A student has asked a question about a college. "
        f"Using the verified database facts below, answer their query comprehensively.\n\n"
        f"Database College Facts:\n{data_summary}\n"
        f"Student Query: {message}\n\n"
        f"Provide a clear, detailed overview of the college, highlighting its placements, recruiters, fee structure, "
        f"and typical cutoffs. Compare it briefly with standard colleges if appropriate. Use clean Markdown styling."
    )
    
    response = call_gemini(prompt, "You are an academic database research specialist.")
    
    if not response:
        # Fallback if Gemini fails or is not configured
        lines = [
            f"### College Research Profile: {placement_info['college_name']}",
            "",
            f"**Location**: {cutoff_info.get('city', 'Maharashtra')}",
            f"- 💰 **Annual Tuition Fees**: ₹{placement_info['fees']:,}",
            f"- 📈 **Placement Rate**: ~{placement_info['placement_ratio']}",
            f"- 💼 **Average Package**: {placement_info['average_package']} LPA",
            f"- 🚀 **Highest Package**: {placement_info['highest_package']} LPA",
            f"- 🤝 **Key recruiters**: {', '.join(placement_info['top_recruiters'])}",
            "",
            "#### Typical Cutoffs:"
        ]
        for cut in cutoff_info.get("cutoffs", [])[:4]:
            lines.append(f"- **{cut['branch']}** ({cut['exam_type']}): Cutoff {cut['cutoff_percentile']}% (Rank: {cut['cutoff_rank'] or 'N/A'}) for {cut['category']} Quota")
            
        lines.append("\n*Tip: Let me know if you would like to compare this college with another, or save it to your bookmarks.*")
        response = "\n".join(lines)
        
    return response
